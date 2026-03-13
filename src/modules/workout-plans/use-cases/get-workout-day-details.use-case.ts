import { ForbiddenError, NotFoundError } from '@/shared/errors/app.error';
import type { GetWorkoutDayResponseDto } from '../dto/workout-plans.dto.js';
import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../repository/workout-plans.repository';

export interface GetWorkoutDayDetailsUseCaseInput {
  planId: string;
  dayId: string;
  userId: string;
}

export type GetWorkoutDayDetailsUseCaseOutput = GetWorkoutDayResponseDto;

class GetWorkoutDayDetailsUseCase {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute({
    planId,
    dayId,
    userId,
  }: GetWorkoutDayDetailsUseCaseInput): Promise<GetWorkoutDayDetailsUseCaseOutput> {
    const workoutDayData = await this.workoutPlansRepository.findDayDetailsById(planId, dayId);

    if (!workoutDayData) {
      throw new NotFoundError('Plano de treino ou Dia de Treino');
    }

    if (workoutDayData.workoutPlanUserId !== userId) {
      throw new ForbiddenError(
        'Você não tem permissão para visualizar os detalhes deste dia de treino.',
      );
    }

    return {
      id: workoutDayData.id,
      name: workoutDayData.name,
      isRest: workoutDayData.isRest,
      coverImageUrl: workoutDayData.coverImageUrl,
      estimatedDurationInSeconds: workoutDayData.estimatedDurationInSeconds,
      weekDay: workoutDayData.weekDay,
      exercises: workoutDayData.exercises,
      sessions: workoutDayData.sessions,
    };
  }
}

const getWorkoutDayDetailsUseCase = new GetWorkoutDayDetailsUseCase(workoutPlansRepository);

export { GetWorkoutDayDetailsUseCase, getWorkoutDayDetailsUseCase };

