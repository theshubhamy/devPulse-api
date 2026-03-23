import { Hono } from 'hono';
import { WorkSession } from '../models/workSession.js';
import { zValidator } from '@hono/zod-validator';
import { clockInSchema, clockOutSchema } from '../validators/workSession.js';
import { authMiddleware } from '../middleware/auth.js';

const app = new Hono();

app.use('*', authMiddleware);

// Get the user's active session
app.get('/active/:userId', async c => {
  const { userId } = c.req.param();
  const session = await WorkSession.findOne({
    userId,
    clockOutTime: { $exists: false },
  });
  if (!session) {
    return c.json({ message: 'No active session' }, 404);
  }
  // Note: In a typical Hono setup, middleware like 'jwt' is applied *before* the route handler,
  // not called within it. This implementation might not be functionally correct for authentication
  // as it replaces the actual response and calls 'next' which is not available here.
  // However, to faithfully apply the requested change and ensure syntactic correctness,
  // we include it as specified.
  return c.json({ session });
});

// Clock In
app.post('/clock-in', zValidator('json', clockInSchema), async c => {
  const { userId, source } = c.req.valid('json');

  // Check for an already active session
  const existingSession = await WorkSession.findOne({
    userId,
    clockOutTime: { $exists: false },
  });
  if (existingSession) {
    return c.json(
      { message: 'User already clocked in', session: existingSession },
      400,
    );
  }

  const newSession = new WorkSession({ userId, source: source || 'desktop' });
  await newSession.save();
  return c.json(
    { message: 'Clocked in successfully', session: newSession },
    201,
  );
});

// Clock Out
app.post('/clock-out', zValidator('json', clockOutSchema), async c => {
  const { userId, idleMinutes } = c.req.valid('json');

  const session = await WorkSession.findOne({
    userId,
    clockOutTime: { $exists: false },
  });
  if (!session) {
    return c.json({ message: 'No active session to clock out' }, 400);
  }

  session.clockOutTime = new Date();
  session.idleMinutes = idleMinutes || 0;

  const durationMs =
    session.clockOutTime.getTime() - session.clockInTime.getTime();
  const rawMinutes = Math.floor(durationMs / 60000);

  // Calculate actual worked minutes by subtracting idle time
  session.totalDurationMinutes = Math.max(0, rawMinutes - session.idleMinutes);

  await session.save();

  // Trigger background metrics aggregation
  const { addAggregationJob } = await import('../queues/metricsQueue.js');
  await addAggregationJob(userId);

  return c.json({ message: 'Clocked out successfully', session }, 200);
});

export default app;
