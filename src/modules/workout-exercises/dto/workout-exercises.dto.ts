import type z from 'zod';
import type {
  CreateWorkoutExerciseSchema,
  UpdateWorkoutExerciseSchema,
  WorkoutExerciseParamsSchema,
  WorkoutExerciseResponseSchema,
} from '@/modules/workout-exercises/schemas/workout-exercises.schema';

export type CreateWorkoutExerciseDto = z.infer<typeof CreateWorkoutExerciseSchema>;
export type UpdateWorkoutExerciseDto = z.infer<typeof UpdateWorkoutExerciseSchema>;
export type WorkoutExerciseParamsDto = z.infer<typeof WorkoutExerciseParamsSchema>;
export type WorkoutExerciseResponseDto = z.infer<typeof WorkoutExerciseResponseSchema>;

