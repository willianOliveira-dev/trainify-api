import { NotFoundError } from '@/shared/errors/app.error';
import {
  type UserWorkoutSessionsRepository,
  userWorkoutSessionsRepository,
} from '../repository/user-workout-sessions.repository';
import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../repository/workout-plans.repository';

interface UpdateWorkoutSessionInput {
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  userId: string;
  completedAt: string;
}

class UpdateWorkoutSessionUseCase {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
    private readonly userWorkoutSessionsRepository: UserWorkoutSessionsRepository,
  ) {}

  async execute(input: UpdateWorkoutSessionInput) {
    const workoutPlan = await this.workoutPlansRepository.findById(input.workoutPlanId);

    if (!workoutPlan || workoutPlan.userId !== input.userId) {
      throw new NotFoundError('Plano de treino');
    }

    const session = await this.userWorkoutSessionsRepository.findById(input.sessionId);

    if (!session || session.workoutDayId !== input.workoutDayId) {
      throw new NotFoundError('Sessão de treino');
    }

    const workoutDay = workoutPlan.workoutDays.find((day) => day.id === input.workoutDayId);

    if (!workoutDay) {
      throw new NotFoundError('Sessão de treino');
    }

    const updatedSession = await this.userWorkoutSessionsRepository.update(input.sessionId, {
      completedAt: new Date(input.completedAt),
    });

    return updatedSession;
  }
}

const updateWorkoutSessionUseCase = new UpdateWorkoutSessionUseCase(
  workoutPlansRepository,
  userWorkoutSessionsRepository,
);

export { UpdateWorkoutSessionUseCase, updateWorkoutSessionUseCase };
