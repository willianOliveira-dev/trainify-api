import { AppError } from '@/shared/errors/app.error';

export class WorkoutPlanNotActiveError extends AppError {
  constructor() {
    super('Este plano de treino não está ativo.', 400, 'WORKOUT_PLAN_NOT_ACTIVE');
  }
}

export class SessionAlreadyExistsError extends AppError {
  constructor() {
    super(
      'Já existe uma sessão iniciada para este dia de treino hoje.',
      409,
      'SESSION_ALREADY_EXISTS',
    );
  }
}
