import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from '../config/env';

export default fp(
    async (app) => {
        app.register(swagger, {
            openapi: {
                openapi: '3.1.0',
                info: {
                    title: 'Trainify API',
                    description:
                        'API para solução escalável para controle de planos de treino e acompanhamento físico.',
                    license: {
                        name: 'MIT',
                        url: 'https://opensource.org/licenses/MIT',
                    },
                    version: env.apiVersion ?? '1.0.0',
                    contact: {
                        name: 'Willian Oliveira',
                        email: 'willian.dev.tech@gmail.com',
                    },
                },
                servers: [
                    {
                        url: `http://localhost:${env.port}`,
                        description: 'Localhost',
                    },
                    {
                        url: 'https://api.example.com',
                        description: 'Production',
                    },
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT',
                        },
                    },
                },
                tags: [{ name: 'Users', description: 'User management' }],
            },

            transform: jsonSchemaTransform,
        });

        app.register(swaggerUi, {
            routePrefix: '/docs',
            uiConfig: {
                docExpansion: 'list',
                deepLinking: true,
                persistAuthorization: true,
            },
            uiHooks: {
                onRequest: (request, reply, next) => {
                    if (
                        env.nodeEnv === 'production' &&
                        !request.headers['x-internal']
                    ) {
                        return reply.status(403).send({ message: 'Forbidden' });
                    }
                    next();
                },
            },
        });
    },
    {
        name: 'swagger',
        fastify: '5.x',
    },
);
