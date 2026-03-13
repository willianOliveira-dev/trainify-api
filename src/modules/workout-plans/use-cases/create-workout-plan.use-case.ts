import type { CreateWorkoutPlanDto } from '../dto/workout-plans.dto.js';
import { resolveCoverImage } from '../helpers/workout-cover.helper';
import { searchYoutubeVideo } from '../helpers/youtube.helper';
import {
    type WorkoutPlansRepository,
    workoutPlansRepository,
} from '../repository/workout-plans.repository';
import type { WorkoutPlanRepositoryDbOutput } from '../repository/workout-plans.repository.types.js';
import type { CreateWorkoutPlanUseCaseOutput } from './workout-plans.use-case.types.js';

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

        const workoutDays = await Promise.all(
            dto.workoutDays.map(async (day) => {
                console.log('coverCategory recebido:', day.coverCategory);
                if (day.isRest) {
                    return {
                        ...day,
                        coverImageUrl: resolveCoverImage('rest'),
                        exercises: [],
                    };
                }

                const exercisesWithVideos = await Promise.all(
                    day.exercises.map(async (exercise) => {
                        const video = await searchYoutubeVideo(exercise.name);
                        return {
                            ...exercise,
                            youtubeVideoId: video?.videoId ?? null,
                        };
                    }),
                );

                return {
                    ...day,
                    coverImageUrl: resolveCoverImage(
                        day.coverCategory ?? 'fullbody',
                    ),
                    exercises: exercisesWithVideos,
                };
            }),
        );

        const workoutPlan = { ...dto, workoutDays };

        let rawWorkoutPlan: WorkoutPlanRepositoryDbOutput;

        if (existsPlanActive) {
            rawWorkoutPlan =
                await this.workoutPlansRepository.deactivatePreviousAndCreateNew(
                    existsPlanActive.id,
                    workoutPlan,
                );
        } else {
            rawWorkoutPlan =
                await this.workoutPlansRepository.create(workoutPlan);
        }

        return {
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
                coverImageUrl: day.coverImageUrl ?? null,
                estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? 0,
                exercises: day.exercises.map((exercise) => ({
                    id: exercise.id,
                    name: exercise.name,
                    order: exercise.order,
                    sets: exercise.sets,
                    reps: exercise.reps,
                    restTimeInSeconds: exercise.restTimeInSeconds,
                    youtubeVideoId: exercise.youtubeVideoId ?? null,
                })),
            })),
        };
    }
}

const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(
    workoutPlansRepository,
);
export { CreateWorkoutPlanUseCase, createWorkoutPlanUseCase };

