import { Hono } from 'hono';
import { Repository } from '../models/repository.js';
import { zValidator } from '@hono/zod-validator';
import { createRepositorySchema } from '../validators/repository.js';

const app = new Hono();

app.get('/', async c => {
  const repositories = await Repository.find();
  return c.json({ repositories });
});

app.post('/', zValidator('json', createRepositorySchema), async c => {
  const body = c.req.valid('json');
  const newRepository = new Repository(body);
  await newRepository.save();
  return c.json(
    { message: 'Repository created successfully', repository: newRepository },
    201,
  );
});

export default app;
