import { Hono } from 'hono';
import { DailyMetrics } from '../models/dailyMetrics.js';
import { PullRequest } from '../models/pullRequest.js';

const app = new Hono();

app.get('/velocity', async c => {
    const days = Number(c.req.query('days')) || 7;

    // Aggregate from DailyMetrics for simplicity, or directly from PullRequest
    // Frontend expects 'period' (e.g., 'Week 1', 'Feb 10')
    const statusDate = new Date();
    statusDate.setDate(statusDate.getDate() - days);

    const metrics = await DailyMetrics.find({
        date: { $gte: statusDate }
    }).sort({ date: 1 });

    // Group by date
    const velocity = metrics.reduce((acc: any[], curr) => {
        const period = curr.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(a => a.period === period);
        if (existing) {
            existing.prCount += curr.prsMerged;
            // Weighted average merge time could be better, but simple average for MVP
            existing.avgMergeTime = (existing.avgMergeTime + curr.avgMergeTime) / 2;
        } else {
            acc.push({
                period,
                prCount: curr.prsMerged,
                avgMergeTime: curr.avgMergeTime
            });
        }
        return acc;
    }, []);

    return c.json(velocity);
});

// Basic CRUD for PRs could go here
app.get('/', async c => {
    const prs = await PullRequest.find().populate('authorId').limit(50);
    return c.json({ data: prs, total: prs.length });
});

export default app;
