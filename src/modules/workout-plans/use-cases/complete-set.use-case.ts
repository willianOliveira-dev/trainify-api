import {
    type WorkoutSessionSetsRepository,
    workoutSessionSetsRepository,
} from '@/modules/workout-session-sets/repositories/workout-session-sets.repository';
import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import { NotFoundError } from '@/shared/errors/app.error';

interface CompleteSetInput {
    sessionId: string;
    exerciseId: string;
    setNumber: number;
    totalSetsInWorkout: number;
    userId: string;
}

class CompleteSetUseCase {
    constructor(
        private readonly workoutSessionSetsRepository: WorkoutSessionSetsRepository,
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    ) {}

    async execute(input: CompleteSetInput) {
        const session = await this.workoutSessionsRepository.findById(
            input.sessionId,
        );

        if (!session || session.userId !== input.userId) {
            throw new NotFoundError('Sessão de treino');
        }

        const set = await this.workoutSessionSetsRepository.completeSet({
            sessionId: input.sessionId,
            exerciseId: input.exerciseId,
            setNumber: input.setNumber,
        });

        const completedCount =
            await this.workoutSessionSetsRepository.countBySessionId(
                input.sessionId,
            );

        return {
            set,
            autoCompleted: false,
            completedCount,
        };
    }
}

const completeSetUseCase = new CompleteSetUseCase(
    workoutSessionSetsRepository,
    workoutSessionsRepository,
);

export { CompleteSetUseCase, completeSetUseCase };
