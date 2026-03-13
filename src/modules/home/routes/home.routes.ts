import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '@/shared/errors/schemas/error.schema';
import { privateResponse } from '@/shared/http/schemas/response.schema';
import { homeController } from '../controllers/home.controller';
import { GetHomeParamsSchema, GetHomeResponseSchema } from '../schemas/home.schema';

const home: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/home/:date', {
    schema: {
      operationId: 'getHomeData',
      tags: ['Home'],
      summary: 'Retorna os dados da home com base em uma data',
      params: GetHomeParamsSchema,
      response: privateResponse({
        200: GetHomeResponseSchema.describe('Dados da tela Home carregados com sucesso'),
        400: ErrorResponseSchema.describe('Data inválida'),
      }),
    },
    handler: homeController.getHomeData,
  });
};

export { home };

