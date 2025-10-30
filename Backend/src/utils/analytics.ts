import { Request } from 'express';

/**
 * Extract client IP address from request
 */
export function getClientIP(req: Request): string | null {
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    (req.socket as any)?.remoteAddress ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    (req.headers['cf-connecting-ip'] as string) || // Cloudflare
    (req.headers['x-client-ip'] as string) ||
    null
  );
}

/**
 * Get user agent from request
 */
export function getUserAgent(req: Request): string | null {
  return (req.headers['user-agent'] as string) || null;
}

/**
 * Rate limiting helper - check if IP has made too many requests recently
 */
export function isRateLimited(
  ipCounts: Map<string, { count: number; firstRequest: Date }>,
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = new Date();
  const ipData = ipCounts.get(ip);
  
  if (!ipData) {
    ipCounts.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  // Reset if window has passed
  if (now.getTime() - ipData.firstRequest.getTime() > windowMs) {
    ipCounts.set(ip, { count: 1, firstRequest: now });
    return false;
  }
  
  // Increment count
  ipData.count++;
  
  return ipData.count > maxRequests;
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimitMap(
  ipCounts: Map<string, { count: number; firstRequest: Date }>,
  windowMs: number = 60000
): void {
  const now = new Date();
  for (const [ip, data] of ipCounts.entries()) {
    if (now.getTime() - data.firstRequest.getTime() > windowMs) {
      ipCounts.delete(ip);
    }
  }
}

/**
 * Check if a page path is valid/allowed for tracking
 */
export function isValidPagePath(page: string): boolean {
  // Basic validation
  if (!page || typeof page !== 'string' || page.length > 500) {
    return false;
  }
  
  // Must start with /
  if (!page.startsWith('/')) {
    return false;
  }
  
  // Block certain paths that we don't want to track
  const blockedPaths = [
    '/api/',
    '/uploads/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/.well-known/',
  ];
  
  return !blockedPaths.some(blocked => page.startsWith(blocked));
}

/**
 * Normalize page path for consistent tracking
 */
export function normalizePagePath(page: string): string {
  // Remove trailing slashes except for root
  if (page.length > 1 && page.endsWith('/')) {
    page = page.slice(0, -1);
  }
  
  // Remove query parameters and fragments for cleaner analytics
  const urlParts = page.split('?')[0].split('#')[0];
  
  return urlParts;
}
