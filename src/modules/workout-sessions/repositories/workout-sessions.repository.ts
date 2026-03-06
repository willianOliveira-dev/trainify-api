import { db } from "@/db/connection";
import { userWorkoutSessions } from "@/db/schemas";
import { eq } from "drizzle-orm";

class WorkoutSessionsRepository {
  async create(data: { userId: string; workoutDayId: string; workoutPlanId: string }): Promise<{
    id: string;
    startedAt: Date | null;
    userId: string;
    workoutDayId: string;
    completedAt: Date | null;
  }> {
    const [session] = await db
      .insert(userWorkoutSessions)
      .values({
        userId: data.userId,
        workoutDayId: data.workoutDayId,
        workoutPlanId: data.workoutPlanId,
        startedAt: new Date(),
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
          lte(table.startedAt, endOfDay)
        ),
    });

    return session ?? null;
  }

  async findById(id: string) {
    const session = await db.query.userWorkoutSessions.findFirst({
      where: (table, { eq }) => eq(table.id, id),
    });

    return session ?? null;
  }

  async update(id: string, data: { completedAt: Date }) {
    const [session] = await db
      .update(userWorkoutSessions)
      .set({
        completedAt: data.completedAt,
      })
      .where(eq(userWorkoutSessions.id, id))
      .returning({
        id: userWorkoutSessions.id,
        startedAt: userWorkoutSessions.startedAt,
        completedAt: userWorkoutSessions.completedAt,
      });

    return session;
  }

  async findSessionsByDateRange(userId: string, startAt: Date, endAt: Date) {
    const sessions = await db.query.userWorkoutSessions.findMany({
      where: (table, { and, eq, gte, lte }) =>
        and(
          eq(table.userId, userId), 
          gte(table.startedAt, startAt), 
          lte(table.startedAt, endAt)
        ),
    });

    return sessions;
  }

  async findCompletedSessionsByWorkoutPlanId(workoutPlanId: string): Promise<{ startedAt: Date | null }[]> {
    const sessions = await db.query.userWorkoutSessions.findMany({
      where: (table, { and, eq, isNotNull }) =>
        and(eq(table.workoutPlanId, workoutPlanId), isNotNull(table.completedAt)),
      columns: {
        startedAt: true,
      },
    });

    return sessions;
  }

  async findTodaySessionsByWorkoutDayId(workoutDayId: string): Promise<
    {
      id: string;
      workoutDayId: string;
      startedAt: Date | null;
      completedAt: Date | null;
    }[]
  > {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await db.query.userWorkoutSessions.findMany({
      where: (table, { and, eq, gte, lt }) =>
        and(
          eq(table.workoutDayId, workoutDayId),
          gte(table.startedAt, today),
          lt(table.startedAt, tomorrow)
        ),
      columns: {
        id: true,
        workoutDayId: true,
        startedAt: true,
        completedAt: true,
      },
    });

    return sessions;
  }
}

const workoutSessionsRepository = new WorkoutSessionsRepository();

export { WorkoutSessionsRepository, workoutSessionsRepository };