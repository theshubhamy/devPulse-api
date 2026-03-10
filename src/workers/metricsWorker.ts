import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { DailyMetrics } from '../models/dailyMetrics.js';
import { WorkSession } from '../models/workSession.js';
import { PullRequest } from '../models/pullRequest.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const metricsWorker = new Worker(
    'metricsAggregation',
    async (job) => {
        const { userId } = job.data;
        console.log(`Aggregating metrics for user: ${userId}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Aggregate Work Sessions
        const sessions = await WorkSession.find({
            userId,
            clockInTime: { $gte: today },
            clockOutTime: { $exists: true },
        });

        let totalWorkedMinutes = 0;
        let totalIdleMinutes = 0;

        sessions.forEach((s) => {
            totalWorkedMinutes += s.totalDurationMinutes || 0;
            totalIdleMinutes += s.idleMinutes || 0;
        });

        // Aggregate PRs
        const prsMerged = await PullRequest.countDocuments({
            authorId: userId,
            mergedAt: { $gte: today },
            status: 'merged',
        });

        // Update or Create DailyMetrics
        await DailyMetrics.findOneAndUpdate(
            { userId, date: today },
            {
                totalWorkedMinutes,
                totalIdleMinutes,
                prsMerged,
            },
            { upsert: true, new: true }
        );

        console.log(`Metrics updated for user: ${userId}`);
    },
    {
        connection: {
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        },
    }
);

metricsWorker.on('error', (err) => {
    console.error(`[Redis/Worker] Connection error: ${err.message}`);
});

metricsWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

metricsWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
});
