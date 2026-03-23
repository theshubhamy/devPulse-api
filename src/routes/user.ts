import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { env } from 'hono/adapter';
import { setCookie } from 'hono/cookie';
import { User } from '../models/user.js';
import { zValidator } from '@hono/zod-validator';
import { createUserSchema } from '../validators/user.js';
import { authMiddleware } from '../middleware/auth.js';


const app = new Hono<{
  Variables: {
    organizationId: string;
    userId: string;
    userEmail: string;
    userRole: string;
  };
}>();

// --- Public Routes ---
app.post('/login', async c => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email and password are required' }, 400);

    const user = await User.findOne({ email });
    if (!user) return c.json({ error: 'Invalid email or password' }, 401);

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) return c.json({ error: 'Invalid email or password' }, 401);

    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
    const token = await sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      },
      JWT_SECRET,
      'HS256',
    );

    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return c.json({
      message: 'Login successful',
      user: user.toJSON(),
      token
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/token', async c => {
  const { email } = await c.req.json();
  const user = await User.findOne({ email });
  if (!user) return c.json({ error: 'User not found' }, 404);

  const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
  const token = await sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
    },
    JWT_SECRET,
    'HS256',
  );

  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return c.json({ message: 'Token set in cookie', userId: user._id, token });
});

app.post('/', zValidator('json', createUserSchema), async c => {
  const body = c.req.valid('json');
  const newUser = new User(body);
  await newUser.save();
  return c.json({ message: 'User created successfully', user: newUser }, 201);
});

// --- Auth Middleware (Everything below this point is protected) ---
app.use('*', authMiddleware);

// --- Protected Routes ---
app.get('/', async c => {
  const orgId = c.get('organizationId');
  const users = await User.find({ organizationId: orgId }).populate('organizationId');
  return c.json({ users });
});

app.get('/me', async c => {
  const userId = c.get('userId');
  const user = await User.findById(userId).populate('organizationId');
  if (!user) return c.json({ error: 'User not found' }, 404);
  return c.json(user);
});

app.post('/logout', async c => {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 0,
    path: '/',
  });
  return c.json({ message: 'Logged out successfully' });
});

export default app;