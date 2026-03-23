import { AuthContext } from '../types/hono.js';
import { WorkSession } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

export class WorkSessionController {
  static async getActiveSession(c: AuthContext) {
    const userId = c.get('userId');
    const session = await WorkSession.findOne({
      userId,
      clockOutTime: { $exists: false },
    });
    if (!session) return errorResponse(c, 'No active session', 404);
    return successResponse(c, session);
  }

  static async clockIn(c: AuthContext) {
    const userId = c.get('userId');
    const { source } = (c.req as any).valid('json');

    const existingSession = await WorkSession.findOne({
      userId,
      clockOutTime: { $exists: false },
    });
    if (existingSession) return errorResponse(c, 'User already clocked in', 400);

    const newSession = new WorkSession({ userId, source: source || 'desktop' });
    await newSession.save();
    return successResponse(c, newSession, 'Clocked in successfully', 201);
  }

  static async clockOut(c: AuthContext) {
    const userId = c.get('userId');
    const { idleMinutes } = (c.req as any).valid('json');

    const session = await WorkSession.findOne({
      userId,
      clockOutTime: { $exists: false },
    });
    if (!session) return errorResponse(c, 'No active session to clock out', 400);

    session.clockOutTime = new Date();
    session.idleMinutes = idleMinutes || 0;

    const durationMs = session.clockOutTime.getTime() - session.clockInTime.getTime();
    const rawMinutes = Math.floor(durationMs / 60000);

    session.totalDurationMinutes = Math.max(0, rawMinutes - session.idleMinutes);
    await session.save();

    // Trigger background metrics aggregation
    const { addAggregationJob } = await import('../queues/metricsQueue.js');
    await addAggregationJob(userId);

    return successResponse(c, session, 'Clocked out successfully');
  }

  static async getHistory(c: AuthContext) {
    const userId = c.get('userId');
    const { days } = c.req.query();

    const query: any = { userId };
    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.clockInTime = { $gte: date };
    }

    const sessions = await WorkSession.find(query).sort({ clockInTime: -1 });
    return successResponse(c, sessions);
  }
}
