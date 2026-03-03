import { getHomeDataUseCase } from '../use-cases/get-home-data.use-case';
import type { GetHomeDataHandler } from './get-home-data.controller.types';

class HomeController {
  getHomeData: GetHomeDataHandler = async (request, reply) => {
    const { date } = request.params;
    const userId = request.session.user.id;

    const data = await getHomeDataUseCase.execute({
      date,
      userId,
    });

    return reply.status(200).send(data);
  };
}

const homeController = new HomeController();

export { HomeController, homeController };
