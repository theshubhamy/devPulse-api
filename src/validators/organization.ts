import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    githubOrgId: z.string().optional(),
    plan: z.enum(['Starter', 'Growth', 'Enterprise']).optional(),
});
