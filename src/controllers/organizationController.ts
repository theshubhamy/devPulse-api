import { AuthContext } from '../types/hono.js';
import { Organization, User, Repository, PullRequest } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class OrganizationController {
  static async list(c: AuthContext) {
    const orgId = c.get('organizationId');
    const organizations = await Organization.find({ _id: orgId });
    return successResponse(c, organizations);
  }

  static async getMe(c: AuthContext) {
    const orgId = c.get('organizationId');
    const organization = await Organization.findById(orgId);
    if (!organization) return errorResponse(c, 'Organization not found', 404);
    return successResponse(c, organization);
  }

  static async getById(c: AuthContext) {
    const { id } = c.req.param();
    const orgId = c.get('organizationId');
    const role = c.get('userRole');

    if (orgId !== id && role !== 'Owner' && role !== 'Admin') {
      return errorResponse(c, 'Unauthorized', 401);
    }

    const organization = await Organization.findById(id);
    if (!organization) return errorResponse(c, 'Organization not found', 404);
    return successResponse(c, organization);
  }

  static async getStats(c: AuthContext) {
    try {
      const { id } = c.req.param();
      const orgId = c.get('organizationId');
      const role = c.get('userRole');

      if (orgId !== id && role !== 'Admin' && role !== 'Owner') {
        return errorResponse(c, 'Unauthorized', 401);
      }

      const [totalRepos, totalMembers, activePRs, allMergedPRs] = await Promise.all([
        Repository.countDocuments({ organizationId: id }),
        User.countDocuments({ organizationId: id }),
        PullRequest.countDocuments({ status: 'open' }),
        PullRequest.find({ status: 'merged' })
      ]);

      let totalMergeTimeMs = 0;
      allMergedPRs.forEach(pr => {
        if (pr.mergedAt) {
          totalMergeTimeMs += pr.mergedAt.getTime() - pr.prCreatedAt.getTime();
        }
      });

      const avgMergeTime = allMergedPRs.length > 0
        ? (totalMergeTimeMs / allMergedPRs.length) / (1000 * 60 * 60)
        : 0;

      return successResponse(c, {
        totalRepos,
        totalMembers,
        activePRs,
        avgMergeTime
      });
    } catch (err: any) {
      return errorResponse(c, err.message, 500);
    }
  }

  static async create(c: AuthContext) {
    const body = (c.req as any).valid('json');
    const newOrganization = new Organization(body);
    await newOrganization.save();
    return successResponse(c, newOrganization, 'Organization created successfully', 201);
  }
}
