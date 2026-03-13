import type { RouteHandler } from 'fastify';
import type { GetHomeParamsDto, GetHomeResponseDto } from '../dto/get-home.dto.js';

export type GetHomeDataHandler = RouteHandler<{
    Params: GetHomeParamsDto;
    Reply: GetHomeResponseDto;
}>;

