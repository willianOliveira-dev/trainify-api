/** biome-ignore-all lint/style/useNamingConvention: <explanation> */

import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type {
  WorkoutPlanSessionParamsSchema,
  WorkoutSessionResponseSchema,
} from '../dto/start-session.dto';

export type StartWorkoutSessionParams = z.infer<typeof WorkoutPlanSessionParamsSchema>;
export type StartWorkoutSessionResponse = z.infer<typeof WorkoutSessionResponseSchema>;
export type StartWorkoutSessionHandler = RouteHandler<{
  Params: StartWorkoutSessionParams;
  Reply: StartWorkoutSessionResponse;
}>;
