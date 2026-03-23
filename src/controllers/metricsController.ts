import { AuthContext } from '../types/hono.js';
import { DailyMetrics } from '../models/index.js';
import { successResponse } from '../utils/response.js';

export class MetricsController {
  static async getScore(c: AuthContext) {
    const { userId } = c.req.param();
    const latest = await DailyMetrics.findOne({ userId }).sort({ date: -1 });
    return successResponse(c, { score: latest?.deliveryReliabilityScore || 0 });
  }

  static async getMergeTimeTrend(c: AuthContext) {
    const weeks = Number(c.req.query('weeks')) || 4;
    const days = weeks * 7;
    const cutOff = new Date();
    cutOff.setDate(cutOff.getDate() - days);

    const metrics = await DailyMetrics.find({ date: { $gte: cutOff } }).sort({ date: 1 });

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

    return successResponse(c, weeklyData);
  }
}
