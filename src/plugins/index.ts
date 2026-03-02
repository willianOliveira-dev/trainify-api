import type { FastifyInstance } from 'fastify';
import corsPlugin from './cors';
import helmetPlugin from './helmet';
import multipartPlugin from './multipart';
import rateLimitPlugin from './rate-limit';
import sensiblePlugin from './sensible';
import swaggerPlugin from './swagger';

export async function registerPlugins(app: FastifyInstance) {
  await app.register(helmetPlugin);
  await app.register(corsPlugin);
  await app.register(rateLimitPlugin);

  await app.register(sensiblePlugin);
  await app.register(multipartPlugin);

  await app.register(swaggerPlugin);
}
