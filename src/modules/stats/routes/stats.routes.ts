import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '@/shared/errors/schemas/error.schema';
import { privateResponse } from '@/shared/http/schemas/response.schema';
import { statsController } from '../controllers/stats.controller';
import { GetStatsQuerySchema, GetStatsResponseSchema } from '../schemas/stats.schema';

const statsRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/stats', {
    schema: {
      operationId: 'getStats',
      tags: ['Stats'],
      summary: 'Retorna as métricas de desempenho do usuário em um período',
      querystring: GetStatsQuerySchema,
      response: privateResponse({
        200: GetStatsResponseSchema.describe('Métricas carregadas com sucesso'),
        400: ErrorResponseSchema.describe('Parâmetros de data inválidos'),
      }),
    },
    handler: statsController.getStats,
  });
};

export { statsRoutes };
