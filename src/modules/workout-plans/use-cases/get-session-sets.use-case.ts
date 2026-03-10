import {
    type WorkoutSessionSetsRepository,
    workoutSessionSetsRepository,
} from '@/modules/workout-session-sets/repositories/workout-session-sets.repository';
import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import { NotFoundError } from '@/shared/errors/app.error';

interface GetSessionSetsInput {
    sessionId: string;
    userId: string;
}

class GetSessionSetsUseCase {
    constructor(
        private readonly workoutSessionSetsRepository: WorkoutSessionSetsRepository,
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    ) {}

    async execute(input: GetSessionSetsInput) {
        const session = await this.workoutSessionsRepository.findById(
            input.sessionId,
        );

        if (!session || session.userId !== input.userId) {
            throw new NotFoundError('Sessão de treino');
        }

        const sets = await this.workoutSessionSetsRepository.findBySessionId(
            input.sessionId,
        );

        return sets.map((set) => ({
            id: set.id,
            sessionId: set.sessionId,
            exerciseId: set.exerciseId,
            setNumber: set.setNumber,
            completedAt: set.completedAt
        }));
    }
}

const getSessionSetsUseCase = new GetSessionSetsUseCase(
    workoutSessionSetsRepository,
    workoutSessionsRepository,
);

export { GetSessionSetsUseCase, getSessionSetsUseCase };
