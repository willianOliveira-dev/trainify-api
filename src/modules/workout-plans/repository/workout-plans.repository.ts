import { eq, inArray } from 'drizzle-orm';
import { db } from '@/db/connection';
import { workoutDays, workoutExercises, workoutPlans } from '@/db/schemas';
import type {
  CreateWorkoutPlanRepositoryInput,
  UpdateWorkoutPlanRepositoryInput,
  WorkoutDayDetailsRepositoryDbOutput,
  WorkoutPlanDetailsRepositoryDbOutput,
  WorkoutPlanRepositoryDbOutput,
  WorkoutPlansListRepositoryDbOutput,
} from '@/modules/workout-plans/repository/workout-plans.repository.types';

class WorkoutPlansRepository {
  async create(data: CreateWorkoutPlanRepositoryInput): Promise<WorkoutPlanRepositoryDbOutput> {
    const createdPlan = await db.transaction(async (tx) => {
      const { workoutDays: workoutDaysInput, ...planData } = data;

      const [plan] = await tx
        .insert(workoutPlans)
        .values({
          name: planData.name,
          userId: planData.userId,
          isActive: planData.isActive ?? true,
        })
        .returning();

      const daysToInsert = workoutDaysInput.map((day) => ({
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        workoutPlanId: plan.id,
      }));

      const insertedDays = await tx.insert(workoutDays).values(daysToInsert).returning();

      const exercisesToInsert = workoutDaysInput.flatMap((day, index) => {
        const workoutDayId = insertedDays[index].id;

        return day.exercises.map((exercise) => ({
          name: exercise.name,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeInSeconds: exercise.restTimeInSeconds,
          workoutDayId,
        }));
      });

      if (exercisesToInsert.length > 0) {
        await tx.insert(workoutExercises).values(exercisesToInsert);
      }

      return { id: plan.id };
    });

    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.id, createdPlan.id),
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });

    if (!result) {
      throw Error('Falha ao criar o plano de treino');
    }

    return result;
  }

  async findById(id: string): Promise<WorkoutPlanRepositoryDbOutput | null> {
    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });
    return result ?? null;
  }

  async findDetailsById(id: string): Promise<WorkoutPlanDetailsRepositoryDbOutput | null> {
    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.id, id),
      with: {
        workoutDays: {
          with: {
            exercises: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      userId: result.userId,
      name: result.name,
      workoutDays: result.workoutDays.map((day) => ({
        id: day.id,
        weekDay: day.weekDay as any,
        name: day.name,
        isRest: day.isRest,
        coverImageUrl: day.coverImageUrl ?? undefined,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds ?? 0,
        exercisesCount: day.exercises.length,
      })),
    };
  }

  async findDayDetailsById(
    planId: string,
    dayId: string,
  ): Promise<WorkoutDayDetailsRepositoryDbOutput | null> {
    const result = await db.query.workoutDays.findFirst({
      where: (table, { and, eq }) => and(eq(table.id, dayId), eq(table.workoutPlanId, planId)),
      with: {
        workoutPlan: {
          columns: {
            userId: true,
          },
        },
        exercises: {
          columns: {
            createdAt: false,
            updatedAt: false,
          },
        },
        sessions: {
          where: (sessionTable, { eq }) => eq(sessionTable.workoutDayId, dayId),
          columns: {
            id: true,
            workoutDayId: true,
            startedAt: true,
            completedAt: true,
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      name: result.name,
      isRest: result.isRest,
      coverImageUrl: result.coverImageUrl ?? undefined,
      estimatedDurationInSeconds: result.estimatedDurationInSeconds ?? 0,
      weekDay: result.weekDay as any,
      workoutPlanUserId: result.workoutPlan.userId,
      exercises: result.exercises,
      sessions: result.sessions.map((session) => ({
        id: session.id,
        workoutDayId: session.workoutDayId,
        startedAt: session.startedAt?.toISOString(),
        completedAt: session.completedAt?.toISOString(),
      })),
    };
  }

  async findAll(): Promise<WorkoutPlansListRepositoryDbOutput> {
    const result = await db.query.workoutPlans.findMany({
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });
    return result;
  }

  async findByName(name: string): Promise<WorkoutPlanRepositoryDbOutput | null> {
    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.name, name),
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });

    return result ?? null;
  }

  async update(
    data: UpdateWorkoutPlanRepositoryInput,
    id: string,
  ): Promise<WorkoutPlanRepositoryDbOutput> {
    const updatedPlan = await db.transaction(async (tx) => {
      const { workoutDays: workoutDaysInput, ...planData } = data;

      await tx
        .update(workoutPlans)
        .set({
          name: planData.name,
          isActive: planData.isActive,
        })
        .where(eq(workoutPlans.id, id));

      const daysOfPlan = await tx
        .select({ id: workoutDays.id })
        .from(workoutDays)
        .where(eq(workoutDays.workoutPlanId, id));

      const daysIds = daysOfPlan.map((day) => day.id);

      if (daysIds.length > 0) {
        await tx.delete(workoutExercises).where(inArray(workoutExercises.workoutDayId, daysIds));

        await tx.delete(workoutDays).where(eq(workoutDays.workoutPlanId, id));
      }

      const daysToInsert = (workoutDaysInput ?? []).map((day) => ({
        name: day.name,
        weekDay: day.weekDay,
        isRest: day.isRest,
        estimatedDurationInSeconds: day.estimatedDurationInSeconds,
        workoutPlanId: id,
      }));

      const insertedDays = await tx.insert(workoutDays).values(daysToInsert).returning();

      const exercisesToInsert = (workoutDaysInput ?? []).flatMap((day, index) => {
        const workoutDayId = insertedDays[index].id;

        return day.exercises.map((exercise) => ({
          name: exercise.name,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          restTimeInSeconds: exercise.restTimeInSeconds,
          workoutDayId,
        }));
      });

      if (exercisesToInsert.length > 0) {
        await tx.insert(workoutExercises).values(exercisesToInsert);
      }

      return { id };
    });

    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.id, updatedPlan.id),
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });

    if (!result) {
      throw new Error('Falha ao atualizar o plano de treino');
    }

    return result;
  }

  async deactivatePreviousAndCreateNew(
    previousWorkoutPlanId: string,
    newWorkoutPlanData: CreateWorkoutPlanRepositoryInput,
  ): Promise<WorkoutPlanRepositoryDbOutput> {
    const createdPlan = await db.transaction(async (_) => {
      await this.deactivate(previousWorkoutPlanId);
      return this.create(newWorkoutPlanData);
    });
    return createdPlan;
  }

  async deactivate(id: string): Promise<void> {
    await db.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.id, id));
  }

  async existsWorkoutPlanActive(): Promise<{ id: string } | null> {
    const result = await db.query.workoutPlans.findFirst({
      where: (table, { eq }) => eq(table.isActive, true),
      columns: {
        id: true,
      },
    });
    return result ?? null;
  }

  async findActiveByUserId(userId: string): Promise<WorkoutPlanRepositoryDbOutput | null> {
    const result = await db.query.workoutPlans.findFirst({
      where: (table, { and, eq }) => and(eq(table.isActive, true), eq(table.userId, userId)),
      with: {
        workoutDays: {
          with: {
            exercises: true,
          },
        },
      },
    });

    return result ?? null;
  }
}

const workoutPlansRepository = new WorkoutPlansRepository();

export { WorkoutPlansRepository, workoutPlansRepository };
