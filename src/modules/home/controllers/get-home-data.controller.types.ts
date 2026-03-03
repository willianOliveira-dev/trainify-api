/** biome-ignore-all lint/style/useNamingConvention: <explanation> */

import type { RouteHandler } from 'fastify';
import type { GetHomeParamsDto, GetHomeResponseDto } from '../dto/get-home.dto';

export type GetHomeDataHandler = RouteHandler<{
  Params: GetHomeParamsDto;
  Reply: GetHomeResponseDto;
}>;
