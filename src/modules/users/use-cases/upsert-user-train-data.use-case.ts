import type { GetUserTrainDataResponseDto, UpsertUserTrainDataDto } from '../dto/users.dto';
import {
  usersRepository as defaultUsersRepository,
  type UsersRepository,
} from '../repository/users.repository';

interface UpsertUserTrainDataInput extends UpsertUserTrainDataDto {
  userId: string;
}

class UpsertUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: UpsertUserTrainDataInput): Promise<GetUserTrainDataResponseDto> {
    const { userId, ...data } = input;
    return this.usersRepository.upsert(userId, data);
  }
}

const upsertUserTrainDataUseCase = new UpsertUserTrainDataUseCase(defaultUsersRepository);

export { UpsertUserTrainDataUseCase, upsertUserTrainDataUseCase };
