import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createOrganizationSchema } from '../validators/organization.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { OrganizationController } from '../controllers/organizationController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/', OrganizationController.list);
app.get('/me', OrganizationController.getMe);
app.get('/:id', OrganizationController.getById);
app.get('/:id/stats', OrganizationController.getStats);
app.post('/', zValidator('json', createOrganizationSchema), OrganizationController.create);

export default app;
