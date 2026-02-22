import { Hono } from 'hono';
import { User } from '../models/user';

const app = new Hono();

app.get('/', async c => {
  try {
    const users = await User.find();
    return c.json({ users });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/', async c => {
  try {
    const body = await c.req.json();
    const newUser = new User(body);
    await newUser.save();
    return c.json({ message: 'User created successfully', user: newUser }, 201);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export default app;
