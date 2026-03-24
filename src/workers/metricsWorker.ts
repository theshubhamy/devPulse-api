import { DailyMetrics } from '../models/dailyMetrics.js';
import { WorkSession } from '../models/workSession.js';

export const processMetricsAggregation = async (userId: string, targetDate: Date = new Date()) => {
    console.log(`Aggregating attendance metrics for user: ${userId} for date: ${targetDate.toDateString()}`);

    const today = new Date(targetDate);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 1. Aggregate Work Sessions
    const sessions = await WorkSession.find({
        userId,
        clockInTime: { $gte: today, $lt: tomorrow },
        clockOutTime: { $exists: true },
    });

    let totalWorkedMinutes = 0;
    let totalIdleMinutes = 0;

    sessions.forEach((s) => {
        totalWorkedMinutes += s.totalDurationMinutes || 0;
        totalIdleMinutes += s.idleMinutes || 0;
    });

    // Compute basic delivery reliability / attendance score based on total hours
    const disciplineScore = Math.min(100, (totalWorkedMinutes / 480) * 100);

    // Update or Create DailyMetrics
    await DailyMetrics.findOneAndUpdate(
        { userId, date: today },
        {
            totalWorkedMinutes,
            totalIdleMinutes,
            deliveryReliabilityScore: Math.floor(disciplineScore),
        },
        { upsert: true, returnDocument: 'after' }
    );

    console.log(`Attendance metrics updated for user: ${userId}`);
};
