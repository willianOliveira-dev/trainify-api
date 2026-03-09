import type { GetUserTrainDataResponseDto } from '../dto/users.dto';
import {
  usersRepository as defaultUsersRepository,
  type UsersRepository,
} from '../repository/users.repository';
import { NotFoundError } from '@/shared/errors/app.error';

interface GetUserTrainDataInput {
  userId: string;
}

class GetUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: GetUserTrainDataInput): Promise<GetUserTrainDataResponseDto> {
    const data = await this.usersRepository.findByUserId(userId);

    if (!data) {
      throw new NotFoundError('Dados de treino do usuário');
    }

    return data;
  }
}

const getUserTrainDataUseCase = new GetUserTrainDataUseCase(defaultUsersRepository);

export { GetUserTrainDataUseCase, getUserTrainDataUseCase };