import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from '../validators/user.js';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { UserController } from '../controllers/userController.js';

const app = new Hono<{ Variables: AuthVariables }>();

// --- Public Routes ---
app.post('/login', UserController.login);
app.post('/signup', zValidator('json', createUserSchema), UserController.signup);

// --- Auth Middleware (Protected Routes follow) ---
app.use('*', authMiddleware);

app.get('/', UserController.listUsers);
app.get('/me', UserController.getMe);
app.post('/logout', UserController.logout);

export default app;