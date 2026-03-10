import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type {
    UndoSetBodySchema,
    UndoSetParamsSchema,
} from '../dto/undo-set.dto';

export type UndoSetParams = z.infer<typeof UndoSetParamsSchema>;
export type UndoSetBody = z.infer<typeof UndoSetBodySchema>;
export type UndoSetHandler = RouteHandler<{
    Params: UndoSetParams;
    Body: UndoSetBody;
    Reply: undefined;
}>;