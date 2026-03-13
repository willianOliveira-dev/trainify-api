/** biome-ignore-all lint/style/useNamingConvention: Fastify RouteHandler generics use PascalCase */
import type { RouteHandler } from 'fastify';
import type { GetUserTrainDataResponseDto, UpsertUserTrainDataDto } from '../dto/users.dto.js';

export type GetMeResponse = GetUserTrainDataResponseDto;
export type GetMeHandler = RouteHandler<{
  Reply: GetMeResponse;
}>;

export type UpsertTrainDataBody = UpsertUserTrainDataDto;
export type UpsertTrainDataResponse = GetUserTrainDataResponseDto;
export type UpsertTrainDataHandler = RouteHandler<{
  Body: UpsertTrainDataBody;
  Reply: UpsertTrainDataResponse;
}>;

