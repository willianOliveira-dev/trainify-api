import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { iaController } from '@/modules/ia/controllers/ia.controller';
import { ChatBodySchema, ChatResponseSchema } from '@/modules/ia/schemas/ia.schema';
import { privateMutationResponse } from '@/shared/http/schemas/response.schema';

const iaRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.post('/chat', {
    schema: {
      tags: ['IA'],
      summary: 'Conversa com o personal trainer virtual',
      body: ChatBodySchema,
      response: privateMutationResponse({
        201: ChatResponseSchema.describe('Resposta da IA'),
      })
    },
    handler: iaController.chat,
  });
};

export { iaRoutes };
