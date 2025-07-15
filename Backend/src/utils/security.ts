import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Rate limiting for image requests
export const imageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many image requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for PDF processing
export const pdfProcessingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 PDF processing requests per hour
  message: 'Too many PDF processing requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to validate chapter access
export const validateChapterAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterId } = req.params;
    
    // You can add additional logic here to check if user has access to this chapter
    // For now, we'll just check if the chapter exists (this is already done in the routes)
    
    next();
  } catch (error) {
    console.error('Chapter access validation error:', error);
    res.status(500).json({ error: 'Access validation failed' });
  }
};

// Middleware to log image access
export const logImageAccess = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || 'unknown';
  const ip = req.ip || 'unknown';
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Image Access: ${req.originalUrl} | IP: ${ip} | User-Agent: ${userAgent}`);
  
  next();
};

// Middleware to prevent direct image access
export const preventDirectAccess = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  
  // Allow access from your domains
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yourdomain.com' // Add your production domain
  ];
  
  const isAllowedOrigin = allowedOrigins.some(allowedOrigin => 
    origin?.startsWith(allowedOrigin) || referer?.startsWith(allowedOrigin)
  );
  
  if (!isAllowedOrigin && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Direct access not allowed' });
  }
  
  next();
};

// Security headers for images
export const imageSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive images
  res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Prevent embedding in other sites
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  
  // Prevent content type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
};

// Watermark configuration
export interface WatermarkConfig {
  text: string;
  fontSize: number;
  opacity: number;
  angle: number;
  color: string;
}

export const getWatermarkConfig = (userId?: string): WatermarkConfig => {
  return {
    text: `${userId ? `User: ${userId}` : 'Shala Shikshak'} - ${new Date().toLocaleDateString()}`,
    fontSize: 24,
    opacity: 0.1,
    angle: -45,
    color: '#000000'
  };
};

// Error handling for file operations
export class FileOperationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'FileOperationError';
  }
}

// Utility function to validate file types
export const validateFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

// Utility function to generate safe filenames
export const generateSafeFilename = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Utility function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Utility function to validate image dimensions
export const validateImageDimensions = (width: number, height: number): boolean => {
  const maxWidth = 4096;
  const maxHeight = 4096;
  const minWidth = 100;
  const minHeight = 100;
  
  return width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight;
};
