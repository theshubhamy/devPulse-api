import { DailyMetrics } from '../models/dailyMetrics.js';
import { WorkSession } from '../models/workSession.js';
import { PullRequest } from '../models/pullRequest.js';

export const processMetricsAggregation = async (userId: string) => {
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
};
