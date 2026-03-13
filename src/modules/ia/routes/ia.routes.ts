import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { iaController } from '@/modules/ia/controllers/ia.controller';
import { ChatBodySchema } from '@/modules/ia/schemas/ia.schema';

const iaRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.post('/ai/chat', {
    schema: {
      operationId: 'chat',
      tags: ['IA'],
      summary: 'Conversa com o personal trainer virtual',
      body: ChatBodySchema,
    },
    handler: iaController.chat,
  });
};

export { iaRoutes };

