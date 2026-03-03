import { eq } from 'drizzle-orm';
import { db } from '@/db/connection';
import { user, userTrainData } from '@/db/schemas';
import type { GetUserTrainDataResponseDto, UpsertUserTrainDataDto } from '../dto/users.dto';

class UsersRepository {
  async upsert(userId: string, data: UpsertUserTrainDataDto): Promise<GetUserTrainDataResponseDto> {
    await db
      .insert(userTrainData)
      .values({
        userId,
        weightInGrams: data.weightInGrams,
        heightInCentimeters: data.heightInCentimeters,
        age: data.age,
        bodyFatPercentage: data.bodyFatPercentage,
      })
      .onConflictDoUpdate({
        target: userTrainData.userId,
        set: {
          weightInGrams: data.weightInGrams,
          heightInCentimeters: data.heightInCentimeters,
          age: data.age,
          bodyFatPercentage: data.bodyFatPercentage,
          updatedAt: new Date(),
        },
      });

    const result = await db
      .select({
        userId: userTrainData.userId,
        userName: user.name,
        weightInGrams: userTrainData.weightInGrams,
        heightInCentimeters: userTrainData.heightInCentimeters,
        age: userTrainData.age,
        bodyFatPercentage: userTrainData.bodyFatPercentage,
      })
      .from(userTrainData)
      .innerJoin(user, eq(user.id, userTrainData.userId))
      .where(eq(userTrainData.userId, userId))
      .limit(1);

    const row = result[0];
    if (!row) {
      throw new Error('Falha ao salvar os dados de treino');
    }
    return row;
  }

  async findByUserId(userId: string): Promise<GetUserTrainDataResponseDto> {
    const result = await db
      .select({
        userId: userTrainData.userId,
        userName: user.name,
        weightInGrams: userTrainData.weightInGrams,
        heightInCentimeters: userTrainData.heightInCentimeters,
        age: userTrainData.age,
        bodyFatPercentage: userTrainData.bodyFatPercentage,
      })
      .from(userTrainData)
      .innerJoin(user, eq(user.id, userTrainData.userId))
      .where(eq(userTrainData.userId, userId))
      .limit(1);

    return result[0] ?? null;
  }
}

const usersRepository = new UsersRepository();

export { UsersRepository, usersRepository };
