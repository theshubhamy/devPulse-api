import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { clockInSchema, clockOutSchema, breakStartSchema, breakEndSchema } from '../validators/workSession.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { WorkSessionController } from '../controllers/workSessionController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/active', WorkSessionController.getActiveSession);
app.post('/clock-in', zValidator('json', clockInSchema), WorkSessionController.clockIn);
app.post('/clock-out', zValidator('json', clockOutSchema), WorkSessionController.clockOut);
app.post('/break-start', zValidator('json', breakStartSchema), WorkSessionController.breakStart);
app.post('/break-end', zValidator('json', breakEndSchema), WorkSessionController.breakEnd);
app.get('/history', WorkSessionController.getHistory);

export default app;
