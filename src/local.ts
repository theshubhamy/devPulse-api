import { serve } from '@hono/node-server';
import app from './app.js';
import { connectDB } from './config/connect.js';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5500;

console.log(`Starting local server on port ${port}...`);

const start = async () => {
  try {
    await connectDB();
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`Server is running at http://localhost:${port}/api/v1`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start();
