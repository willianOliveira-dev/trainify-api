import type {
  CreateWorkoutPlanDto,
  UpdateWorkoutPlanDto,
  WorkoutPlanParamsDto,
  WorkoutPlanResponseDto,
  WorkoutPlansListResponseDto,
} from '../dto/workout-plans.dto';

export type CreateWorkoutPlanUseCaseInput = CreateWorkoutPlanDto;
export type CreateWorkoutPlanUseCaseOutput = WorkoutPlanResponseDto;

export type GetWorkoutPlanUseCaseInput = WorkoutPlanParamsDto;
export type GetWorkoutPlanUseCaseOutput = WorkoutPlanResponseDto;

export type GetAllWorkoutPlanUseCaseOutput = WorkoutPlansListResponseDto;

export type UpdateWorkoutPlanUseCaseInput = UpdateWorkoutPlanDto;
export type UpdateWorkoutPlanUseCaseOutput = WorkoutPlanResponseDto;

