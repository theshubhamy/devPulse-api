import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from 'hono/request-id'
import mongoose from 'mongoose';
import { successResponse, errorResponse } from './utils/response.js';
import { AuthVariables } from './types/hono.js';

// Route Imports
import organizationRoutes from './routes/organization.js';
import userRoutes from './routes/user.js';
import repositoryRoutes from './routes/repository.js';
import workSessionRoutes from './routes/workSession.js';
import analyticsRoutes from './routes/analytics.js';
import webhookRoutes from './routes/webhook.js';
import pullRequestRoutes from './routes/pullRequests.js';
import metricsRoutes from './routes/metrics.js';

const app = new Hono<{ Variables: AuthVariables }>();

// Global Middlewares (apply to everything)
app.use('*', requestId());
app.use('*', logger());
app.use('*', cors({
  origin: (origin) => origin,
  credentials: true,
}));

// API V1 Routes
const v1 = new Hono<{ Variables: AuthVariables }>();

// Health Check (v1)
v1.get('/', async c => {
  const isDBConnected = mongoose.connection.readyState === 1;
  const health = {
    message: 'devPulse API',
    version: '1.0.0',
    status: isDBConnected ? 'healthy' : 'degraded',
    db: isDBConnected ? 'connected' : 'disconnected',
  };
  return successResponse(c, health, 'Service is running');
});

// Route Registration (on v1)
v1.route('/webhooks', webhookRoutes as any); // Cast as any if Routes don't define Variables yet
v1.route('/organizations', organizationRoutes as any);
v1.route('/users', userRoutes as any);
v1.route('/auth', userRoutes as any);
v1.route('/repositories', repositoryRoutes as any);
v1.route('/work-sessions', workSessionRoutes as any);
v1.route('/analytics', analyticsRoutes as any);
v1.route('/pull-requests', pullRequestRoutes as any);
v1.route('/metrics', metricsRoutes as any);

// Mount V1
app.route('/api/v1', v1);

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error] ${err.message}`);
  const status = (err as any).status || 500;
  return errorResponse(c, err.message || 'Internal Server Error', status);
});

export default app;
