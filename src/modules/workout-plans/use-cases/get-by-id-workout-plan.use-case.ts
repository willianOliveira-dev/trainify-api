import { NotFoundError } from '@/shared/errors/app.error';
import { WorkoutPlansRepository, workoutPlansRepository } from '../repository/workout-plans.repository';
import type {
  GetWorkoutPlanUseCaseInput,
  GetWorkoutPlanUseCaseOutput,
} from './workout-plans.use-case.types';

class GetByIdWorkoutPlanUseCase {
  constructor(
    private readonly workoutPlansRepository: WorkoutPlansRepository,
  ) {}

  async execute({ id }: GetWorkoutPlanUseCaseInput): Promise<GetWorkoutPlanUseCaseOutput> {
    const workoutPlan = await this.workoutPlansRepository.findById(id);

    if (!workoutPlan) {
      throw new NotFoundError('Plano de treino');
    }
    const workoutPlanSerializer: GetWorkoutPlanUseCaseOutput = {
      id: workoutPlan.id,
      name: workoutPlan.name,
      isActive: workoutPlan.isActive,
      createdAt: workoutPlan.createdAt,
      updatedAt: workoutPlan.updatedAt,
      workoutDays: workoutPlan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? 1,
        exercises: day.exercises.map((exercise) => ({
          id: exercise.id,
          name: exercise.name,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeInSeconds: exercise.restTimeInSeconds,
        })),
      })),
    };

    return workoutPlanSerializer;
  }
}

const getByIdWorkoutPlanUseCase = new GetByIdWorkoutPlanUseCase(workoutPlansRepository);

export { GetByIdWorkoutPlanUseCase, getByIdWorkoutPlanUseCase };
