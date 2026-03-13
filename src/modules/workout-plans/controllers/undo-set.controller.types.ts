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
    UndoSetBodySchema,
    UndoSetParamsSchema,
} from '../dto/undo-set.dto';

export type UndoSetParams = z.infer<typeof UndoSetParamsSchema>;
export type UndoSetBody = z.infer<typeof UndoSetBodySchema>;
export type UndoSetHandler = RouteHandlerMethod<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    {
        Params: UndoSetParams;
        Body: UndoSetBody;
        Reply: void;
    },
    ContextConfigDefault,
    FastifySchema,
    ZodTypeProvider
>;
