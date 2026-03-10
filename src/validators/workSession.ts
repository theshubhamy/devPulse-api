import { z } from 'zod';

export const clockInSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    source: z.enum(['desktop', 'web']).optional(),
});

export const clockOutSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    idleMinutes: z.number().int().min(0).optional(),
});
