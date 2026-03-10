import { tool } from 'ai';
import { z } from 'zod';
import { weekDayEnum } from '@/db/schemas/enums/week-day-enum';
import type {
    GetUserTrainDataResponseDto,
    UpsertUserTrainDataDto,
} from '@/modules/users/dto/users.dto';
import { UpsertUserTrainDataSchema } from '@/modules/users/schemas/users.schema';
import { getUserTrainDataUseCase } from '@/modules/users/use-cases/get-user-train-data.use-case';
import { upsertUserTrainDataUseCase } from '@/modules/users/use-cases/upsert-user-train-data.use-case';
import type {
    CreateWorkoutPlanDto,
    WorkoutPlanResponseDto,
    WorkoutPlansListResponseDto,
} from '@/modules/workout-plans/dto/workout-plans.dto';
import { createWorkoutPlanUseCase } from '@/modules/workout-plans/use-cases/create-workout-plan.use-case';
import { listWorkoutPlansUseCase } from '@/modules/workout-plans/use-cases/list-workout-plans.use-case';

function buildAiTools(userId: string) {
    return {
        getUserTrainData: tool({
            description: 'Busca os dados de treino e perfil do usuário logado.',
            inputSchema: z.object({}),
            execute: async (): Promise<
                GetUserTrainDataResponseDto
            > => {
                const data = await getUserTrainDataUseCase.execute({ userId });
                return data;
            },
        }),

        upsertUserTrainData: tool({
            description: 'Cria ou atualiza os dados de treino do usuário.',
            inputSchema: UpsertUserTrainDataSchema,
            execute: async (
                input: UpsertUserTrainDataDto,
            ): Promise<GetUserTrainDataResponseDto> => {
                return await upsertUserTrainDataUseCase.execute({
                    userId,
                    ...input,
                });
            },
        }),

        getWorkoutPlans: tool({
            description: 'Lista todos os planos de treino do usuário.',
            inputSchema: z.object({}),
            execute: async (): Promise<WorkoutPlansListResponseDto> => {
                return await listWorkoutPlansUseCase.execute({ userId });
            },
        }),

        createWorkoutPlan: tool({
            description:
                'Cria um novo plano de treino completo para o usuário.',
            inputSchema: z.object({
                name: z.string().describe('Nome do plano de treino'),
                workoutDays: z
                    .array(
                        z.object({
                            name: z.string().describe('Nome do dia de treino'),
                            weekDay: z
                                .enum(weekDayEnum.enumValues)
                                .describe(
                                    'Dia da semana em inglês: monday, tuesday, wednesday, thursday, friday, saturday, sunday',
                                ),
                            isRest: z
                                .boolean()
                                .describe('Se é um dia de descanso ou treino'),
                            estimatedDurationInSeconds: z
                                .number()
                                .describe(
                                    'Duração estimada do treino em segundos',
                                ),
                            coverCategory: z
                                .enum([
                                    'chest',
                                    'back',
                                    'legs',
                                    'shoulders',
                                    'arms',
                                    'core',
                                    'fullbody',
                                    'cardio',
                                    'rest',
                                ])
                                .describe(
                                    'Categoria visual do dia de treino. Escolha com base no foco principal dos exercícios. Use "rest" para dias de descanso.',
                                ),
                            exercises: z
                                .array(
                                    z.object({
                                        name: z
                                            .string()
                                            .describe('Nome do exercício'),
                                        order: z
                                            .number()
                                            .describe(
                                                'Ordem de execução do exercício',
                                            ),
                                        sets: z
                                            .number()
                                            .describe('Número de séries'),
                                        reps: z
                                            .number()
                                            .describe(
                                                'Número de repetições por série',
                                            ),
                                        restTimeInSeconds: z
                                            .number()
                                            .describe(
                                                'Tempo de descanso entre séries em segundos',
                                            ),
                                    }),
                                )
                                .describe('Lista de exercícios do dia'),
                        }),
                    )
                    .describe('Dias da semana com seus treinos e exercícios'),
            }),
            execute: async (
                input: Omit<CreateWorkoutPlanDto, 'userId' | 'isActive'>,
            ): Promise<WorkoutPlanResponseDto> => {
                return await createWorkoutPlanUseCase.execute({
                    userId,
                    ...input,
                    isActive: true,
                });
            },
        }),
    };
}

export { buildAiTools };
