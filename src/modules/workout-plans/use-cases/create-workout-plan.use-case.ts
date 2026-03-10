import { searchYoutubeVideo } from '../helpers/youtube.helper'; 
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

    async execute(dto: CreateWorkoutPlanDto): Promise<CreateWorkoutPlanUseCaseOutput> {
        const existsPlanActive = await this.workoutPlansRepository.existsWorkoutPlanActive(dto.userId);

        const workoutDays = await Promise.all(
            dto.workoutDays.map(async (day) => {
                if (day.isRest) {
                    return {
                        ...day,
                        coverImageUrl: null,
                        exercises: day.exercises.map((e) => ({ ...e, youtubeVideoId: null })),
                    };
                }

                const exercisesWithVideos = await Promise.all(
                    day.exercises.map(async (exercise) => {
                        const video = await searchYoutubeVideo(exercise.name);
                        return {
                            ...exercise,
                            youtubeVideoId: video?.videoId ?? null,
                            thumbnailUrl: video?.thumbnailUrl ?? null,
                        };
                    }),
                );

                const firstThumbnail = exercisesWithVideos[0]?.thumbnailUrl ?? null;

                return {
                    ...day,
                    coverImageUrl: firstThumbnail,
                    exercises: exercisesWithVideos.map(({ thumbnailUrl: _, ...e }) => e),
                };
            }),
        );

        const dtoWithVideos = { ...dto, workoutDays };

        let rawWorkoutPlan: WorkoutPlanRepositoryDbOutput;

        if (existsPlanActive) {
            rawWorkoutPlan = await this.workoutPlansRepository.deactivatePreviousAndCreateNew(
                existsPlanActive.id,
                dtoWithVideos,
            );
        } else {
            rawWorkoutPlan = await this.workoutPlansRepository.create(dtoWithVideos);
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

const createWorkoutPlanUseCase = new CreateWorkoutPlanUseCase(workoutPlansRepository);
export { CreateWorkoutPlanUseCase, createWorkoutPlanUseCase };