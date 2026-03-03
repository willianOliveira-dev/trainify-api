import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '@/config/env';
import { registerAppRouter } from '@/modules/index.route';
import { registerPlugins } from '@/plugins';

export async function boostrap() {
  const app = Fastify({
    logger: {
      level: env.logLevel ?? 'info',
      transport:
        env.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                localizeTime: true,
                translateTime: 'HH:mm:ss Z dd-mm-yyyy',
                colorize: true,
              },
            }
          : undefined,
    },
    genReqId: () => crypto.randomUUID(),
    requestIdHeader: 'x-request-id',
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await registerPlugins(app);
  await registerAppRouter(app);

  return app;
}
