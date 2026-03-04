/** biome-ignore-all lint/style/useNamingConvention: Fastify RouteHandler generics use PascalCase */
import type { RouteHandler } from 'fastify';
import type { ChatBodyDto } from '@/modules/ia/dto/ia.dto';

export type ChatHandler = RouteHandler<{
    Body: ChatBodyDto;
    Reply: unknown;
}>;
