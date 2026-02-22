import { Hono } from 'hono';
import { WorkSession } from '../models/workSession';

const app = new Hono();

// Get the user's active session
app.get('/active/:userId', async c => {
  try {
    const { userId } = c.req.param();
    const session = await WorkSession.findOne({
      userId,
      clockOutTime: { $exists: false },
    });
    if (!session) {
      return c.json({ message: 'No active session' }, 404);
    }
    return c.json({ session });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Clock In
app.post('/clock-in', async c => {
  try {
    const { userId, source } = await c.req.json();

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
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

// Clock Out
app.post('/clock-out', async c => {
  try {
    const { userId, idleMinutes } = await c.req.json();

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
    session.totalDurationMinutes = Math.floor(durationMs / 60000);

    await session.save();
    return c.json({ message: 'Clocked out successfully', session }, 200);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export default app;
