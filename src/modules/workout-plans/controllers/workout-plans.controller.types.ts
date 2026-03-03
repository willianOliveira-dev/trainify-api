/** biome-ignore-all lint/style/useNamingConvention: <explanation> */

import type { RouteHandler } from 'fastify';
import type {
  CreateWorkoutPlanDto,
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
export type FindByIdWorkoutPlanResponse = WorkoutPlanResponseDto;
export type FindByIdHandler = RouteHandler<{
  Params: FindByIdWorkoutPlanParams;
  Reply: FindByIdWorkoutPlanResponse;
}>;

export type FindAllWorkoutPlansResponse = WorkoutPlansListResponseDto;
export type FindAllWorkoutPlansHandler = RouteHandler<{
  Reply: FindAllWorkoutPlansResponse;
}>;
