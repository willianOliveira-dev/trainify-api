import { getUserTrainDataUseCase } from '../use-cases/get-user-train-data.use-case';
import { upsertUserTrainDataUseCase } from '../use-cases/upsert-user-train-data.use-case';
import type { GetMeHandler, UpsertTrainDataHandler } from './users.controller.types';

class UsersController {
  getMe: GetMeHandler = async (request, reply) => {
    const userId = request.session.user.id;
    const output = await getUserTrainDataUseCase.execute({ userId });
    return reply.status(200).send(output);
  };

  upsertTrainData: UpsertTrainDataHandler = async (request, reply) => {
    const userId = request.session.user.id;
    const output = await upsertUserTrainDataUseCase.execute({ userId, ...request.body });
    return reply.status(200).send(output);
  };
}

const usersController = new UsersController();

export { UsersController, usersController };
