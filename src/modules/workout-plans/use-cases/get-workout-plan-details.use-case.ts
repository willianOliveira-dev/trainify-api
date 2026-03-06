import { ForbiddenError } from '@/shared/errors/app.error';
import { WorkoutPlanNotFoundError } from '@/shared/errors/workout-plan.error';
import type { GetWorkoutPlanDetailsResponseDto } from '../dto/workout-plans.dto';
import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../repository/workout-plans.repository';

export interface GetWorkoutPlanDetailsUseCaseInput {
  id: string;
  userId: string;
}

export type GetWorkoutPlanDetailsUseCaseOutput = GetWorkoutPlanDetailsResponseDto;

class GetWorkoutPlanDetailsUseCase {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute({
    id,
    userId,
  }: GetWorkoutPlanDetailsUseCaseInput): Promise<GetWorkoutPlanDetailsUseCaseOutput> {
    const workoutPlan = await this.workoutPlansRepository.findDetailsById(id);
    
    if (!workoutPlan) {
      throw new WorkoutPlanNotFoundError();
    }

    if (workoutPlan.userId !== userId) {
      throw new ForbiddenError('Você não tem permissão para visualizar este plano de treino.');
    }

    return {
      id: workoutPlan.id,
      name: workoutPlan.name,
      workoutDays: workoutPlan.workoutDays,
    };
  }
}

const getWorkoutPlanDetailsUseCase = new GetWorkoutPlanDetailsUseCase(workoutPlansRepository);

export { GetWorkoutPlanDetailsUseCase, getWorkoutPlanDetailsUseCase };
