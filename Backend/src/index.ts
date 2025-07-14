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
import uploadRoutes from './routes/upload';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'self'", "http://localhost:3000", "http://localhost:5173"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json()); // No size limit
app.use(express.urlencoded({ extended: true })); // No size limit

// Serve static files (uploaded PDFs) with proper headers and range support
app.use('/api/uploads', (req, res, next) => {
  // Set headers to allow PDF embedding and enable range requests for react-pdf
  res.set({
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self' http://localhost:3000 http://localhost:5173",
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
app.use('/api/upload', uploadRoutes);

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
