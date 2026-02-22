import { Hono } from 'hono';

const app = new Hono();

// Middleware to parse JSON is implicitly handled by `c.req.json()` in endpoints,
// but we can add global middleware here if required.
app.use('*', async (c, next) => {
  return next();
});

app.get('/', c => {
  return c.json({
    message: 'Welcome to devPulse API - Built with Hono + Mongoose',
    version: '1.0.0',
    status: 'healthy',
  });
});

// Import and use routes
import organizationRoutes from './routes/organization';
import userRoutes from './routes/user';
import repositoryRoutes from './routes/repository';
import workSessionRoutes from './routes/workSession';
import analyticsRoutes from './routes/analytics';
import webhookRoutes from './routes/webhook';

app.route('/organizations', organizationRoutes);
app.route('/users', userRoutes);
app.route('/repositories', repositoryRoutes);
app.route('/work-sessions', workSessionRoutes);
app.route('/analytics', analyticsRoutes);
app.route('/webhooks', webhookRoutes);

export default app;
