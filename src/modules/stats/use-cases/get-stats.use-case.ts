import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { WEEKDAY_MAP } from '@/modules/home/constants/week-day-map.constant';
import {
    type WorkoutPlansRepository,
    workoutPlansRepository,
} from '@/modules/workout-plans/repository/workout-plans.repository';
import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import type { GetStatsResponseDto } from '../dto/stats.dto';

dayjs.extend(utc);

interface GetStatsInput {
    from: string;
    to: string;
    userId: string;
}

class GetStatsUseCase {
    constructor(
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
        private readonly workoutPlansRepository: WorkoutPlansRepository,
    ) {}

    private async calculateStreak(
        workoutPlanId: string,
        workoutDays: Array<{ weekDay: string; isRest: boolean }>,
        currentDate: dayjs.Dayjs,
    ): Promise<number> {
        const planWeekDays = new Set(workoutDays.map((d) => d.weekDay));
        const restWeekDays = new Set(
            workoutDays.filter((d) => d.isRest).map((d) => d.weekDay),
        );

        const allSessions =
            await this.workoutSessionsRepository.findCompletedSessionsByWorkoutPlanId(
                workoutPlanId,
            );

        const completedDates = new Set(
            allSessions
                .filter((s) => s.completedAt !== null)
                .map((s) => dayjs(s.completedAt).format('YYYY-MM-DD')),
        );

        let streak = 0;
        let day = currentDate.startOf('day');

        for (let i = 0; i < 365; i++) {
            const weekDay = WEEKDAY_MAP[day.day()];

            if (!planWeekDays.has(weekDay)) {
                day = day.subtract(1, 'day');
                continue;
            }

            if (restWeekDays.has(weekDay)) {
                day = day.subtract(1, 'day');
                continue;
            }

            const dateKey = day.format('YYYY-MM-DD');
            if (completedDates.has(dateKey)) {
                streak++;
                day = day.subtract(1, 'day');
                continue;
            }

            break;
        }

        return streak;
    }

    async execute({
        from,
        to,
        userId,
    }: GetStatsInput): Promise<GetStatsResponseDto> {
        const fromDate = dayjs.utc(from).startOf('day').toDate();
        const toDate = dayjs.utc(to).endOf('day').toDate();

        const sessions =
            await this.workoutSessionsRepository.findSessionsByDateRange(
                userId,
                fromDate,
                toDate,
            );

        const consistencyByDay: Record<
            string,
            { workoutDayCompleted: boolean; workoutDayStarted: boolean }
        > = {};

        for (const session of sessions) {
            const dateToCheck = session.completedAt ?? session.startedAt;
            const key = dayjs.utc(dateToCheck).format('YYYY-MM-DD');
            const existing = consistencyByDay[key];
            const isCompleted = session.completedAt !== null;

            if (existing) {
                if (isCompleted) {
                    existing.workoutDayCompleted = true;
                }
            } else {
                consistencyByDay[key] = {
                    workoutDayStarted: true,
                    workoutDayCompleted: isCompleted,
                };
            }
        }

        const completedWorkoutsCount = sessions.filter(
            (s) => s.completedAt !== null,
        ).length;
        const totalSessions = sessions.length;
        const conclusionRate =
            totalSessions > 0 ? completedWorkoutsCount / totalSessions : 0;

        const totalTimeInSeconds = sessions.reduce((acc, session) => {
            if (!session.completedAt) {
                return acc;
            }

            const duration = dayjs.utc(session.completedAt).diff(
                dayjs.utc(session.startedAt),
                'second',
            );

            const estimated =
                session.workoutDay?.estimatedDurationInSeconds ?? null;
            const effectiveDuration =
                estimated !== null && duration > estimated
                    ? estimated
                    : duration;

            return acc + effectiveDuration;
        }, 0);

        const activePlan =
            await this.workoutPlansRepository.findActiveByUserId(userId);

        let workoutStreak = 0;

        if (activePlan) {
            const workoutDaysSimplified = activePlan.workoutDays.map((day) => ({
                weekDay: day.weekDay,
                isRest: day.isRest,
            }));

            const toDayjs = dayjs.utc();
            workoutStreak = await this.calculateStreak(
                activePlan.id,
                workoutDaysSimplified,
                toDayjs,
            );
        }

        return {
            workoutStreak,
            consistencyByDay,
            completedWorkoutsCount,
            conclusionRate,
            totalTimeInSeconds,
        };
    }
}

const getStatsUseCase = new GetStatsUseCase(
    workoutSessionsRepository,
    workoutPlansRepository,
);

export { GetStatsUseCase, getStatsUseCase };

