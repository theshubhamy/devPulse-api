import { handle } from 'hono/aws-lambda';
import app from './app.js';
import { connectDB } from './config/connect.js';
import { processMetricsAggregation } from './workers/metricsWorker.js';

export const handler = async (event: any, context: any) => {
  // Connect to the DB on cold starts
  await connectDB();

  // 1. Check if this is an SQS Event
  if (event.Records && event.Records[0]?.eventSource === 'aws:sqs') {
    console.log(`[SQS] Processing ${event.Records.length} records...`);

    for (const record of event.Records) {
      try {
        const body = JSON.parse(record.body);
        if (body.userId) {
          await processMetricsAggregation(body.userId);
        }
      } catch (err: any) {
        console.error(`[SQS] Error processing record: ${err.message}`);
      }
    }
    return; // SQS doesn't need a response body
  }

  // 2. Otherwise handle it as a standard HTTP request via Hono
  const lambdaHandler = handle(app);
  return lambdaHandler(event, context);
};
