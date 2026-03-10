import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type {
    GetSessionSetsParamsSchema,
    GetSessionSetsResponseSchema,
} from '../dto/get-session-sets.dto';

export type GetSessionSetsParams = z.infer<typeof GetSessionSetsParamsSchema>;
export type GetSessionSetsResponse = z.infer<typeof GetSessionSetsResponseSchema>;
export type GetSessionSetsHandler = RouteHandler<{
    Params: GetSessionSetsParams;
    Reply: GetSessionSetsResponse;
}>;