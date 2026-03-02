import { relations } from 'drizzle-orm';
import { users } from './user.schema';
import { userWorkoutSessions } from './user-workout-sessions.schema';
import { workoutDays } from './workout-day.schema';
import { workoutExercises } from './workout-exercises.schema';
import { workoutPlans } from './workout-plan.schema';

export const usersRelations = relations(users, ({ many }) => ({
  workoutPlans: many(workoutPlans),
  workoutSessions: many(userWorkoutSessions),
}));

export const workoutPlansRelations = relations(workoutPlans, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPlans.userId],
    references: [users.id],
  }),
  workoutDays: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  workoutPlan: one(workoutPlans, {
    fields: [workoutDays.workoutPlanId],
    references: [workoutPlans.id],
  }),
  exercises: many(workoutExercises),
  sessions: many(userWorkoutSessions),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workoutDay: one(workoutDays, {
    fields: [workoutExercises.workoutDayId],
    references: [workoutDays.id],
  }),
}));

export const userWorkoutSessionsRelations = relations(userWorkoutSessions, ({ one }) => ({
  user: one(users, {
    fields: [userWorkoutSessions.userId],
    references: [users.id],
  }),
  workoutDay: one(workoutDays, {
    fields: [userWorkoutSessions.workoutDayId],
    references: [workoutDays.id],
  }),
}));
