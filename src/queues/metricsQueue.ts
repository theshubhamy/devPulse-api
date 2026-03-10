import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({});
const queueUrl = process.env.METRICS_QUEUE_URL;

export const addAggregationJob = async (userId: string) => {
    if (!queueUrl) {
        // If we're local and REDIS is missing, we just log it.
        console.warn('[SQS] METRICS_QUEUE_URL not defined, skipping job production.');
        return;
    }

    try {
        const command = new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify({ userId }),
        });

        await sqs.send(command);
        console.log(`[SQS] Successfully queued metrics job for user: ${userId}`);
    } catch (err: any) {
        console.error(`[SQS] Error sending message: ${err.message}`);
    }
};
