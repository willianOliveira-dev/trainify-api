import { relations } from 'drizzle-orm';
import { account, session } from './auth.schema';
import { user } from './user.schema';
import { userTrainData } from './user-train-data.schema';
import { userWorkoutSessions } from './user-workout-sessions.schema';
import { userWorkoutSessionSets } from './user-workout-sessions-sets.schema';
import { workoutDays } from './workout-days.schema';
import { workoutExercises } from './workout-exercises.schema';
import { workoutPlans } from './workout-plans.schema';

export const userRelations = relations(user, ({ one, many }) => ({
    sessions: many(session),
    accounts: many(account),
    workoutPlans: many(workoutPlans),
    workoutSessions: many(userWorkoutSessions),
    trainData: one(userTrainData, {
        fields: [user.id],
        references: [userTrainData.userId],
    }),
}));

export const userTrainDataRelations = relations(userTrainData, ({ one }) => ({
    user: one(user, {
        fields: [userTrainData.userId],
        references: [user.id],
    }),
}));

export const workoutPlansRelations = relations(
    workoutPlans,
    ({ one, many }) => ({
        user: one(user, {
            fields: [workoutPlans.userId],
            references: [user.id],
        }),
        workoutDays: many(workoutDays),
    }),
);

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
    workoutPlan: one(workoutPlans, {
        fields: [workoutDays.workoutPlanId],
        references: [workoutPlans.id],
    }),
    exercises: many(workoutExercises),
    sessions: many(userWorkoutSessions),
}));

export const workoutExercisesRelations = relations(
    workoutExercises,
    ({ one, many }) => ({
        workoutDay: one(workoutDays, {
            fields: [workoutExercises.workoutDayId],
            references: [workoutDays.id],
        }),
        sessionSets: many(userWorkoutSessionSets),
    }),
);

export const userWorkoutSessionsRelations = relations(
    userWorkoutSessions,
    ({ one, many }) => ({
        user: one(user, {
            fields: [userWorkoutSessions.userId],
            references: [user.id],
        }),
        workoutDay: one(workoutDays, {
            fields: [userWorkoutSessions.workoutDayId],
            references: [workoutDays.id],
        }),
        sets: many(userWorkoutSessionSets),
    }),
);

export const userWorkoutSessionSetsRelations = relations(
    userWorkoutSessionSets,
    ({ one }) => ({
        session: one(userWorkoutSessions, {
            fields: [userWorkoutSessionSets.sessionId],
            references: [userWorkoutSessions.id],
        }),
        exercise: one(workoutExercises, {
            fields: [userWorkoutSessionSets.exerciseId],
            references: [workoutExercises.id],
        }),
    }),
);

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

