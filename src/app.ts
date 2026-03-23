import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
// Routes are protected internally within each route module

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
app.get('/', async c => {
  const isDBConnected = (await import('mongoose')).connection.readyState === 1;
  return c.json({
    message: 'Welcome to devPulse API - Built with Hono + Mongoose',
    version: '1.0.0',
    status: isDBConnected ? 'healthy' : 'degraded',
    db: isDBConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Import routes
import organizationRoutes from './routes/organization.js';
import userRoutes from './routes/user.js';
import repositoryRoutes from './routes/repository.js';
import workSessionRoutes from './routes/workSession.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhook.js';
import pullRequestRoutes from './routes/pullRequests.js';
import metricsRoutes from './routes/metrics.js';

// Public Routes
app.route('/webhooks', webhookRoutes);

// Protected Routes (Require JWT) - Handled internally in routes

app.route('/organizations', organizationRoutes);
app.route('/users', userRoutes);
app.route('/auth', userRoutes); // Frontend expects /auth/me
app.route('/repositories', repositoryRoutes);
app.route('/work-sessions', workSessionRoutes);
app.route('/analytics', analyticsRoutes);
app.route('/pull-requests', pullRequestRoutes);
app.route('/metrics', metricsRoutes);

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
