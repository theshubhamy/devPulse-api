import { Hono } from 'hono';

const app = new Hono();

// Middleware to parse JSON
app.use('*', async (c, next) => {
  return next();
});

app.get('/', c => {
  return c.json({
    message: 'Welcome to devPulse API - Built with Hono + Mongoose',
  });
});

// Import and use routes
import userRoutes from './routes/user';
app.route('/users', userRoutes);

export default app;
