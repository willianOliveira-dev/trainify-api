import { z } from 'zod';
import { weekDayEnum } from '@/db/schemas/enums/week-day-enum';

export const GetHomeParamsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data deve estar no formato YYYY-MM-DD' }),
});

export const ConsistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
});

export const GetHomeResponseSchema = z.object({
  activeWorkoutPlanId: z.string(),
  todayWorkoutDay: z.object({
    workoutPlanId: z.string(),
    id: z.string(),
    name: z.string(),
    isRest: z.boolean(),
    weekDay: z.enum(weekDayEnum.enumValues),
    estimatedDurationInSeconds: z.number(),
    coverImageUrl: z.string().nullable(),
    exercisesCount: z.number(),
  }).nullable(),
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.iso.date(), ConsistencyDaySchema).nullable(),
});
