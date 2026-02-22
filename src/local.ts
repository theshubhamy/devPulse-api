import { serve } from '@hono/node-server';
import app from './app';
import { connectDB } from './db/connect';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

console.log(`Starting local server on port ${port}...`);

const start = async () => {
  try {
    await connectDB();
    serve({
      fetch: app.fetch,
      port,
    });
    console.log(`Server is running at http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

start();
