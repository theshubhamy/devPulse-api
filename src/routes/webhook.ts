import { Hono } from 'hono';
import { WebhookController } from '../controllers/webhookController.js';

const app = new Hono();

// GitHub Webhook payload handler
app.post('/github', WebhookController.handleGithub);

export default app;
