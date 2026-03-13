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
    CompleteSetBodySchema,
    CompleteSetParamsSchema,
    CompleteSetResponseSchema,
} from '../dto/complete-set.dto';

export type CompleteSetParams = z.infer<typeof CompleteSetParamsSchema>;
export type CompleteSetBody = z.infer<typeof CompleteSetBodySchema>;
export type CompleteSetResponse = z.infer<typeof CompleteSetResponseSchema>;
export type CompleteSetHandler = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
        Params: CompleteSetParams;
        Body: CompleteSetBody;
        Reply: CompleteSetResponse;
    },
    ContextConfigDefault,
    FastifySchema,
    ZodTypeProvider
>;
