import { createWorkoutPlanUseCase } from '@/modules/workout-plans/use-cases/create-workout-plan.use-case';
import { completeSetUseCase } from '../use-cases/complete-set.use-case';
import { getAllWorkoutPlanUseCase } from '../use-cases/get-all-workout-plans.use-case';
import { getSessionSetsUseCase } from '../use-cases/get-session-sets.use-case';
import { getWorkoutDayDetailsUseCase } from '../use-cases/get-workout-day-details.use-case';
import { getWorkoutPlanDetailsUseCase } from '../use-cases/get-workout-plan-details.use-case';
import { startWorkoutSessionUseCase } from '../use-cases/start-workout-session.use-case';
import { undoSetUseCase } from '../use-cases/undo-set.use-case';
import { updateWorkoutSessionUseCase } from '../use-cases/update-workout-session.use-case';
import type { CompleteSetHandler } from './complete-set.controller.types.js';
import type { GetSessionSetsHandler } from './get-session-sets.controller.types.js';
import type { StartWorkoutSessionHandler } from './start-workout-session.controller.types.js';
import type { UndoSetHandler } from './undo-set.controller.types.js';
import type { UpdateWorkoutSessionHandler } from './update-workout-session.controller.types.js';
import type {
    CreateWorkoutPlanHandler,
    FindAllWorkoutPlansHandler,
    FindByIdHandler,
    FindDayDetailsHandler,
} from './workout-plans.controller.types';

class WorkoutPlansController {
    updateSession: UpdateWorkoutSessionHandler = async (request, reply) => {
        const { id, dayId, sessionId } = request.params;
        const { completedAt } = request.body;
        const userId = request.session.user.id;

        const session = await updateWorkoutSessionUseCase.execute({
            workoutPlanId: id,
            workoutDayId: dayId,
            sessionId,
            userId,
            completedAt,
        });

        return reply.status(200).send(session);
    };

    startSession: StartWorkoutSessionHandler = async (request, reply) => {
        const { id, dayId } = request.params;

        const userId = request.session.user.id;

        const session = await startWorkoutSessionUseCase.execute({
            workoutPlanId: id,
            workoutDayId: dayId,
            userId,
        });

        return reply.status(201).send(session);
    };

    getSessionSets: GetSessionSetsHandler = async (request, reply) => {
        const { sessionId } = request.params;
        const userId = request.session.user.id;

        const sets = await getSessionSetsUseCase.execute({ sessionId, userId });
        return reply.status(200).send(sets);
    };

    completeSet: CompleteSetHandler = async (request, reply) => {
        const { sessionId, exerciseId } = request.params;
        const { setNumber, totalSetsInWorkout } = request.body;
        const userId = request.session.user.id;

        const result = await completeSetUseCase.execute({
            sessionId,
            exerciseId,
            setNumber,
            totalSetsInWorkout,
            userId,
        });

        return reply.status(200).send(result);
    };

    undoSet: UndoSetHandler = async (request, reply) => {
        const { sessionId, exerciseId } = request.params;
        const { setNumber } = request.body;
        const userId = request.session.user.id;

        await undoSetUseCase.execute({
            sessionId,
            exerciseId,
            setNumber,
            userId,
        });

        return reply.status(204).send();
    };

    create: CreateWorkoutPlanHandler = async (request, reply) => {
        const output = await createWorkoutPlanUseCase.execute(request.body);
        const responseBody = output;
        return reply.status(201).send(responseBody);
    };

    findById: FindByIdHandler = async (request, reply) => {
        const { id } = request.params;
        const userId = request.session.user.id;
        const output = await getWorkoutPlanDetailsUseCase.execute({
            id,
            userId,
        });
        return reply.status(200).send(output);
    };

    findDayDetails: FindDayDetailsHandler = async (request, reply) => {
        const { id, dayId } = request.params;
        const userId = request.session.user.id;
        const output = await getWorkoutDayDetailsUseCase.execute({
            planId: id,
            dayId,
            userId,
        });
        return reply.status(200).send(output);
    };

    findAll: FindAllWorkoutPlansHandler = async (_, reply) => {
        const output = await getAllWorkoutPlanUseCase.execute();
        return reply.status(200).send(output);
    };
}

const workoutPlansController = new WorkoutPlansController();

export { WorkoutPlansController, workoutPlansController };

