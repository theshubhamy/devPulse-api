import { Queue } from 'bullmq';

export const metricsQueue = new Queue('metricsAggregation', {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
});

metricsQueue.on('error', (err) => {
    console.error(`[Redis/Queue] Connection error: ${err.message}`);
});

export const addAggregationJob = async (userId: string) => {
    await metricsQueue.add('aggregateUserMetrics', { userId }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};
