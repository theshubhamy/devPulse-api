import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    plan: z.enum(['Starter', 'Growth', 'Enterprise']).optional(),
});
