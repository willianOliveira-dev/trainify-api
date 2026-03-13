import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../repository/workout-plans.repository';
import type { GetAllWorkoutPlanUseCaseOutput } from './workout-plans.use-case.types.js';

class ListWorkoutPlansUseCase {
  constructor(private readonly workoutPlansRepository: WorkoutPlansRepository) {}

  async execute({ userId }: { userId: string }): Promise<GetAllWorkoutPlanUseCaseOutput> {
    const workoutPlans = await this.workoutPlansRepository.findByUserId(userId);
    return workoutPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      workoutDays: plan.workoutDays.map((day) => ({
        id: day.id,
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? 1,
        exercises: day.exercises.map((exercises) => ({
          id: exercises.id,
          name: exercises.name,
          order: exercises.order,
          sets: exercises.sets,
          reps: exercises.reps,
          restTimeInSeconds: exercises.restTimeInSeconds ?? 1,
        })),
      })),
    }));
  }
}

const listWorkoutPlansUseCase = new ListWorkoutPlansUseCase(workoutPlansRepository);

export { ListWorkoutPlansUseCase, listWorkoutPlansUseCase };

