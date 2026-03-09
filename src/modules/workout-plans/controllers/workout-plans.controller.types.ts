import type { RouteHandler } from 'fastify';
import type {
  CreateWorkoutPlanDto,
  GetWorkoutDayResponseDto,
  GetWorkoutPlanDetailsResponseDto,
  WorkoutPlanDayParamsDto,
  WorkoutPlanParamsDto,
  WorkoutPlanResponseDto,
  WorkoutPlansListResponseDto,
} from '../dto/workout-plans.dto';

export type CreateWorkoutPlanRequestBody = CreateWorkoutPlanDto;
export type CreateWorkoutPlanResponse = WorkoutPlanResponseDto;
export type CreateWorkoutPlanHandler = RouteHandler<{
  Body: CreateWorkoutPlanRequestBody;
  Reply: CreateWorkoutPlanResponse;
}>;

export type FindByIdWorkoutPlanParams = WorkoutPlanParamsDto;
export type FindByIdWorkoutPlanResponse = GetWorkoutPlanDetailsResponseDto;
export type FindByIdHandler = RouteHandler<{
  Params: FindByIdWorkoutPlanParams;
  Reply: FindByIdWorkoutPlanResponse;
}>;

export type FindDayDetailsParams = WorkoutPlanDayParamsDto;
export type FindDayDetailsResponse = GetWorkoutDayResponseDto;
export type FindDayDetailsHandler = RouteHandler<{
  Params: FindDayDetailsParams;
  Reply: FindDayDetailsResponse;
}>;

export type FindAllWorkoutPlansResponse = WorkoutPlansListResponseDto;
export type FindAllWorkoutPlansHandler = RouteHandler<{
  Reply: FindAllWorkoutPlansResponse;
}>;
