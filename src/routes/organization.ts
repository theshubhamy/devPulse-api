import { Hono } from 'hono';
import { Organization } from '../models/organization';

const app = new Hono();

app.get('/', async c => {
  try {
    const organizations = await Organization.find();
    return c.json({ organizations });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/', async c => {
  try {
    const body = await c.req.json();
    const newOrganization = new Organization(body);
    await newOrganization.save();
    return c.json(
      {
        message: 'Organization created successfully',
        organization: newOrganization,
      },
      201,
    );
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export default app;
