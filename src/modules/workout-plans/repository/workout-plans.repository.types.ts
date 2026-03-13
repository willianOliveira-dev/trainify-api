import type { InferSelectModel } from 'drizzle-orm';
import type { userWorkoutSessions, workoutDays, workoutExercises, workoutPlans } from '@/db/schemas';
import type {
  CreateWorkoutPlanDto,
  GetWorkoutDayResponseDto,
  GetWorkoutPlanDetailsResponseDto,
  UpdateWorkoutPlanDto,
} from '@/modules/workout-plans/dto/workout-plans.dto';

export type CreateWorkoutPlanRepositoryInput = CreateWorkoutPlanDto;
export type UpdateWorkoutPlanRepositoryInput = UpdateWorkoutPlanDto;

export type WorkoutPlanWithRelations = InferSelectModel<typeof workoutPlans> & {
  workoutDays: (InferSelectModel<typeof workoutDays> & {
    exercises: InferSelectModel<typeof workoutExercises>[];
  })[];
};

export type WorkoutPlanRepositoryDbOutput = WorkoutPlanWithRelations;
export type WorkoutPlanActiveByUserDbOutput = InferSelectModel<typeof workoutPlans> & {
  workoutDays: (InferSelectModel<typeof workoutDays> & {
    exercises: InferSelectModel<typeof workoutExercises>[];
    sessions: InferSelectModel<typeof userWorkoutSessions>[];
  })[];
};
export type WorkoutPlansListRepositoryDbOutput = WorkoutPlanWithRelations[];
export type WorkoutPlanDetailsRepositoryDbOutput = GetWorkoutPlanDetailsResponseDto & {
  userId: string;
};
export type WorkoutDayDetailsRepositoryDbOutput = GetWorkoutDayResponseDto & {
  workoutPlanUserId: string;
};

