import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { user } from './user.schema';
import { workoutDays } from './workout-days.schema';

export const userWorkoutSessions = pgTable(
    'user_workout_sessions',
    {
        id: text('id')
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        workoutDayId: text('workout_day_id')
            .notNull()
            .references(() => workoutDays.id, { onDelete: 'cascade' }),
        startedAt: timestamp('started_at', { withTimezone: true })
            .notNull()
            .defaultNow(),
        completedAt: timestamp('completed_at', { withTimezone: true }),
    },
    (t) => [
        index('user_workout_sessions_user_id_idx').on(t.userId),
        index('user_workout_sessions_day_id_idx').on(t.workoutDayId),
        index('user_workout_sessions_user_active_idx').on(
            t.userId,
            t.completedAt,
        ),
        index('user_workout_sessions_started_at_idx').on(t.startedAt),
        check(
            'user_workout_sessions_completed_after_started_chk',
            sql`${t.completedAt} IS NULL OR ${t.completedAt} > ${t.startedAt}`,
        ),
    ],
);
