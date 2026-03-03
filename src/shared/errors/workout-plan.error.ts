import { AppError } from '@/shared/errors/app.error';

export class WorkoutPlanNotFoundError extends AppError {
  constructor() {
    super('Plano de treino não encontrado.', 404, 'WORKOUT_PLAN_NOT_FOUND');
  }
}
