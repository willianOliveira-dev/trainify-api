import { z } from 'zod';

export const GetSessionSetsParamsSchema = z.object({
    id: z.string(),
    dayId: z.string(),
    sessionId: z.string(),
});

export const GetSessionSetsResponseSchema = z.array(
    z.object({
        id: z.string(),
        sessionId: z.string(),
        exerciseId: z.string(),
        setNumber: z.number(),
        completedAt: z.date(),
    }),
);
