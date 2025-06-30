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
const upload_1 = __importDefault(require("./routes/upload"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-frontend-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json()); // No size limit
app.use(express_1.default.urlencoded({ extended: true })); // No size limit
// Serve static files (uploaded PDFs)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/standards', standards_1.default);
app.use('/api/subjects', subjects_1.default);
app.use('/api/chapters', chapters_1.default);
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
