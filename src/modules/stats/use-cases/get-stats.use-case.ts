import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import type { GetStatsResponseDto } from '../dto/stats.dto';
import {
  statsRepository as defaultStatsRepository,
  type StatsRepository,
} from '../repository/stats.repository';

dayjs.extend(utc);

interface GetStatsInput {
  from: string;
  to: string;
  userId: string;
}

class GetStatsUseCase {
  constructor(private readonly statsRepository: StatsRepository) {}

  async execute({ from, to, userId }: GetStatsInput): Promise<GetStatsResponseDto> {
    const fromDate = dayjs.utc(from).startOf('day').toDate();
    const toDate = dayjs.utc(to).endOf('day').toDate();

    const sessions = await this.statsRepository.findSessionsByDateRange(userId, fromDate, toDate);

    // ── 1. Consistency map (only days with activity) ──────────────────────────
    const consistencyByDay: Record<
      string,
      { workoutDayCompleted: boolean; workoutDayStarted: boolean }
    > = {};

    for (const session of sessions) {
      const key = dayjs.utc(session.startedAt).format('YYYY-MM-DD');
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

    // ── 2. Completed & total counts ───────────────────────────────────────────
    const completedWorkoutsCount = sessions.filter((s) => s.completedAt !== null).length;
    const totalSessions = sessions.length;
    const conclusionRate = totalSessions > 0 ? completedWorkoutsCount / totalSessions : 0;

    // ── 3. Total time in seconds (only for completed sessions) ────────────────
    const totalTimeInSeconds = sessions.reduce((acc, session) => {
      if (!session.completedAt) {
        return acc;
      }
      return acc + dayjs(session.completedAt).diff(dayjs(session.startedAt), 'second');
    }, 0);

    // ── 4. Streak: consecutive days backwards from `to` with at least 1 completed session ──
    const completesDays = new Set(
      sessions
        .filter((s) => s.completedAt !== null)
        .map((s) => dayjs.utc(s.startedAt).format('YYYY-MM-DD')),
    );

    let workoutStreak = 0;
    let cursor = dayjs.utc(to);
    const fromDayJs = dayjs.utc(from);

    while (cursor.isSame(fromDayJs, 'day') || cursor.isAfter(fromDayJs, 'day')) {
      const key = cursor.format('YYYY-MM-DD');
      if (completesDays.has(key)) {
        workoutStreak++;
        cursor = cursor.subtract(1, 'day');
      } else {
        break;
      }
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

const getStatsUseCase = new GetStatsUseCase(defaultStatsRepository);

export { GetStatsUseCase, getStatsUseCase };
