import type { GetUserTrainDataResponseDto } from '../dto/users.dto';
import {
  usersRepository as defaultUsersRepository,
  type UsersRepository,
} from '../repository/users.repository';

interface GetUserTrainDataInput {
  userId: string;
}

class GetUserTrainDataUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute({ userId }: GetUserTrainDataInput): Promise<GetUserTrainDataResponseDto> {
    // Returns null (not 404) if the user has no training data yet
    return this.usersRepository.findByUserId(userId);
  }
}

const getUserTrainDataUseCase = new GetUserTrainDataUseCase(defaultUsersRepository);

export { GetUserTrainDataUseCase, getUserTrainDataUseCase };
