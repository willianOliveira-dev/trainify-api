import type { z } from 'zod';
import type {
    CreateWorkoutDaySchema,
    UpdateWorkoutDaySchema,
    WorkoutDaysParamsSchema,
    WorkoutDaysResponseSchema,
} from '@/modules/workout-days/schemas/workout-days.schema';

export type CreateWorkoutDayDto = z.infer<typeof CreateWorkoutDaySchema>;
export type UpdateWorkoutDayDto = z.infer<typeof UpdateWorkoutDaySchema>;
export type WorkoutDaysParamsDto = z.infer<typeof WorkoutDaysParamsSchema>;
export type WorkoutDaysResponseDto = z.infer<typeof WorkoutDaysResponseSchema>;
