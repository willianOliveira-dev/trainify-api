import swagger from '@fastify/swagger';
import scalarApiReference from '@scalar/fastify-api-reference';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from '@/config/env';

export default fp(
  async (app) => {
    await app.register(swagger, {
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
            url: `${env.baseUrl}`,
            description: 'Localhost',
          },
          {
            url: `${env.baseUrlProd}`,
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

    await app.register(scalarApiReference, {
      routePrefix: '/docs',
      configuration: {
        sources: [
          {
            title: 'Trainify API',
            slug: 'trainify-api',
            url: '/swagger.json',
          },
          {
            title: 'Auth API',
            slug: 'auth-api',
            url: '/api/auth/open-api/generate-schema',
          },
        ],
        content: () => app.swagger(),
        showSidebar: true,
        hideDownloadButton: false,
        theme: 'saturn',
      },
    });
  },
  {
    name: 'swagger',
    fastify: '5.x',
  },
);

