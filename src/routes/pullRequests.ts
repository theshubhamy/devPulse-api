import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { PullRequestController } from '../controllers/pullRequestController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/velocity', PullRequestController.getVelocity);
app.get('/', PullRequestController.list);

export default app;
