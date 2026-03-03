import type { InferSelectModel } from 'drizzle-orm';
import type { workoutDays, workoutExercises, workoutPlans } from '@/db/schemas';
import type {
    CreateWorkoutPlanDto,
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
export type WorkoutPlansListRepositoryDbOutput = WorkoutPlanWithRelations[];
