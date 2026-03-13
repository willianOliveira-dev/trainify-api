import { z } from 'zod';
import {
  CreateWorkoutPlanSchema,
  type GetWorkoutDayResponseSchema,
  type GetWorkoutPlanDetailsResponseSchema,
  type UpdateWorkoutPlanSchema,
  type WorkoutPlanDayParamsSchema,
  type WorkoutPlanParamsSchema,
  type WorkoutPlanResponseSchema,
  type WorkoutPlansListResponseSchema,
} from '@/modules/workout-plans/schemas/workout-plans.schema';

const CreateWorkoutPlanDtoSchema = CreateWorkoutPlanSchema.extend({
  userId: z.uuid({ version: 'v7', message: 'Usuário é obrigatório' }),
});

export type CreateWorkoutPlanDto = z.infer<typeof CreateWorkoutPlanDtoSchema>;
export type UpdateWorkoutPlanDto = z.infer<typeof UpdateWorkoutPlanSchema>;
export type WorkoutPlanParamsDto = z.infer<typeof WorkoutPlanParamsSchema>;
export type WorkoutPlanDayParamsDto = z.infer<typeof WorkoutPlanDayParamsSchema>;
export type WorkoutPlanResponseDto = z.infer<typeof WorkoutPlanResponseSchema>;
export type WorkoutPlansListResponseDto = z.infer<typeof WorkoutPlansListResponseSchema>;
export type GetWorkoutPlanDetailsResponseDto = z.infer<typeof GetWorkoutPlanDetailsResponseSchema>;
export type GetWorkoutDayResponseDto = z.infer<typeof GetWorkoutDayResponseSchema>;

