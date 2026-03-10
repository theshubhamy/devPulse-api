import { z } from 'zod';

export const createRepositorySchema = z.object({
    organizationId: z.string().min(1, 'Organization ID is required'),
    githubRepoId: z.string().min(1, 'GitHub Repo ID is required'),
    name: z.string().min(1, 'Name is required'),
});
