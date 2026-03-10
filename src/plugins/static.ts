import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';
import path from 'node:path';

export default fp(
    async (app) => {
        app.register(fastifyStatic, {
            root: path.join(process.cwd(), 'public'),
            prefix: '/static/',
        });
    },
    {
        name: 'static',
        fastify: '5.x',
    },
);