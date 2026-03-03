import { createWorkoutPlanUseCase } from '@/modules/workout-plans/use-cases/create-workout-plan.use-case';
import { getAllWorkoutPlanUseCase } from '../use-cases/get-all-workout-plans.use-case';
import { getByIdWorkoutPlanUseCase } from '../use-cases/get-by-id-workout-plan.use-case';
import { startWorkoutSessionUseCase } from '../use-cases/start-workout-session.use-case';
import type { StartWorkoutSessionHandler } from './start-workout-session.controller.types';
import type {
  CreateWorkoutPlanHandler,
  FindAllWorkoutPlansHandler,
  FindByIdHandler,
} from './workout-plans.controller.types';

class WorkoutPlansController {
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
    const output = await getByIdWorkoutPlanUseCase.execute({ id });
    return reply.status(200).send(output);
  };

  findAll: FindAllWorkoutPlansHandler = async (_, reply) => {
    const output = await getAllWorkoutPlanUseCase.execute();
    return reply.status(200).send(output);
  };
}

const workoutPlansController = new WorkoutPlansController();

export { WorkoutPlansController, workoutPlansController };
