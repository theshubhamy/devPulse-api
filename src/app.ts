import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authMiddleware } from './middleware/auth.js';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: (origin) => origin, // Allow all origins for dev, or set specifically
    credentials: true,
  })
);

// Health Check
app.get('/', c => {
  return c.json({
    message: 'Welcome to devPulse API - Built with Hono + Mongoose',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Import routes
import organizationRoutes from './routes/organization.js';
import userRoutes from './routes/user.js';
import repositoryRoutes from './routes/repository.js';
import workSessionRoutes from './routes/workSession.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhook.js';

// Public Routes
app.route('/webhooks', webhookRoutes);

// Protected Routes (Require JWT)
app.use('/organizations/*', authMiddleware);
app.use('/users/*', authMiddleware);
app.use('/repositories/*', authMiddleware);
app.use('/work-sessions/*', authMiddleware);
app.use('/analytics/*', authMiddleware);

app.route('/organizations', organizationRoutes);
app.route('/users', userRoutes);
app.route('/repositories', repositoryRoutes);
app.route('/work-sessions', workSessionRoutes);
app.route('/analytics', analyticsRoutes);

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`);
  return c.json(
    {
      error: err.message || 'Internal Server Error',
      status: 'error',
    },
    err instanceof Error && 'status' in err ? (err as any).status : 500,
  );
});

export default app;
