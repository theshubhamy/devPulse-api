import { AuthContext } from '../types/hono.js';
import { DailyMetrics, User } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class AnalyticsController {
  static async getUserDashboard(c: AuthContext) {
    try {
      const { userId } = c.req.param();
      const limit = Number(c.req.query('limit')) || 30;

      const metrics = await DailyMetrics.find({ userId })
        .sort({ date: -1 })
        .limit(limit);

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

      return successResponse(c, {
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
      return errorResponse(c, err.message, 500);
    }
  }

  static async getTeamDashboard(c: AuthContext) {
    try {
      const { orgId } = c.req.param();

      const users = await User.find({ organizationId: orgId });
      const userIds = users.map(u => u._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

      return successResponse(c, {
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
      return errorResponse(c, err.message, 500);
    }
  }
}
