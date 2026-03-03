import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { weekDayEnum } from './enums/week-day-enum';
import { workoutPlans } from './workout-plans.schema';

export const workoutDays = pgTable(
  'workout_days',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text('name').notNull(),
    workoutPlanId: text('workout_plan_id')
      .notNull()
      .references(() => workoutPlans.id, { onDelete: 'cascade' }),
    isRest: boolean('is_rest').notNull().default(false),
    weekDay: weekDayEnum('week_day').notNull(),
    coverImageUrl: text('cover_image_url'),
    estimatedDurationInSeconds: integer('estimated_duration_in_seconds'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('workout_days_plan_id_idx').on(t.workoutPlanId),
    uniqueIndex('workout_days_plan_weekday_unique_idx').on(t.workoutPlanId, t.weekDay),
    index('workout_days_plan_rest_idx').on(t.workoutPlanId, t.isRest),
    check(
      'workout_days_duration_positive_chk',
      sql`${t.estimatedDurationInSeconds} IS NULL OR ${t.estimatedDurationInSeconds} > 0`,
    ),
  ],
);
