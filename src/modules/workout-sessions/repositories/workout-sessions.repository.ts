import { db } from "@/db/connection";

class WorkoutSessionsRepository {
    async findCompletedSessionsByWorkoutPlanId(workoutPlanId: string): Promise<{ startedAt: Date }[]> {
      return db.query.userWorkoutSessions.findMany({
        where: (userWorkoutSessions, { eq, and, isNotNull })=> and(
          eq(userWorkoutSessions.workoutDayId, workoutPlanId),
          isNotNull(userWorkoutSessions.completedAt)
        ),
        columns: {
          startedAt: true,
        }
    })
  }
}

const workoutSessionsRepository = new WorkoutSessionsRepository();

export { WorkoutSessionsRepository, workoutSessionsRepository }