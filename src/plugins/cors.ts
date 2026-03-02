import cors, { type FastifyCorsOptions } from '@fastify/cors';
import fp from 'fastify-plugin';
import { env } from '../config/env';

export default fp<FastifyCorsOptions>(
  async (app) => {
    app.register(cors, {
      origin: env.nodeEnv !== 'production' ? true : env.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-ID'],
      credentials: true,
      maxAge: 600,
    });
  },
  {
    name: 'cors',
    fastify: '5.x',
  },
);
