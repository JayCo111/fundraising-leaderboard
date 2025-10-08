// packages/api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error';
import { auditLogger } from './middleware/audit';
import { authRoutes } from './routes/auth';
import { userRoutes } from './routes/users';
import { organizationRoutes } from './routes/organizations';
import { programRoutes } from './routes/programs';
import { teamRoutes } from './routes/teams';
import { prospectRoutes } from './routes/prospects';
import { campaignRoutes } from './routes/campaigns';
import { transactionRoutes } from './routes/transactions';
import { leaderboardRoutes } from './routes/leaderboards';
import { messageRoutes } from './routes/messages';
import { rewardRoutes } from './routes/rewards';
import { exportRoutes } from './routes/exports';
import { auditRoutes } from './routes/audit';
import { webhookRoutes } from './routes/webhooks';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGINS,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/organizations', authMiddleware, organizationRoutes);
app.use('/api/v1/programs', authMiddleware, programRoutes);
app.use('/api/v1/teams', authMiddleware, teamRoutes);
app.use('/api/v1/prospects', authMiddleware, prospectRoutes);
app.use('/api/v1/campaigns', authMiddleware, campaignRoutes);
app.use('/api/v1/transactions', authMiddleware, transactionRoutes);
app.use('/api/v1/leaderboards', authMiddleware, leaderboardRoutes);
app.use('/api/v1/messages', authMiddleware, messageRoutes);
app.use('/api/v1/rewards', authMiddleware, rewardRoutes);
app.use('/api/v1/exports', authMiddleware, exportRoutes);
app.use('/api/v1/audit', authMiddleware, auditRoutes);
app.use('/api/v1/webhooks', webhookRoutes); // No auth for webhooks

// Audit logging middleware
app.use(auditLogger);

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = config.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 SportsRaiser API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api/v1`);
});

export default app;
