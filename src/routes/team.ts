import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { TeamController } from '../controllers/teamController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.post('/', TeamController.createTeam);
app.get('/', TeamController.listTeams);
app.get('/:id/members', TeamController.getTeamMembers);

export default app;
