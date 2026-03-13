import type { z } from 'zod';
import type {
  GetUserTrainDataResponseSchema,
  UpsertUserTrainDataSchema,
} from '../schemas/users.schema';

export type UpsertUserTrainDataDto = z.infer<typeof UpsertUserTrainDataSchema>;
export type GetUserTrainDataResponseDto = z.infer<typeof GetUserTrainDataResponseSchema>;

