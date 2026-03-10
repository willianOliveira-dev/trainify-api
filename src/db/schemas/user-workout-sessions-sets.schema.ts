import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { userWorkoutSessions } from './user-workout-sessions.schema';
import { workoutExercises } from './workout-exercises.schema';

export const userWorkoutSessionSets = pgTable(
  'user_workout_session_sets',
  {
    id: text('id').primaryKey().$defaultFn(() => uuidv7()),
    sessionId: text('session_id').notNull().references(() => userWorkoutSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('session_sets_session_id_idx').on(t.sessionId),
    index('session_sets_exercise_id_idx').on(t.exerciseId),
  ],
);