import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { AuthVariables } from '../types/hono.js';
import { PayrollController } from '../controllers/payrollController.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.use('*', authMiddleware);

app.get('/', PayrollController.getEmployeePayroll);
app.post('/generate-demo', PayrollController.generateDemoPayroll);

export default app;
