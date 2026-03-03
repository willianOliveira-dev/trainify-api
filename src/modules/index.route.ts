import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/routes/auth.routes';
import { authOpenApiRoutes } from './auth/routes/auth-open-api.routes';
import { swaggerRoutes } from './swagger/routes/swagger.routes';
import { workoutPlans } from './workout-plans/routes/workout-plans.routes';

export async function registerAppRouter(app: FastifyInstance): Promise<void> {
    await app.register(swaggerRoutes);
    await app.register(authOpenApiRoutes);
    await app.register(authRoutes);
    await app.register(workoutPlans, { prefix: '/api/v1' });
}
