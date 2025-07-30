"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const standards_1 = __importDefault(require("./routes/standards"));
const subjects_1 = __importDefault(require("./routes/subjects"));
const chapters_1 = __importDefault(require("./routes/chapters"));
const chapterResources_1 = __importDefault(require("./routes/chapterResources"));
const upload_1 = __importDefault(require("./routes/upload"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
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
}, express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://shalashikshak.in', 'https://shala-shikshak.pages.dev'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges']
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json()); // No size limit
app.use(express_1.default.urlencoded({ extended: true })); // No size limit
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
}, express_1.default.static(path_1.default.join(__dirname, '../uploads'), {
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
app.use('/api/auth', auth_1.default);
app.use('/api/standards', standards_1.default);
app.use('/api/subjects', subjects_1.default);
app.use('/api/chapters', chapters_1.default);
app.use('/api/chapter-resources', chapterResources_1.default);
app.use('/api/upload', upload_1.default);
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
app.use((err, req, res, next) => {
    console.error('Error:', err);
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    res.status(err.status || 500).json(Object.assign({ error: err.message || 'Internal server error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📚 Shala Shikshak API is ready!`);
});
