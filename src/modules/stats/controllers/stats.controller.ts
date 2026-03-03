import { getStatsUseCase } from '../use-cases/get-stats.use-case';
import type { GetStatsHandler } from './stats.controller.types';

class StatsController {
  getStats: GetStatsHandler = async (request, reply) => {
    const { from, to } = request.query;
    const userId = request.session.user.id;

    const output = await getStatsUseCase.execute({ from, to, userId });

    return reply.status(200).send(output);
  };
}

const statsController = new StatsController();

export { StatsController, statsController };
