import { z } from 'zod';

export const CompleteSetParamsSchema = z.object({
    id: z.string(),
    dayId: z.string(),
    sessionId: z.string(),
    exerciseId: z.string(),
});

export const CompleteSetBodySchema = z.object({
    setNumber: z.number().int().min(1),
    totalSetsInWorkout: z.number().int().min(1),
});

export const CompleteSetResponseSchema = z.object({
    set: z.object({
        id: z.string(),
        sessionId: z.string(),
        exerciseId: z.string(),
        setNumber: z.number(),
        completedAt: z.date(),
    }),
    autoCompleted: z.boolean(),
});