import { z } from 'zod';

export const createUserSchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required').optional(),
    teamId: z.string().optional(),
    employeeId: z.string().min(1, 'Employee ID is required'),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(5, 'Password must be at least 5 characters'),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Employee']).optional(),
    isActive: z.boolean().optional(),
});
