import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { AnalyticsController } from '../controllers/analyticsController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/user/:userId', AnalyticsController.getUserDashboard);
app.get('/team/:orgId', AnalyticsController.getTeamDashboard);

export default app;
