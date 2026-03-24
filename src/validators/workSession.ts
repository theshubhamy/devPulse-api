import { z } from 'zod';

export const clockInSchema = z.object({
    source: z.enum(['desktop', 'web']).optional(),
});

export const clockOutSchema = z.object({
    idleMinutes: z.number().int().min(0).optional(),
});

export const breakStartSchema = z.object({
    type: z.enum(['short_break', 'lunch_break']),
});

export const breakEndSchema = z.object({
    type: z.enum(['short_break', 'lunch_break']),
});
