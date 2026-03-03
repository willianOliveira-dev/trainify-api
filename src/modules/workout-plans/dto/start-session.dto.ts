import { z } from 'zod';

export const WorkoutPlanSessionParamsSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'Id do plano deve ser um uuid' })
    .nonempty({ message: 'Id do plano é obrigatório' }),
  dayId: z
    .string()
    .uuid({ message: 'Id do dia deve ser um uuid' })
    .nonempty({ message: 'Id do dia é obrigatório' }),
});

export const WorkoutSessionResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  workoutDayId: z.string().uuid(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
});
