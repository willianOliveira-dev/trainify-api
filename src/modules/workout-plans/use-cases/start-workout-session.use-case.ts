import { NotFoundError } from '@/shared/errors/app.error';
import {
  SessionAlreadyExistsError,
  WorkoutPlanNotActiveError,
} from '@/shared/errors/workout-session.error';
import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../repository/workout-plans.repository';
import { workoutSessionsRepository, WorkoutSessionsRepository } from '@/modules/workout-sessions/repositories/workout-sessions.repository';

interface StartWorkoutSessionInput {
  workoutPlanId: string;
  workoutDayId: string;
  userId: string;
}

class StartWorkoutSessionUseCase {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly workoutSessionsRepository: WorkoutSessionsRepository,
  ) {}

  async execute(input: StartWorkoutSessionInput) {
    const workoutPlan = await this.workoutPlansRepository.findById(input.workoutPlanId);

    if (!workoutPlan || workoutPlan.userId !== input.userId) {
      throw new NotFoundError('Plano de treino');
    }

    if (!workoutPlan.isActive) {
      throw new WorkoutPlanNotActiveError();
    }

    const workoutDay = workoutPlan.workoutDays.find((day) => day.id === input.workoutDayId);

    if (!workoutDay) {
      throw new NotFoundError('Dia de treino');
    }

    const existingSession = await this.workoutSessionsRepository.findByDayIdAndDate(
      input.workoutDayId,
      new Date(),
    );

    if (existingSession) {
      throw new SessionAlreadyExistsError();
    }

    const session = await this.workoutSessionsRepository.create({
      userId: input.userId,
      workoutDayId: input.workoutDayId,
      workoutPlanId: input.workoutPlanId,
    });

    return session;
  }
}

const startWorkoutSessionUseCase = new StartWorkoutSessionUseCase(
  workoutPlansRepository,
  workoutSessionsRepository,
);

export { StartWorkoutSessionUseCase, startWorkoutSessionUseCase };
