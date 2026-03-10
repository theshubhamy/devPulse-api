import { z } from 'zod';

export const createUserSchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    githubUserId: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    role: z.enum(['Owner', 'Admin', 'Manager', 'Developer']).optional(),
    isActive: z.boolean().optional(),
});
