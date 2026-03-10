import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { ErrorResponseSchema } from '@/shared/errors/schemas/error.schema';
import {
    privateMutationResponse,
    privateResponse,
} from '@/shared/http/schemas/response.schema';
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
    GetWorkoutDayResponseSchema,
    GetWorkoutPlanDetailsResponseSchema,
    WorkoutPlanDayParamsSchema,
    WorkoutPlanParamsSchema,
    WorkoutPlanResponseSchema,
    WorkoutPlansListResponseSchema,
} from '../schemas/workout-plans.schema';
import { CompleteSetBodySchema, CompleteSetParamsSchema, CompleteSetResponseSchema } from '../dto/complete-set.dto';
import { UndoSetBodySchema, UndoSetParamsSchema } from '../dto/undo-set.dto';
import z from 'zod';

const workoutPlans: FastifyPluginAsyncZod = async (app) => {
    app.addHook('onRequest', app.authenticate);

    app.post('/workout-plans/:id/days/:dayId/sessions', {
        schema: {
            operationId: 'startSession',
            tags: ['Workout Plans'],
            summary: 'Inicia uma nova sessão de treino',
            params: WorkoutPlanSessionParamsSchema,
            response: privateMutationResponse({
                201: WorkoutSessionResponseSchema.describe(
                    'Sessão iniciada com sucesso',
                ),
                404: ErrorResponseSchema.describe(
                    'Plano ou Dia de treino não encontrado',
                ),
                409: ErrorResponseSchema.describe(
                    'Sessão já iniciada para o dia informado',
                ),
            }),
        },
        handler: workoutPlansController.startSession,
    });

    app.patch('/workout-plans/:id/days/:dayId/sessions/:sessionId', {
        schema: {
            operationId: 'updateSessionData',
            tags: ['Workout Plans'],
            summary: 'Atualiza uma sessão de treino',
            params: UpdateWorkoutSessionParamsSchema,
            body: UpdateWorkoutSessionBodySchema,
            response: privateMutationResponse({
                200: UpdateWorkoutSessionResponseSchema.describe(
                    'Sessão atualizada com sucesso',
                ),
                404: ErrorResponseSchema.describe(
                    'Plano ou Sessão de treino não encontrado(a)',
                ),
            }),
        },
        handler: workoutPlansController.updateSession,
    });

    app.post('/workout-plans', {
        schema: {
            operationId: 'createWorkoutPlanData',
            tags: ['Workout Plans'],
            summary: 'Cria um novo plano de treino',
            body: CreateWorkoutPlanSchema,
            response: privateMutationResponse({
                201: WorkoutPlanResponseSchema.describe(
                    'Plano de treino criado com sucesso',
                ),
                404: ErrorResponseSchema.describe(
                    'Plano de treino não encontrado',
                ),
            }),
        },
        handler: workoutPlansController.create,
    });

    app.get('/workout-plans', {
        schema: {
            operationId: 'getAllWorkoutPlansData',
            tags: ['Workout Plans'],
            summary: 'Retorna todos os planos de treino',
            response: privateResponse({
                200: WorkoutPlansListResponseSchema.describe(
                    'Planos de treinos encontrados',
                ),
            }),
        },
        handler: workoutPlansController.findAll,
    });

    app.get('/workout-plans/:id', {
        schema: {
            operationId: 'getWorkoutPlanDetailsdData',
            tags: ['Workout Plans'],
            summary: 'Retorna um plano de treino',
            params: WorkoutPlanParamsSchema,
            response: privateResponse({
                200: GetWorkoutPlanDetailsResponseSchema.describe(
                    'Plano de treino encontrado',
                ),
                404: ErrorResponseSchema.describe(
                    'Plano de treino não encontrado',
                ),
            }),
        },
        handler: workoutPlansController.findById,
    });

    app.get('/workout-plans/:id/days/:dayId', {
        schema: {
            operationId: 'getWorkoutPlanDayDetailsData',
            tags: ['Workout Plans'],
            summary: 'Retorna os detalhes de um dia do plano',
            params: WorkoutPlanDayParamsSchema,
            response: privateResponse({
                200: GetWorkoutDayResponseSchema.describe(
                    'Dia do plano retornado com sucesso',
                ),
                404: ErrorResponseSchema.describe(
                    'Plano ou Dia de treino não encontrado',
                ),
            }),
        },
        handler: workoutPlansController.findDayDetails,
    });

    app.post(
        '/workout-plans/:id/days/:dayId/sessions/:sessionId/exercises/:exerciseId/sets',
        {
            schema: {
                operationId: 'completeSet',
                tags: ['Workout Plans'],
                summary: 'Marca uma série como concluída',
                params: CompleteSetParamsSchema,
                body: CompleteSetBodySchema,
                response: privateMutationResponse({
                    200: CompleteSetResponseSchema.describe(
                        'Série concluída com sucesso',
                    ),
                    404: ErrorResponseSchema.describe(
                        'Sessão de treino não encontrada',
                    ),
                }),
            },
            handler: workoutPlansController.completeSet,
        },
    );

    app.delete(
        '/workout-plans/:id/days/:dayId/sessions/:sessionId/exercises/:exerciseId/sets',
        {
            schema: {
                operationId: 'undoSet',
                tags: ['Workout Plans'],
                summary: 'Desmarca uma série concluída',
                params: UndoSetParamsSchema ,
                body: UndoSetBodySchema,
                response: privateMutationResponse({
                    204: z.void().describe('Série desmarcada com sucesso'),
                    404: ErrorResponseSchema.describe(
                        'Sessão de treino não encontrada',
                    ),
                }),
            },
            handler: workoutPlansController.undoSet,
        },
    );
};

export { workoutPlans };
