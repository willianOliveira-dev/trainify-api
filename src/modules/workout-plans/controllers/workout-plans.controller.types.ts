import type {
  ContextConfigDefault,
  FastifySchema,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
  RouteHandlerMethod,
} from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
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
export type CreateWorkoutPlanHandler = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Body: CreateWorkoutPlanRequestBody;
    Reply: CreateWorkoutPlanResponse;
  },
  ContextConfigDefault,
  FastifySchema,
  ZodTypeProvider
>;

export type FindByIdWorkoutPlanParams = WorkoutPlanParamsDto;
export type FindByIdWorkoutPlanResponse = GetWorkoutPlanDetailsResponseDto;
export type FindByIdHandler = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Params: FindByIdWorkoutPlanParams;
    Reply: FindByIdWorkoutPlanResponse;
  },
  ContextConfigDefault,
  FastifySchema,
  ZodTypeProvider
>;

export type FindDayDetailsParams = WorkoutPlanDayParamsDto;
export type FindDayDetailsResponse = GetWorkoutDayResponseDto;
export type FindDayDetailsHandler = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Params: FindDayDetailsParams;
    Reply: FindDayDetailsResponse;
  },
  ContextConfigDefault,
  FastifySchema,
  ZodTypeProvider
>;

export type FindAllWorkoutPlansResponse = WorkoutPlansListResponseDto;
export type FindAllWorkoutPlansHandler = RouteHandlerMethod<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  {
    Reply: FindAllWorkoutPlansResponse;
  },
  ContextConfigDefault,
  FastifySchema,
  ZodTypeProvider
>;

