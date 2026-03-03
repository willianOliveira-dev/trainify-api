import { and, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db/connection';
import { userWorkoutSessions } from '@/db/schemas';

export interface StatsSessionRecord {
  id: string;
  workoutDayId: string;
  startedAt: Date;
  completedAt: Date | null;
}

class StatsRepository {
  async findSessionsByDateRange(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<StatsSessionRecord[]> {
    const sessions = await db
      .select({
        id: userWorkoutSessions.id,
        workoutDayId: userWorkoutSessions.workoutDayId,
        startedAt: userWorkoutSessions.startedAt,
        completedAt: userWorkoutSessions.completedAt,
      })
      .from(userWorkoutSessions)
      .where(
        and(
          eq(userWorkoutSessions.userId, userId),
          gte(userWorkoutSessions.startedAt, from),
          lte(userWorkoutSessions.startedAt, to),
        ),
      );

    return sessions;
  }
}

const statsRepository = new StatsRepository();

export { StatsRepository, statsRepository };
