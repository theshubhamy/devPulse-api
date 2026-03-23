import { z } from 'zod';

export const createUserSchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    githubUserId: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(5, 'Password must be at least 5 characters').optional(),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Developer']).optional(),
    isActive: z.boolean().optional(),
});
