import { z } from 'zod';
import { weekDayEnum } from '@/db/schemas/enums/week-day-enum';
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

export const WorkoutPlanDayParamsSchema = WorkoutPlanParamsSchema.extend({
  dayId: z
    .uuid({ version: 'v7', message: 'DayId deve ser um uuid v7' })
    .nonempty({ message: 'DayId é obrigatório' }),
});

export const WorkoutPlanResponseSchema = WorkoutPlansSchema.omit({
  userId: true,
}).extend({
  workoutDays: z.array(WorkoutDaysResponseSchema),
});

export const WorkoutPlansListResponseSchema = z.array(WorkoutPlanResponseSchema);

export const GetWorkoutPlanDetailsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      id: z.string(),
      weekDay: z.enum(weekDayEnum.enumValues),
      name: z.string(),
      isRest: z.boolean(),
      coverImageUrl: z.string().optional(),
      estimatedDurationInSeconds: z.number(),
      exercisesCount: z.number(),
    }),
  ),
});

export const GetWorkoutDayResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  isRest: z.boolean(),
  coverImageUrl: z.string().nullable(),
  estimatedDurationInSeconds: z.number(),
  weekDay: z.enum(weekDayEnum.enumValues),
  exercises: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      sets: z.number(),
      reps: z.number(),
      restTimeInSeconds: z.number(),
      youtubeVideoId: z.string().nullable(),
      order: z.number(),
      workoutDayId: z.string(),
    }),
  ),
  sessions: z.array(
    z.object({
      id: z.string(),
      workoutDayId: z.string(),
      startedAt: z.date().nullable(),
      completedAt: z.date().nullable(),
    }),
  ),
});
