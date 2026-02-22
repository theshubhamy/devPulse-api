import { Hono } from 'hono';
import { DailyMetrics } from '../models/dailyMetrics';

const app = new Hono();

// Get dashboard metrics for a user
app.get('/user/:userId', async c => {
  try {
    const { userId } = c.req.param();
    const limit = Number(c.req.query('limit')) || 30; // Last 30 days

    const metrics = await DailyMetrics.find({ userId })
      .sort({ date: -1 })
      .limit(limit);

    // Calculate simple aggregates for dashboard
    let totalWorkedMinutes = 0;
    let prsMerged = 0;

    metrics.forEach(m => {
      totalWorkedMinutes += m.totalWorkedMinutes;
      prsMerged += m.prsMerged;
    });

    return c.json({
      metrics,
      aggregates: {
        totalWorkedMinutes,
        prsMerged,
      },
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
