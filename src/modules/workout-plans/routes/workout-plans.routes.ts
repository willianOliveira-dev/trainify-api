import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '@/shared/errors/schemas/error.schema';
import { privateMutationResponse, privateResponse } from '@/shared/http/schemas/response.schema';
import { workoutPlansController } from '../controllers/workout-plans.controller';
import {
  WorkoutPlanSessionParamsSchema,
  WorkoutSessionResponseSchema,
} from '../dto/start-session.dto';
import {
  UpdateWorkoutSessionBodySchema,
  UpdateWorkoutSessionParamsSchema,
  UpdateWorkoutSessionResponseSchema,
} from '../dto/update-workout-session.dto';
import {
  CreateWorkoutPlanSchema,
  GetWorkoutPlanDetailsResponseSchema,
  WorkoutPlanParamsSchema,
  WorkoutPlanResponseSchema,
  WorkoutPlansListResponseSchema,
} from '../schemas/workout-plans.schema';

const workoutPlans: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate);

  app.post('/workout-plans/:id/days/:dayId/sessions', {
    schema: {
      tags: ['Workout Plans'],
      summary: 'Inicia uma nova sessão de treino',
      params: WorkoutPlanSessionParamsSchema,
      response: privateMutationResponse({
        201: WorkoutSessionResponseSchema.describe('Sessão iniciada com sucesso'),
        404: ErrorResponseSchema.describe('Plano ou Dia de treino não encontrado'),
        409: ErrorResponseSchema.describe('Sessão já iniciada para o dia informado'),
      }),
    },
    handler: workoutPlansController.startSession,
  });

  app.patch('/workout-plans/:id/days/:dayId/sessions/:sessionId', {
    schema: {
      tags: ['Workout Plans'],
      summary: 'Atualiza uma sessão de treino',
      params: UpdateWorkoutSessionParamsSchema,
      body: UpdateWorkoutSessionBodySchema,
      response: privateMutationResponse({
        200: UpdateWorkoutSessionResponseSchema.describe('Sessão atualizada com sucesso'),
        404: ErrorResponseSchema.describe('Plano ou Sessão de treino não encontrado(a)'),
      }),
    },
    handler: workoutPlansController.updateSession,
  });

  app.post('/workout-plans', {
    schema: {
      tags: ['Workout Plans'],
      summary: 'Cria um novo plano de treino',
      body: CreateWorkoutPlanSchema,
      response: privateMutationResponse({
        201: WorkoutPlanResponseSchema.describe('Plano de treino criado com sucesso'),
        404: ErrorResponseSchema.describe('Plano de treino não encontrado'),
      }),
    },
    handler: workoutPlansController.create,
  });

  app.get('/workout-plans', {
    schema: {
      tags: ['Workout Plans'],
      summary: 'Retorna todos os planos de treino',
      response: privateResponse({
        200: WorkoutPlansListResponseSchema.describe('Planos de treinos encontrados'),
      }),
    },
    handler: workoutPlansController.findAll,
  });

  app.get('/workout-plans/:id', {
    schema: {
      tags: ['Workout Plans'],
      summary: 'Retorna um plano de treino',
      params: WorkoutPlanParamsSchema,
      response: privateResponse({
        200: GetWorkoutPlanDetailsResponseSchema.describe('Plano de treino encontrado'),
        404: ErrorResponseSchema.describe('Plano de treino não encontrado'),
      }),
    },
    handler: workoutPlansController.findById,
  });
};

export { workoutPlans };
