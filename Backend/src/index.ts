import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import standardRoutes from './routes/standards';
import subjectRoutes from './routes/subjects';
import chapterRoutes from './routes/chapters';
import chapterResourceRoutes from './routes/chapterResources';
import uploadRoutes from './routes/upload';
import whatsappRoutes from './routes/whatsapp';
import pageViewRoutes from './routes/pageViews';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  // Set comprehensive CORS headers for PDF files
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  res.header('Accept-Ranges', 'bytes');
  res.header('Cache-Control', 'public, max-age=31536000');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  // Set content type for PDF files
  if (req.url.endsWith('.pdf')) {
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'inline');
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "http://localhost:5000", "https://shalashikshak.in", "https://shala-shikshak.pages.dev"],
      frameAncestors: ["'self'", "http://localhost:3000", "http://localhost:5173", "https://shalashikshak.in", "https://shala-shikshak.pages.dev"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173", "http://localhost:5000", "https://shalashikshak.in", "https://shala-shikshak.pages.dev"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://shalashikshak.in', 'https://shala-shikshak.pages.dev'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
}));

// Conditional logging - only log errors in production
if (process.env.NODE_ENV === 'development') { 
  app.use(morgan('dev')); // Only in development
}

app.use(express.json()); // No size limit
app.use(express.urlencoded({ extended: true })); // No size limit

// Serve static files (uploaded PDFs) with proper headers and range support
app.use('/api/uploads', (req, res, next) => {
  // Set headers to allow PDF embedding and enable range requests for react-pdf
  res.set({
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self' http://localhost:3000 http://localhost:5173 https://shalashikshak.in https://shala-shikshak.pages.dev",
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization, X-Requested-With',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
    'Vary': 'Accept-Encoding',
    'Content-Type': req.url.endsWith('.pdf') ? 'application/pdf' : undefined
  });
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  // Enable range requests for better streaming
  acceptRanges: true,
  // Set cache headers
  maxAge: '1y',
  // Enable etag for better caching
  etag: true,
  // Enable last modified
  lastModified: true,
  // Set proper content type for PDFs
  setHeaders: (res, path) => {
    if (path.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/standards', standardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/chapter-resources', chapterResourceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/page-views', pageViewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/page-views', pageViewRoutes);

// app.use('/api/quiz')

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Shala Shikshak API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Shala Shikshak API is ready!`);
});
