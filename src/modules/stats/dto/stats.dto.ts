import type { z } from 'zod';
import type {
  ConsistencyDaySchema,
  GetStatsQuerySchema,
  GetStatsResponseSchema,
} from '../schemas/stats.schema';

export type GetStatsQueryDto = z.infer<typeof GetStatsQuerySchema>;
export type GetStatsResponseDto = z.infer<typeof GetStatsResponseSchema>;
export type ConsistencyDayDto = z.infer<typeof ConsistencyDaySchema>;
