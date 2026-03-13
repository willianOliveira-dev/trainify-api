import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import { NotFoundError } from '@/shared/errors/app.error';
import {
    SessionAlreadyExistsError,
    WorkoutPlanNotActiveError,
    WrongWeekDayError,
} from '@/shared/errors/workout-session.error';
import {
    type WorkoutPlansRepository,
    workoutPlansRepository,
} from '../repository/workout-plans.repository';

const WEEK_DAY_INDEX: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

interface StartWorkoutSessionInput {
    workoutPlanId: string;
    workoutDayId: string;
    userId: string;
}

class StartWorkoutSessionUseCase {
    constructor(
        private readonly workoutPlansRepository: WorkoutPlansRepository,
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
    ) {}

    async execute(input: StartWorkoutSessionInput) {
        const workoutPlan = await this.workoutPlansRepository.findById(
            input.workoutPlanId,
        );

        if (!workoutPlan || workoutPlan.userId !== input.userId) {
            throw new NotFoundError('Plano de treino');
        }

        if (!workoutPlan.isActive) {
            throw new WorkoutPlanNotActiveError();
        }

        const workoutDay = workoutPlan.workoutDays.find(
            (day) => day.id === input.workoutDayId,
        );

        if (!workoutDay) {
            throw new NotFoundError('Dia de treino');
        }

        if (WEEK_DAY_INDEX[workoutDay.weekDay] !== new Date().getDay()) {
            throw new WrongWeekDayError();
        }

        const existingSession =
            await this.workoutSessionsRepository.findByDayIdAndDate(
                input.workoutDayId,
                new Date(),
            );

        if (existingSession) {
            throw new SessionAlreadyExistsError();
        }

        const session = await this.workoutSessionsRepository.create({
            userId: input.userId,
            workoutDayId: input.workoutDayId,
            workoutPlanId: input.workoutPlanId,
        });

        return session;
    }
}

const startWorkoutSessionUseCase = new StartWorkoutSessionUseCase(
    workoutPlansRepository,
    workoutSessionsRepository,
);

export { StartWorkoutSessionUseCase, startWorkoutSessionUseCase };
