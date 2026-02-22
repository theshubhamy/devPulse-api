import { Hono } from 'hono';
import { Repository } from '../models/repository';

const app = new Hono();

app.get('/', async c => {
  try {
    const repositories = await Repository.find();
    return c.json({ repositories });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/', async c => {
  try {
    const body = await c.req.json();
    const newRepository = new Repository(body);
    await newRepository.save();
    return c.json(
      { message: 'Repository created successfully', repository: newRepository },
      201,
    );
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});

export default app;
