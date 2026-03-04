import { tool } from 'ai';
import { z } from 'zod';
import { getUserTrainDataUseCase } from '@/modules/users/use-cases/get-user-train-data.use-case';
import { upsertUserTrainDataUseCase } from '@/modules/users/use-cases/upsert-user-train-data.use-case';
import { createWorkoutPlanUseCase } from '@/modules/workout-plans/use-cases/create-workout-plan.use-case';
import { listWorkoutPlansUseCase } from '@/modules/workout-plans/use-cases/list-workout-plans.use-case';
import { UpsertUserTrainDataSchema } from '@/modules/users/schemas/users.schema';
import type {
    GetUserTrainDataResponseDto,
    UpsertUserTrainDataDto,
} from '@/modules/users/dto/users.dto';
import { weekDayEnum } from '@/db/schemas/enums/week-day-enum';
import type {
    CreateWorkoutPlanDto,
    WorkoutPlanResponseDto,
    WorkoutPlansListResponseDto,
} from '@/modules/workout-plans/dto/workout-plans.dto';

const buildAiTools = (userId: string) => ({
    getUserTrainData: tool({
        description: 'Busca os dados de treino e perfil do usuário logado.',
        inputSchema: z.object({}),
        execute: async (): Promise<
            GetUserTrainDataResponseDto | { notFound: true }
        > => {
            const data = await getUserTrainDataUseCase.execute({ userId });
            return data ?? { notFound: true };
        },
    }),

    updateUserTrainData: tool({
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
        description: 'Cria um novo plano de treino completo para o usuário.',
        inputSchema: z.object({
            name: z.string().describe('Nome do plano de treino'),
            workoutDays: z.array(
                z.object({
                    name: z.string(),
                    weekDay: z.enum(weekDayEnum.enumValues),
                    isRest: z.boolean(),
                    // Importante: Google Tools não aceita enum vazio; evitar union com ''.
                    coverImageUrl: z.string().url().optional(),
                    estimatedDurationInSeconds: z.number(),
                    exercises: z.array(
                        z.object({
                            name: z.string(),
                            order: z.number(),
                            sets: z.number(),
                            reps: z.number(),
                            restTimeInSeconds: z.number(),
                        }),
                    ),
                }),
            ),
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
});

export { buildAiTools };
