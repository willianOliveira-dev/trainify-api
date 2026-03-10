import type { RouteHandler } from 'fastify';
import type { z } from 'zod';
import type { ChatBodySchema } from '../schemas/ia.schema';

export type ChatRequestBody = z.infer<typeof ChatBodySchema>;

export type ChatHandler = RouteHandler<{
  Body: ChatRequestBody;
}>;
