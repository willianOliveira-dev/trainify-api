import type { RouteHandler } from 'fastify';
import type { GetStatsQueryDto, GetStatsResponseDto } from '../dto/stats.dto';

export type GetStatsHandlerQuery = GetStatsQueryDto;
export type GetStatsHandlerResponse = GetStatsResponseDto;
export type GetStatsHandler = RouteHandler<{
  Querystring: GetStatsHandlerQuery;
  Reply: GetStatsHandlerResponse;
}>;
