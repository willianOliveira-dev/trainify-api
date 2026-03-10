import { and, count, eq } from 'drizzle-orm';
import { db } from '@/db/connection';
import { userWorkoutSessionSets } from '@/db/schemas'; 

class WorkoutSessionSetsRepository {
    async completeSet(data: {
        sessionId: string;
        exerciseId: string;
        setNumber: number;
    }) {
        const [set] = await db
            .insert(userWorkoutSessionSets)
            .values(data)
            .returning();
        return set;
    }

    async deleteSet(data: {
        sessionId: string;
        exerciseId: string;
        setNumber: number;
    }) {
        await db
            .delete(userWorkoutSessionSets)
            .where(
                and(
                    eq(userWorkoutSessionSets.sessionId, data.sessionId),
                    eq(userWorkoutSessionSets.exerciseId, data.exerciseId),
                    eq(userWorkoutSessionSets.setNumber, data.setNumber),
                ),
            );
    }

    async findBySessionId(sessionId: string) {
        return db.query.userWorkoutSessionSets.findMany({
            where: (table, { eq }) => eq(table.sessionId, sessionId),
        });
    }

    async countBySessionId(sessionId: string): Promise<number> {
        const [result] = await db
            .select({ count: count() })
            .from(userWorkoutSessionSets)
            .where(eq(userWorkoutSessionSets.sessionId, sessionId));
        return result?.count ?? 0;
    }
}

const workoutSessionSetsRepository = new WorkoutSessionSetsRepository();
export { WorkoutSessionSetsRepository, workoutSessionSetsRepository };