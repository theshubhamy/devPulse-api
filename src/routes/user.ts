import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { env } from 'hono/adapter';
import { setCookie } from 'hono/cookie';
import { User } from '../models/user.js';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from '../validators/user.js';

const app = new Hono();

app.get('/', async c => {
  const users = await User.find().populate('organizationId');
  return c.json({ users });
});

app.get('/me', async c => {
  const payload = c.get('jwtPayload');
  if (!payload?.userId) return c.json({ error: 'Unauthorized' }, 401);
  const user = await User.findById(payload.userId).populate('organizationId');
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});

app.post('/', zValidator('json', createUserSchema), async c => {
  const body = c.req.valid('json');
  const newUser = new User(body);
  await newUser.save();
  return c.json({ message: 'User created successfully', user: newUser }, 201);
});

// Issue Token and set cookie for testing/dev
app.post('/token', async c => {
  const { email } = await c.req.json();
  const user = await User.findOne({ email });
  if (!user) return c.json({ error: 'User not found' }, 404);

  const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
  const token = await sign(
    {
      userId: user._id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    },
    JWT_SECRET,
    'HS256',
  );

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return c.json({ message: 'Token set in cookie', userId: user._id });
});

export default app;
