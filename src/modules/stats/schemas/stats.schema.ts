import { z } from 'zod';

export const GetStatsQuerySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
});

export const ConsistencyDaySchema = z.object({
  workoutDayCompleted: z.boolean(),
  workoutDayStarted: z.boolean(),
});

export const GetStatsResponseSchema = z.object({
  workoutStreak: z.number(),
  consistencyByDay: z.record(z.string(), ConsistencyDaySchema),
  completedWorkoutsCount: z.number(),
  conclusionRate: z.number(),
  totalTimeInSeconds: z.number(),
});
