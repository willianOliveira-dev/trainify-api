import { eq } from 'drizzle-orm';
import { db } from '@/db/connection';
import { user as userSchema, userTrainData } from '@/db/schemas';
import type { GetUserTrainDataResponseDto, UpsertUserTrainDataDto } from '../dto/users.dto.js';

class UsersRepository {
 async upsert(userId: string, data: UpsertUserTrainDataDto): Promise<GetUserTrainDataResponseDto> {

  await db.insert(userTrainData)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: userTrainData.userId,
      set: { ...data, updatedAt: new Date() },
    });

  const [result, user] = await Promise.all([
    db.query.userTrainData.findFirst({
      where: eq(userTrainData.userId, userId),
    }),
    db.query.user.findFirst({
      where: eq(userSchema.id, userId),
      columns: { name: true },
    }),
  ]);

  if (!result || !user) {
    return null;
  }
  

  return {
    userId: result.userId,
    userName: user.name,
    weightInGrams: result.weightInGrams,
    heightInCentimeters: result.heightInCentimeters,
    age: result.age,
    bodyFatPercentage: result.bodyFatPercentage,
  };
}


  async findByUserId(userId: string): Promise<GetUserTrainDataResponseDto> {

    const [result, user] = await Promise.all([
      db.query.userTrainData.findFirst({
        where: eq(userTrainData.userId, userId),
      }),
      db.query.user.findFirst({
        where: eq(userSchema.id, userId),
        columns: { name: true }
      })
    ]);

    if (!user || !result) {
      return null;
    }

    return {
      userId: userId,
      userName: user.name,
      weightInGrams: result.weightInGrams,
      heightInCentimeters: result.heightInCentimeters,
      age: result.age,
      bodyFatPercentage: result.bodyFatPercentage,
    };
  }
}

const usersRepository = new UsersRepository();

export { UsersRepository, usersRepository };
