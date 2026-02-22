import { handle } from 'hono/aws-lambda';
import app from './app';
import { connectDB } from './db/connect';

export const handler = async (event: any, context: any) => {
  // Connect to the DB on cold starts
  await connectDB();

  // Since we use aws-lambda adapter, handle it here
  const lambdaHandler = handle(app);
  return lambdaHandler(event, context);
};
