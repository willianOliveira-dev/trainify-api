import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import {
    type WorkoutSessionsRepository,
    workoutSessionsRepository,
} from '@/modules/workout-sessions/repositories/workout-sessions.repository';
import {
    type WorkoutPlansRepository,
    workoutPlansRepository,
} from '../../workout-plans/repository/workout-plans.repository';
import { WEEKDAY_MAP } from '../constants/week-day-map.constant';
import type { GetHomeResponseDto } from '../dto/get-home.dto';

dayjs.extend(utc);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface GetHomeDataInput {
    date: string;
    userId: string;
}

class GetHomeDataUseCase {
    constructor(
        private readonly workoutPlansRepository: WorkoutPlansRepository,
        private readonly workoutSessionsRepository: WorkoutSessionsRepository,
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
                .map((s) => dayjs.utc(s.startedAt).format('YYYY-MM-DD')),
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

    async execute(input: GetHomeDataInput): Promise<GetHomeResponseDto> {
        const inputDate = dayjs.utc(input.date);

        const startOfWeek = inputDate.startOf('week');
        const endOfWeek = inputDate.endOf('week');

        const activePlan = await this.workoutPlansRepository.findActiveByUserId(
            input.userId,
        );

        if (!activePlan) {
            return {
                activeWorkoutPlanId: '',
                todayWorkoutDay: null,
                workoutStreak: 0,
                consistencyByDay: {},
            };
        }

        const sessionsInWeek =
            await this.workoutSessionsRepository.findSessionsByDateRange(
                input.userId,
                startOfWeek.toDate(),
                endOfWeek.toDate(),
            );

        const consistencyByDay: Record<
            string,
            { workoutDayCompleted: boolean; workoutDayStarted: boolean }
        > = {};

        for (let i = 0; i < 7; i++) {
            const currentDate = startOfWeek.add(i, 'day');
            const formattedDate = currentDate.format('YYYY-MM-DD');

            const sessionsForCurrentDate = sessionsInWeek.filter((session) => {
                if (!session.startedAt) {
                    return false;
                }

                const sessionDate = dayjs(session.startedAt).utc();
                const isSameDay = sessionDate.isSame(currentDate, 'day');

                return isSameDay;
            });

            const started = sessionsForCurrentDate.length > 0;
            const completed = sessionsForCurrentDate.some(
                (s) => s.completedAt !== null,
            );

            consistencyByDay[formattedDate] = {
                workoutDayStarted: started,
                workoutDayCompleted: completed,
            };
        }

        const todayWeekDay = WEEKDAY_MAP[inputDate.day()];
        const todayWorkoutDay = activePlan.workoutDays.find(
            (day) => day.weekDay === todayWeekDay,
        );

        const todayWorkoutDayPayload = todayWorkoutDay
            ? {
                  workoutPlanId: activePlan.id,
                  id: todayWorkoutDay.id,
                  name: todayWorkoutDay.name,
                  isRest: todayWorkoutDay.isRest,
                  weekDay: todayWorkoutDay.weekDay,
                  estimatedDurationInSeconds:
                      todayWorkoutDay.estimatedDurationInSeconds ?? 0,
                  coverImageUrl: todayWorkoutDay.coverImageUrl ?? null,
                  exercisesCount: todayWorkoutDay.exercises.length,
              }
            : null;

        const workoutDaysSimplified = activePlan.workoutDays.map((day) => ({
            weekDay: day.weekDay,
            isRest: day.isRest,
        }));

        const workoutStreak = await this.calculateStreak(
            activePlan.id,
            workoutDaysSimplified,
            inputDate,
        );

        return {
            activeWorkoutPlanId: activePlan.id,
            todayWorkoutDay: todayWorkoutDayPayload,
            workoutStreak,
            consistencyByDay,
        };
    }
}

const getHomeDataUseCase = new GetHomeDataUseCase(
    workoutPlansRepository,
    workoutSessionsRepository,
);

export { GetHomeDataUseCase, getHomeDataUseCase };
