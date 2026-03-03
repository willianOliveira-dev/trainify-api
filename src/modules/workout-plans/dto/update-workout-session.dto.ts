import { z } from 'zod';

export const UpdateWorkoutSessionParamsSchema = z.object({
  id: z.string().uuid({ message: 'Id do plano deve ser um uuid' }),
  dayId: z.string().uuid({ message: 'Id do dia deve ser um uuid' }),
  sessionId: z.string().uuid({ message: 'Id da sessão deve ser um uuid' }),
});

export const UpdateWorkoutSessionBodySchema = z.object({
  completedAt: z.string().datetime({ message: 'completedAt deve ser uma data ISO válida' }),
});

export const UpdateWorkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
});
