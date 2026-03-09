import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type {
  UpdateWorkoutSessionBodySchema,
  UpdateWorkoutSessionParamsSchema,
  UpdateWorkoutSessionResponseSchema,
} from '../dto/update-workout-session.dto';

export type UpdateWorkoutSessionParams = z.infer<typeof UpdateWorkoutSessionParamsSchema>;
export type UpdateWorkoutSessionBody = z.infer<typeof UpdateWorkoutSessionBodySchema>;
export type UpdateWorkoutSessionResponse = z.infer<typeof UpdateWorkoutSessionResponseSchema>;
export type UpdateWorkoutSessionHandler = RouteHandler<{
  Params: UpdateWorkoutSessionParams;
  Body: UpdateWorkoutSessionBody;
  Reply: UpdateWorkoutSessionResponse;
}>;
