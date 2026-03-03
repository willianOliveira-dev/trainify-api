import { z } from 'zod';
import {
  CreateWorkoutDaySchema,
  WorkoutDaysResponseSchema,
} from '@/modules/workout-days/schemas/workout-days.schema';

export const WorkoutPlansSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(50, {
      message: 'Nome deve ter no máximo 50 caracteres',
    })
    .nonempty({ message: 'Nome é obrigatório' }),
  userId: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Usuário é obrigatório' }),
  isActive: z.boolean({ message: 'Ativo deve ser booleano' }).default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutPlanSchema = WorkoutPlansSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  workoutDays: z.array(CreateWorkoutDaySchema.omit({ workoutPlanId: true })),
});

export const UpdateWorkoutPlanSchema = WorkoutPlansSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  workoutDays: z.array(CreateWorkoutDaySchema.omit({ workoutPlanId: true })),
});

export const WorkoutPlanParamsSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
});

export const WorkoutPlanResponseSchema = WorkoutPlansSchema.omit({
  userId: true,
}).extend({
  workoutDays: z.array(WorkoutDaysResponseSchema),
});

export const WorkoutPlansListResponseSchema = z.array(WorkoutPlanResponseSchema);
