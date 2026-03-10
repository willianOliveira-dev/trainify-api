import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type {
    CompleteSetBodySchema,
    CompleteSetParamsSchema,
    CompleteSetResponseSchema,
} from '../dto/complete-set.dto';

export type CompleteSetParams = z.infer<typeof CompleteSetParamsSchema>;
export type CompleteSetBody = z.infer<typeof CompleteSetBodySchema>;
export type CompleteSetResponse = z.infer<typeof CompleteSetResponseSchema>;
export type CompleteSetHandler = RouteHandler<{
    Params: CompleteSetParams;
    Body: CompleteSetBody;
    Reply: CompleteSetResponse;
}>;