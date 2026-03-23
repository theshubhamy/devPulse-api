import { Hono } from 'hono';
import { DailyMetrics } from '../models/dailyMetrics.js';
import { PullRequest } from '../models/pullRequest.js';
import { Repository } from '../models/repository.js';
import { User } from '../models/user.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono<{
    Variables: {
        organizationId: string;
        userId: string;
        userEmail: string;
        userRole: string;
    };
}>();

app.use('*', authMiddleware);

app.get('/velocity', async c => {
    const orgId = c.get('organizationId');
    const days = Number(c.req.query('days')) || 7;

    // Find all users in this organization
    const orgUsers = await User.find({ organizationId: orgId }).select('_id');
    const userIds = orgUsers.map(u => u._id);

    const statusDate = new Date();
    statusDate.setDate(statusDate.getDate() - days);

    const metrics = await DailyMetrics.find({
        userId: { $in: userIds },
        date: { $gte: statusDate }
    }).sort({ date: 1 });

    // Group by date
    const velocity = metrics.reduce((acc: any[], curr) => {
        const period = curr.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(a => a.period === period);
        if (existing) {
            existing.prCount += curr.prsMerged;
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

// Basic CRUD for PRs scoped to organization
app.get('/', async c => {
    const orgId = c.get('organizationId');

    // Find all repositories in this organization
    const orgRepos = await Repository.find({ organizationId: orgId }).select('_id');
    const repoIds = orgRepos.map(r => r._id);

    const prs = await PullRequest.find({ repositoryId: { $in: repoIds } })
        .populate('authorId')
        .sort({ prCreatedAt: -1 })
        .limit(50);

    return c.json({ data: prs, total: prs.length });
});

export default app;
