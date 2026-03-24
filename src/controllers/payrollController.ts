import { AuthContext } from '../types/hono.js';
import { Payroll } from '../models/payroll.js';
import { successResponse } from '../utils/response.js';

export class PayrollController {
  static async getEmployeePayroll(c: AuthContext) {
    const userId = c.get('userId');
    const records = await Payroll.find({ userId }).sort({ periodStart: -1 });
    return successResponse(c, records, 'Retrieved payroll history');
  }

  static async generateDemoPayroll(c: AuthContext) {
    const userId = c.get('userId');

    // Simulate payroll generation based on 40 hours work week at $50/hr
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 7);
    const periodEnd = new Date();
    
    // For MVP demonstration
    const newPayroll = new Payroll({
      userId,
      organizationId: userId, // Assuming org comes from context later
      periodStart,
      periodEnd,
      totalHours: 40,
      hourlyRate: 50,
      grossPay: 2000,
      status: 'draft'
    });
    
    await newPayroll.save();
    return successResponse(c, newPayroll, 'Payroll generated successfully for demo', 201);
  }
}
