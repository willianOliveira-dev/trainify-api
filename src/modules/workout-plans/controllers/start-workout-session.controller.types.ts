import type {
    FastifySchema,
    ContextConfigDefault,
    RawReplyDefaultExpression,
    RawRequestDefaultExpression,
    RawServerDefault,
    RouteHandlerMethod,
} from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import type { z } from 'zod';
import type {
    WorkoutPlanSessionParamsSchema,
    WorkoutSessionResponseSchema,
} from '../dto/start-session.dto';

export type StartWorkoutSessionParams = z.infer<typeof WorkoutPlanSessionParamsSchema>;
export type StartWorkoutSessionResponse = z.infer<typeof WorkoutSessionResponseSchema>;
export type StartWorkoutSessionHandler = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
        Params: StartWorkoutSessionParams;
        Reply: StartWorkoutSessionResponse;
    },
    ContextConfigDefault,
    FastifySchema,
    ZodTypeProvider
>;

