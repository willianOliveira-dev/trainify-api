import {
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { user } from './user.schema';

export const userTrainData = pgTable(
  'user_train_data',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    weightInGrams: integer('weight_in_grams').notNull(),
    heightInCentimeters: integer('height_in_centimeters').notNull(),
    age: integer('age').notNull(),
    bodyFatPercentage: doublePrecision('body_fat_percentage').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  },
  (t) => [
    uniqueIndex('user_train_data_user_id_unique_idx').on(t.userId),
    index('user_train_data_user_id_idx').on(t.userId),
  ],
);

