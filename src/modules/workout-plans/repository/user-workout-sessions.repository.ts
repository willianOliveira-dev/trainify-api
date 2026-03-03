import { db } from '@/db/connection';
import { userWorkoutSessions } from '@/db/schemas';

class UserWorkoutSessionsRepository {
  async create(data: { userId: string; workoutDayId: string }): Promise<{
    id: string;
    startedAt: Date;
    userId: string;
    workoutDayId: string;
    completedAt: Date | null;
  }> {
    const [session] = await db
      .insert(userWorkoutSessions)
      .values({
        userId: data.userId,
        workoutDayId: data.workoutDayId,
      })
      .returning({
        id: userWorkoutSessions.id,
        startedAt: userWorkoutSessions.startedAt,
        userId: userWorkoutSessions.userId,
        workoutDayId: userWorkoutSessions.workoutDayId,
        completedAt: userWorkoutSessions.completedAt,
      });

    return session;
  }

  async findByDayIdAndDate(workoutDayId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const session = await db.query.userWorkoutSessions.findFirst({
      where: (table, { and, eq, gte, lte }) =>
        and(
          eq(table.workoutDayId, workoutDayId),
          gte(table.startedAt, startOfDay),
          lte(table.startedAt, endOfDay),
        ),
    });

    return session ?? null;
  }
}

const userWorkoutSessionsRepository = new UserWorkoutSessionsRepository();

export { UserWorkoutSessionsRepository, userWorkoutSessionsRepository };
