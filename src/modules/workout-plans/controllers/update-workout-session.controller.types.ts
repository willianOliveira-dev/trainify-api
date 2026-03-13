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
    UpdateWorkoutSessionBodySchema,
    UpdateWorkoutSessionParamsSchema,
    UpdateWorkoutSessionResponseSchema,
} from '../dto/update-workout-session.dto';

export type UpdateWorkoutSessionParams = z.infer<typeof UpdateWorkoutSessionParamsSchema>;
export type UpdateWorkoutSessionBody = z.infer<typeof UpdateWorkoutSessionBodySchema>;
export type UpdateWorkoutSessionResponse = z.infer<typeof UpdateWorkoutSessionResponseSchema>;
export type UpdateWorkoutSessionHandler = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
        Params: UpdateWorkoutSessionParams;
        Body: UpdateWorkoutSessionBody;
        Reply: UpdateWorkoutSessionResponse;
    },
    ContextConfigDefault,
    FastifySchema,
    ZodTypeProvider
>;

