import { Hono } from 'hono';
import { DailyMetrics } from '../models/dailyMetrics.js';

const app = new Hono();

app.get('/score/:userId', async c => {
    const { userId } = c.req.param();
    const latest = await DailyMetrics.findOne({ userId }).sort({ date: -1 });
    return c.json({ score: latest?.deliveryReliabilityScore || 0 });
});

app.get('/merge-time-trend', async c => {
    const weeks = Number(c.req.query('weeks')) || 4;
    const days = weeks * 7;
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);

    const metrics = await DailyMetrics.find({ date: { $gte: cutOff } }).sort({ date: 1 });

    // Grouping into weekly intervals
    const weeklyData: any[] = [];
    for (let i = 0; i < weeks; i++) {
        const start = new Date(cutOff);
        start.setDate(start.getDate() + i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        const weekMetrics = metrics.filter(m => m.date >= start && m.date < end);
        const avgMergeTime = weekMetrics.length > 0
            ? weekMetrics.reduce((sum, m) => sum + m.avgMergeTime, 0) / weekMetrics.length
            : 0;

        weeklyData.push({
            week: `Week ${i + 1}`,
            avgMergeTime
        });
    }

    return c.json(weeklyData);
});

export default app;
