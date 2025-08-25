import express from 'express';
import { pageViewSchema } from '../utils/validation';
import { AnalyticsService } from '../services/analyticsService';

const router = express.Router();

// Rate limiting map for page view recording
const rateLimitMap = new Map<string, { count: number; firstRequest: Date }>();

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now.getTime() - data.firstRequest.getTime() > 300000) { // 5 minutes
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

/**
 * Extract client IP address from request
 */
function getClientIP(req: express.Request): string | null {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    (req.socket as any)?.remoteAddress ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    (req.headers['cf-connecting-ip'] as string) ||
    null
  );
}

/**
 * Simple rate limiting
 */
function isRateLimited(ip: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  if (!ip) return false;
  
  const now = new Date();
  const ipData = rateLimitMap.get(ip);
  
  if (!ipData) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  // Reset if window has passed
  if (now.getTime() - ipData.firstRequest.getTime() > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  // Increment count
  ipData.count++;
  
  return ipData.count > maxRequests;
}

/**
 * Validate page path
 */
function isValidPagePath(page: string): boolean {
  if (!page || typeof page !== 'string' || page.length > 500) {
    return false;
  }
  
  if (!page.startsWith('/')) {
    return false;
  }
  
  // Block certain paths
  const blockedPaths = ['/api/', '/uploads/', '/favicon.ico', '/robots.txt', '/admin', '/login'];
  return !blockedPaths.some(blocked => 
    page === blocked || page.startsWith(blocked + '/') || page.startsWith(blocked + '?')
  );
}

/**
 * Record a page view (public endpoint)
 * POST /api/page-views
 */
router.post('/', async (req, res) => {
  try {
    const { error, value } = pageViewSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { page, userId, userAgent, platform = 'web' } = value;
    
    // Validate page path - just skip invalid pages silently
    if (!isValidPagePath(page)) {
      return res.status(200).json({ 
        success: true,
        message: 'Page view filtered' 
      });
    }
    
    // Extract IP address
    const ipAddress = getClientIP(req);
    
    // Rate limiting
    if (ipAddress && isRateLimited(ipAddress)) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const pageView = await AnalyticsService.recordPageView({
      page,
      userId,
      ipAddress,
      userAgent,
      platform,
    });

    if (!pageView) {
      // Page was filtered out (e.g., admin page)
      return res.status(200).json({
        success: true,
        message: 'Page view filtered',
      });
    }

    res.status(201).json({
      success: true,
      id: pageView.id,
    });
  } catch (error) {
    console.error('Record page view error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
