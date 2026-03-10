import { Hono } from 'hono';
import { Organization } from '../models/organization.js';
import { User } from '../models/user.js';
import { Repository } from '../models/repository.js';
import { PullRequest } from '../models/pullRequest.js';
import { zValidator } from '@hono/zod-validator';
import { createOrganizationSchema } from '../validators/organization.js';

const app = new Hono();

app.get('/', async c => {
  const organizations = await Organization.find();
  return c.json({ organizations });
});

// Mock "me" for the first organization (since we haven't implemented multi-tenancy auth yet)
app.get('/me', async c => {
  const organization = await Organization.findOne();
  if (!organization) return c.json({ error: 'No organization found' }, 404);
  return c.json(organization);
});

app.get('/:id', async c => {
  const { id } = c.req.param();
  const organization = await Organization.findById(id);
  if (!organization) return c.json({ error: 'Organization not found' }, 404);
  return c.json(organization);
});

app.get('/:id/stats', async c => {
  const { id } = c.req.param();

  const [totalRepos, totalMembers, activePRs, allMergedPRs] = await Promise.all([
    Repository.countDocuments({ organizationId: id }),
    User.countDocuments({ organizationId: id }),
    PullRequest.countDocuments({ status: 'open' }), // Simplified for MVP
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
