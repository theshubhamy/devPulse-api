import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createRepositorySchema } from '../validators/repository.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { RepositoryController } from '../controllers/repositoryController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/', RepositoryController.list);
app.post('/', zValidator('json', createRepositorySchema), RepositoryController.create);

export default app;
