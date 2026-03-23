import { AuthContext } from '../types/hono.js';
import { User, Repository, PullRequest } from '../models/index.js';
import { successResponse } from '../utils/response.js';

export class PullRequestController {
  static async getVelocity(c: AuthContext) {
    const orgId = c.get('organizationId');
    const days = Number(c.req.query('days')) || 7;

    const orgUsers = await User.find({ organizationId: orgId }).select('_id');
    const userIds = orgUsers.map(u => u._id);

    const statusDate = new Date();
    statusDate.setDate(statusDate.getDate() - days);

    const prs = await PullRequest.find({
      authorId: { $in: userIds },
      mergedAt: { $gte: statusDate }
    });

    return successResponse(c, prs);
  }

  static async list(c: AuthContext) {
    const orgId = c.get('organizationId');

    const orgRepos = await Repository.find({ organizationId: orgId }).select('_id');
    const repoIds = orgRepos.map(r => r._id);

    const prs = await PullRequest.find({ repositoryId: { $in: repoIds } })
      .populate('authorId')
      .sort({ prCreatedAt: -1 })
      .limit(50);

    return successResponse(c, { data: prs, total: prs.length });
  }
}
