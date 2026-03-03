import { createWorkoutPlanUseCase } from '@/modules/workout-plans/use-cases/create-workout-plan.use-case';
import { getAllWorkoutPlanUseCase } from '../use-cases/get-all-workout-plans.use-case';
import { getWorkoutDayDetailsUseCase } from '../use-cases/get-workout-day-details.use-case';
import { getWorkoutPlanDetailsUseCase } from '../use-cases/get-workout-plan-details.use-case';
import { startWorkoutSessionUseCase } from '../use-cases/start-workout-session.use-case';
import { updateWorkoutSessionUseCase } from '../use-cases/update-workout-session.use-case';
import type { StartWorkoutSessionHandler } from './start-workout-session.controller.types';
import type { UpdateWorkoutSessionHandler } from './update-workout-session.controller.types';
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

  create: CreateWorkoutPlanHandler = async (request, reply) => {
    const output = await createWorkoutPlanUseCase.execute(request.body);
    const responseBody = output;
    return reply.status(201).send(responseBody);
  };

  findById: FindByIdHandler = async (request, reply) => {
    const { id } = request.params;
    const userId = request.session.user.id;
    const output = await getWorkoutPlanDetailsUseCase.execute({ id, userId });
    return reply.status(200).send(output);
  };

  findDayDetails: FindDayDetailsHandler = async (request, reply) => {
    const { id, dayId } = request.params;
    const userId = request.session.user.id;
    const output = await getWorkoutDayDetailsUseCase.execute({ planId: id, dayId, userId });
    return reply.status(200).send(output);
  };

  findAll: FindAllWorkoutPlansHandler = async (_, reply) => {
    const output = await getAllWorkoutPlanUseCase.execute();
    return reply.status(200).send(output);
  };
}

const workoutPlansController = new WorkoutPlansController();

export { WorkoutPlansController, workoutPlansController };
