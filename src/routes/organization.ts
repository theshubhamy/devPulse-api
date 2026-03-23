import { Hono } from 'hono';
import { Organization } from '../models/organization.js';
import { User } from '../models/user.js';
import { Repository } from '../models/repository.js';
import { PullRequest } from '../models/pullRequest.js';
import { zValidator } from '@hono/zod-validator';
import { createOrganizationSchema } from '../validators/organization.js';
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

app.get('/', async c => {
  const orgId = c.get('organizationId');
  const organizations = await Organization.find({ _id: orgId });
  return c.json({ organizations });
});

// Returns the organization for the current authenticated user
app.get('/me', async c => {
  const orgId = c.get('organizationId');
  const organization = await Organization.findById(orgId);
  if (!organization) return c.json({ error: 'Organization not found' }, 404);
  return c.json(organization);
});

app.get('/:id', async c => {
  const { id } = c.req.param();
  const orgId = c.get('organizationId');
  const role = c.get('userRole');

  if (orgId !== id && role !== 'Owner' && role !== 'Admin') {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const organization = await Organization.findById(id);
  if (!organization) return c.json({ error: 'Organization not found' }, 404);
  return c.json(organization);
});

app.get('/:id/stats', async c => {
  const { id } = c.req.param();
  const orgId = c.get('organizationId');
  const role = c.get('userRole');

  // Only allow if it's the user's organization or user is Admin/Owner
  if (orgId !== id && role !== 'Admin' && role !== 'Owner') {
    return c.json({ error: 'Unauthorized' }, 401);
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
    ? (totalMergeTimeMs / allMergedPRs.length) / (1000 * 60 * 60) // in hours
    : 0;

  return c.json({
    totalRepos,
    totalMembers,
    activePRs,
    avgMergeTime
  });
});

app.post('/', zValidator('json', createOrganizationSchema), async c => {
  const body = c.req.valid('json');
  const newOrganization = new Organization(body);
  await newOrganization.save();
  return c.json(
    {
      message: 'Organization created successfully',
      organization: newOrganization,
    },
    201,
  );
});

export default app;
