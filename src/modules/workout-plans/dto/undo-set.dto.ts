import { z } from 'zod';

export const UndoSetParamsSchema = z.object({
    id: z.string(),
    dayId: z.string(),
    sessionId: z.string(),
    exerciseId: z.string(),
});

export const UndoSetBodySchema = z.object({
    setNumber: z.number().int().min(1),
});