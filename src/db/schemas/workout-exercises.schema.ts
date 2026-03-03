import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { workoutDays } from './workout-days.schema';

export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    order: integer('order').notNull(),
    name: text('name').notNull(),
    sets: integer('sets').notNull(),
    reps: integer('reps').notNull(),
    restTimeInSeconds: integer('rest_time_in_seconds').notNull(),
    workoutDayId: text('workout_day_id')
      .notNull()
      .references(() => workoutDays.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('workout_exercises_day_id_order_idx').on(t.workoutDayId, t.order),

    uniqueIndex('workout_exercises_day_order_unique_idx').on(t.workoutDayId, t.order),
    check('workout_exercises_sets_positive_chk', sql`${t.sets} > 0`),
    check('workout_exercises_reps_positive_chk', sql`${t.reps} > 0`),
    check('workout_exercises_rest_positive_chk', sql`${t.restTimeInSeconds} >= 0`),
    check('workout_exercises_order_positive_chk', sql`${t.order} > 0`),
  ],
);
