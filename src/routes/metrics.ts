import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { MetricsController } from '../controllers/metricsController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/score/:userId', MetricsController.getScore);
app.get('/merge-time-trend', MetricsController.getMergeTimeTrend);

export default app;
