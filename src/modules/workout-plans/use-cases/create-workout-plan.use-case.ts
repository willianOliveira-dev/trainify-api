import type { CreateWorkoutPlanDto } from '../dto/workout-plans.dto';
import {
    type WorkoutPlansRepository,
    workoutPlansRepository,
} from '../repository/workout-plans.repository';
import type { WorkoutPlanRepositoryDbOutput } from '../repository/workout-plans.repository.types';
import type { CreateWorkoutPlanUseCaseOutput } from './workout-plans.use-case.types';

class CreateWorkoutPlanUseCase {
    constructor(
        private readonly workoutPlansRepository: WorkoutPlansRepository,
    ) {}

    async execute(
        dto: CreateWorkoutPlanDto,
    ): Promise<CreateWorkoutPlanUseCaseOutput> {
        const existsPlanActive =
            await this.workoutPlansRepository.existsWorkoutPlanActive(
                dto.userId,
            );

        let rawWorkoutPlan: WorkoutPlanRepositoryDbOutput;

        if (existsPlanActive) {
            const previousWorkoutPlanId = existsPlanActive.id;
            rawWorkoutPlan =
                await this.workoutPlansRepository.deactivatePreviousAndCreateNew(
                    previousWorkoutPlanId,
                    dto,
                );
        } else {
            rawWorkoutPlan = await this.workoutPlansRepository.create(dto);
        }

        const workoutPlanSerializer: CreateWorkoutPlanUseCaseOutput = {
            id: rawWorkoutPlan.id,
            name: rawWorkoutPlan.name,
            isActive: rawWorkoutPlan.isActive,
            createdAt: rawWorkoutPlan.createdAt,
            updatedAt: rawWorkoutPlan.updatedAt,
            workoutDays: rawWorkoutPlan.workoutDays.map((day) => ({
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

const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
    workoutPlansRepository,
);

export { CreateWorkoutPlanUseCase, createWorkoutPlanUseCase };
