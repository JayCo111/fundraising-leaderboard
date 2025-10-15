"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// packages/api/src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const auth_1 = require("./routes/auth");
const students_1 = require("./routes/students");
const orders_1 = require("./routes/orders");
const referrals_1 = require("./routes/referrals");
const leaderboard_1 = require("./routes/leaderboard");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.CORS_ORIGINS,
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/v1/auth', auth_1.authRoutes);
app.use('/api/v1/students', students_1.studentsRoutes);
app.use('/api/v1/orders', orders_1.ordersRoutes);
app.use('/api/v1/referrals', referrals_1.referralsRoutes);
app.use('/api/v1/leaderboard', leaderboard_1.leaderboardRoutes);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});
const PORT = config_1.config.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 SportsRaiser API server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api/v1`);
});
exports.default = app;
