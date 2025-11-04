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
 * DEPRECATED: This endpoint is no longer used.
 * We now only track app/website opens via POST /api/analytics/app-open
 * This is kept for backward compatibility only.
 * 
 * POST /api/page-views
 */
router.post('/', async (req, res) => {
  // No-op - return success for backward compatibility
  res.status(200).json({
    success: true,
    message: 'Page view tracking deprecated. Use /api/analytics/app-open instead.',
  });
});

export default router;
