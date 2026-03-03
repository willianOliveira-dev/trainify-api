import type { FastifyInstance } from 'fastify';
import authPlugin from './auth';
import corsPlugin from './cors';
import errorHandlerPlugin from './error-handler';
import helmetPlugin from './helmet';
import multipartPlugin from './multipart';
import rateLimitPlugin from './rate-limit';
import swaggerPlugin from './swagger';

export async function registerPlugins(app: FastifyInstance) {
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);

  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);
  await app.register(multipartPlugin);

  await app.register(swaggerPlugin);
}
