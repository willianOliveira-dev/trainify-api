import sensible, { type FastifySensibleOptions } from '@fastify/sensible';
import fp from 'fastify-plugin';
import { env } from '@/config/env';

export default fp<FastifySensibleOptions>(
    async (app) => {
        app.register(sensible, {
            errorHandler: env.nodeEnv !== 'production',
        } as FastifySensibleOptions);
    },
    {
        name: 'sensible',
        fastify: '5.x',
    },
);
