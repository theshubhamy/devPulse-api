import { DailyMetrics } from '../models/dailyMetrics.js';
import { WorkSession } from '../models/workSession.js';
import { PullRequest } from '../models/pullRequest.js';
import { Review } from '../models/review.js';

export const processMetricsAggregation = async (userId: string, targetDate: Date = new Date()) => {
    console.log(`Aggregating metrics for user: ${userId} for date: ${targetDate.toDateString()}`);

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

    // 2. Aggregate PRs Merged Today
    const mergedPRs = await PullRequest.find({
        authorId: userId,
        mergedAt: { $gte: today, $lt: tomorrow },
        status: 'merged'
    });

    let totalMergeTimeMs = 0;
    let linesAdded = 0;
    let linesDeleted = 0;

    mergedPRs.forEach(pr => {
        if (pr.mergedAt) {
            totalMergeTimeMs += pr.mergedAt.getTime() - pr.prCreatedAt.getTime();
        }
        linesAdded += pr.additions || 0;
        linesDeleted += pr.deletions || 0;
    });

    const prsMerged = mergedPRs.length;
    const avgMergeTime = prsMerged > 0 ? (totalMergeTimeMs / prsMerged) / (1000 * 60) : 0;

    // 3. PRs Opened Today
    const prsOpened = await PullRequest.countDocuments({
        authorId: userId,
        prCreatedAt: { $gte: today, $lt: tomorrow }
    });

    // 4. PRs Reviewed Today
    const prsReviewed = await Review.countDocuments({
        reviewerId: userId,
        submittedAt: { $gte: today, $lt: tomorrow }
    });

    // 5. Compute Delivery Reliability Score (Conceptual MVP Formula)
    // Weighted mix of:
    // - Discipline (Goal: 8 hours worked)
    // - Output (PRs Merged vs Opened)
    // - Peer Support (Goal: 2 reviews performed)
    const disciplineScore = Math.min(100, (totalWorkedMinutes / 480) * 100);
    const outputScore = prsOpened > 0 ? (prsMerged / prsOpened) * 100 : (prsMerged > 0 ? 100 : 0);
    const peerSupportScore = Math.min(100, (prsReviewed / 2) * 100);

    const deliveryReliabilityScore = Math.floor(
        disciplineScore * 0.4 +
        outputScore * 0.4 +
        peerSupportScore * 0.2
    );

    // 6. Update or Create DailyMetrics
    await DailyMetrics.findOneAndUpdate(
        { userId, date: today },
        {
            totalWorkedMinutes,
            totalIdleMinutes,
            prsMerged,
            prsOpened,
            prsReviewed,
            avgMergeTime,
            linesAdded,
            linesDeleted,
            deliveryReliabilityScore,
        },
        { upsert: true, returnDocument: 'after' }
    );

    console.log(`Detailed metrics updated for user: ${userId} with score: ${deliveryReliabilityScore}`);
};
