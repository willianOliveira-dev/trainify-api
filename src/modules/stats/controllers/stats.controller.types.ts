/** biome-ignore-all lint/style/useNamingConvention: Fastify RouteHandler generics use PascalCase */
import type { RouteHandler } from 'fastify';
import type { GetStatsQueryDto, GetStatsResponseDto } from '../dto/stats.dto.js';

export type GetStatsHandlerQuery = GetStatsQueryDto;
export type GetStatsHandlerResponse = GetStatsResponseDto;
export type GetStatsHandler = RouteHandler<{
  Querystring: GetStatsHandlerQuery;
  Reply: GetStatsHandlerResponse;
}>;

