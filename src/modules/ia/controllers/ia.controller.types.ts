/** biome-ignore-all lint/style/useNamingConvention: <explanation> */
import type { RouteHandler } from 'fastify';
import { z } from 'zod';
import { ChatBodySchema, ChatResponseSchema } from '../schemas/ia.schema';

export type ChatRequstBodySchema = z.infer<typeof ChatBodySchema>;
export type ChatResponseSchema = z.infer<typeof ChatResponseSchema>;

export type ChatHandler = RouteHandler<{
    Body: ChatRequstBodySchema;
    Reply: ChatResponseSchema;
}>;
