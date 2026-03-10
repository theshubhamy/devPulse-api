import { Hono } from 'hono';
import { Organization } from '../models/organization.js';
import { zValidator } from '@hono/zod-validator';
import { createOrganizationSchema } from '../validators/organization.js';

const app = new Hono();

app.get('/', async c => {
  const organizations = await Organization.find();
  return c.json({ organizations });
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
