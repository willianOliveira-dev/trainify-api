import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import {
  type UserWorkoutSessionsRepository,
  userWorkoutSessionsRepository,
} from '../../workout-plans/repository/user-workout-sessions.repository';
import {
  type WorkoutPlansRepository,
  workoutPlansRepository,
} from '../../workout-plans/repository/workout-plans.repository';
import type { GetHomeResponseDto } from '../dto/get-home.dto';
import { WorkoutPlanNotFoundError } from '@/shared/errors/workout-plan.error';

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
    private readonly userWorkoutSessionsRepository: UserWorkoutSessionsRepository,
  ) {}

  async execute(input: GetHomeDataInput): Promise<GetHomeResponseDto> {
    const inputDate = dayjs.utc(input.date);
    
    const startOfWeek = inputDate.startOf('week');
    const endOfWeek = inputDate.endOf('week');

    const activePlan = await this.workoutPlansRepository.findActiveByUserId(input.userId);

    if (!activePlan) {
      throw new WorkoutPlanNotFoundError();
    }

    const sessionsInWeek = await this.userWorkoutSessionsRepository.findSessionsByDateRange(
      input.userId,
      startOfWeek.toDate(),
      endOfWeek.toDate(),
    );

    const consistencyByDay: Record<string, { workoutDayCompleted: boolean; workoutDayStarted: boolean }> = {};

    for (let i = 0; i < 7; i++) {
        const currentDate = startOfWeek.add(i, 'day');
        const formattedDate = currentDate.format('YYYY-MM-DD');
        
        const sessionsForCurrentDate = sessionsInWeek.filter(session => {
            const sessionDate = dayjs(session.startedAt).utc();
            return sessionDate.isSameOrAfter(currentDate.startOf('day')) && sessionDate.isSameOrBefore(currentDate.endOf('day'));
        });

        const started = sessionsForCurrentDate.length > 0;
        const completed = sessionsForCurrentDate.some(s => s.completedAt !== null);

        consistencyByDay[formattedDate] = {
            workoutDayStarted: started,
            workoutDayCompleted: completed
        };
    }

    const currentWeekDay = inputDate.format('dddd').toLowerCase() as "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
    const todaysWorkoutDay = activePlan.workoutDays.find(day => day.weekDay === currentWeekDay);

    if (!todaysWorkoutDay) {
      throw new Error("Configuração de dias do plano de treino inválida.");
    }

    const todayWorkoutDayPayload = {
        workoutPlanId: activePlan.id,
        id: todaysWorkoutDay.id,
        name: todaysWorkoutDay.name,
        isRest: todaysWorkoutDay.isRest,
        weekDay: todaysWorkoutDay.weekDay,
        estimatedDurationInSeconds: todaysWorkoutDay.estimatedDurationInSeconds ?? 0,
        coverImageUrl: todaysWorkoutDay.coverImageUrl ?? undefined,
        exercisesCount: todaysWorkoutDay.exercises.length,
    };

    let workoutStreak = 0;

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
  userWorkoutSessionsRepository,
);

export { GetHomeDataUseCase, getHomeDataUseCase };
