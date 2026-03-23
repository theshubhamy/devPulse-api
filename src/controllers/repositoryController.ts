import { AuthContext } from '../types/hono.js';
import { Repository } from '../models/index.js';
import { successResponse } from '../utils/response.js';

export class RepositoryController {
  static async list(c: AuthContext) {
    const orgId = c.get('organizationId');
    const repositories = await Repository.find({ organizationId: orgId });
    return successResponse(c, repositories);
  }

  static async create(c: AuthContext) {
    const body = (c.req as any).valid('json');
    const orgId = c.get('organizationId');
    const newRepo = new Repository({ ...body, organizationId: orgId });
    await newRepo.save();
    return successResponse(c, newRepo, 'Repository created successfully', 201);
  }
}
