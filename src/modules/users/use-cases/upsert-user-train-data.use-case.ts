import type { GetUserTrainDataResponseDto, UpsertUserTrainDataDto } from '../dto/users.dto.js';
import {
  usersRepository as defaultUsersRepository,
  type UsersRepository,
} from '../repository/users.repository';
import { NotFoundError } from '@/shared/errors/app.error';

interface UpsertUserTrainDataInput extends UpsertUserTrainDataDto {
  userId: string;
}

class UpsertUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: UpsertUserTrainDataInput): Promise<GetUserTrainDataResponseDto> {
    const { userId, ...data } = input;

    const result = await this.usersRepository.upsert(userId, data);

    if (!result) {
      throw new NotFoundError('Usuário');
    }

    return result;
  }
}

const upsertUserTrainDataUseCase = new UpsertUserTrainDataUseCase(defaultUsersRepository);

export { UpsertUserTrainDataUseCase, upsertUserTrainDataUseCase };
