import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '@/shared/errors/schemas/error.schema';
import { privateMutationResponse, privateResponse } from '@/shared/http/schemas/response.schema';
import { usersController } from '../controllers/users.controller';
import { GetUserTrainDataResponseSchema, UpsertUserTrainDataSchema } from '../schemas/users.schema';

const usersRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.get('/me', {
    schema: {
      operationId: 'getMe',
      tags: ['Me'],
      summary: 'Retorna os dados de treino do usuário autenticado (null se não cadastrado)',
      response: privateResponse({
        200: GetUserTrainDataResponseSchema.describe('Dados de treino do usuário'),
      }),
    },
    handler: usersController.getMe,
  });

  app.put('/me/train-data', {
    schema: {
      operationId: 'upsertTrainData',
      tags: ['Me'],
      summary: 'Cria ou atualiza os dados de treino do usuário autenticado',
      body: UpsertUserTrainDataSchema,
      response: privateMutationResponse({
        200: GetUserTrainDataResponseSchema.describe('Dados de treino salvos com sucesso'),
        400: ErrorResponseSchema.describe('Dados inválidos'),
      }),
    },
    handler: usersController.upsertTrainData,
  });
};

export { usersRoutes };

