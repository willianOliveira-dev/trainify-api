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
    GetSessionSetsParamsSchema,
    GetSessionSetsResponseSchema,
} from '../dto/get-session-sets.dto';

export type GetSessionSetsParams = z.infer<typeof GetSessionSetsParamsSchema>;
export type GetSessionSetsResponse = z.infer<typeof GetSessionSetsResponseSchema>;
export type GetSessionSetsHandler = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
        Params: GetSessionSetsParams;
        Reply: GetSessionSetsResponse;
    },
    ContextConfigDefault,
    FastifySchema,
    ZodTypeProvider
>;
