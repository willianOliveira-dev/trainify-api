import { pgEnum } from 'drizzle-orm/pg-core';

export const weekDayEnum = pgEnum('week_day', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);
