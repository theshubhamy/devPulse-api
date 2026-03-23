import { Hono } from 'hono';
import { DailyMetrics } from '../models/dailyMetrics.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono();

app.use('*', authMiddleware);

// Get dashboard metrics for a user
app.get('/user/:userId', async c => {
  try {
    const { userId } = c.req.param();
    const limit = Number(c.req.query('limit')) || 30; // Last 30 days

    const metrics = await DailyMetrics.find({ userId })
      .sort({ date: -1 })
      .limit(limit);

    // Calculate detailed aggregates for dashboard
    let totalWorkedMinutes = 0;
    let totalIdleMinutes = 0;
    let prsMerged = 0;
    let prsOpened = 0;
    let prsReviewed = 0;
    let totalScore = 0;

    metrics.forEach(m => {
      totalWorkedMinutes += m.totalWorkedMinutes;
      totalIdleMinutes += m.totalIdleMinutes;
      prsMerged += m.prsMerged;
      prsOpened += m.prsOpened;
      prsReviewed += m.prsReviewed;
      totalScore += m.deliveryReliabilityScore;
    });

    const avgScore = metrics.length > 0 ? Math.floor(totalScore / metrics.length) : 0;

    return c.json({
      metrics,
      aggregates: {
        totalWorkedMinutes,
        totalIdleMinutes,
        prsMerged,
        prsOpened,
        prsReviewed,
        avgDeliveryReliabilityScore: avgScore,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get team-wide metrics for an organization
app.get('/team/:orgId', async c => {
  try {
    const { orgId } = c.req.param();
    const { User } = await import('../models/user.js');

    // Find all users in this org
    const users = await User.find({ organizationId: orgId });
    const userIds = users.map(u => u._id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get metrics for all team members for today
    const teamMetrics = await DailyMetrics.find({
      userId: { $in: userIds },
      date: today
    }).populate('userId', 'name email');

    let teamWorkedMinutes = 0;
    let teamPrsMerged = 0;
    let totalScore = 0;

    teamMetrics.forEach(m => {
      teamWorkedMinutes += m.totalWorkedMinutes;
      teamPrsMerged += m.prsMerged;
      totalScore += m.deliveryReliabilityScore;
    });

    const avgTeamScore = teamMetrics.length > 0 ? Math.floor(totalScore / teamMetrics.length) : 0;

    return c.json({
      teamMetrics,
      summary: {
        memberCount: users.length,
        activeToday: teamMetrics.length,
        teamWorkedMinutes,
        teamPrsMerged,
        avgTeamScore
      }
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
