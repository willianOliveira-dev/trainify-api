import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/routes/auth.routes';
import { authOpenApiRoutes } from './auth/routes/auth-open-api.routes';
import { home } from './home/routes/home.routes';
import { iaRoutes } from './ia/routes/ia.routes';
import { statsRoutes } from './stats/routes/stats.routes';
import { swaggerRoutes } from './swagger/routes/swagger.routes';
import { usersRoutes } from './users/routes/users.routes';
import { workoutPlans } from './workout-plans/routes/workout-plans.routes';

export async function registerAppRouter(app: FastifyInstance): Promise<void> {
  await app.register(swaggerRoutes);
  await app.register(authOpenApiRoutes);
  await app.register(authRoutes);
  await app.register(workoutPlans, { prefix: '/api/v1' });
  await app.register(home, { prefix: '/api/v1' });
  await app.register(statsRoutes, { prefix: '/api/v1' });
  await app.register(usersRoutes, { prefix: '/api/v1' });
  await app.register(iaRoutes, { prefix: '/api/v1/ia' });
}
