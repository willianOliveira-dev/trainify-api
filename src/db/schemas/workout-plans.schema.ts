import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { user } from './user.schema';

export const workoutPlans = pgTable(
  'workout_plans',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text('name').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    index('workout_plans_user_id_idx').on(t.userId),
    index('workout_plans_user_active_idx').on(t.userId, t.isActive),
    uniqueIndex('workout_plans_user_name_unique_idx').on(t.userId, t.name),
    index('workout_plans_created_at_idx').on(t.createdAt),
  ],
);
