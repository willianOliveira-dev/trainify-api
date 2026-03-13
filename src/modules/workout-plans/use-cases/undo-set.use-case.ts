import {
    type WorkoutSessionSetsRepository,
    workoutSessionSetsRepository,
} from '@/modules/workout-session-sets/repositories/workout-session-sets.repository';
import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import { NotFoundError } from '@/shared/errors/app.error';

interface UndoSetInput {
    sessionId: string;
    exerciseId: string;
    setNumber: number;
    userId: string;
}

class UndoSetUseCase {
    constructor(
        private readonly workoutSessionSetsRepository: WorkoutSessionSetsRepository,
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    ) {}

    async execute(input: UndoSetInput) {
        const session = await this.workoutSessionsRepository.findById(
            input.sessionId,
        );

        if (!session || session.userId !== input.userId) {
            throw new NotFoundError('Sessão de treino');
        }

        await this.workoutSessionSetsRepository.deleteSet({
            sessionId: input.sessionId,
            exerciseId: input.exerciseId,
            setNumber: input.setNumber,
        });
    }
}

const undoSetUseCase = new UndoSetUseCase(
    workoutSessionSetsRepository,
    workoutSessionsRepository,
);

export { UndoSetUseCase, undoSetUseCase };

