import type { z } from 'zod';
import {
  GetHomeParamsSchema,
  GetHomeResponseSchema,
  ConsistencyDaySchema,
} from '../schemas/home.schema';

export type GetHomeParamsDto = z.infer<typeof GetHomeParamsSchema>;
export type GetHomeResponseDto = z.infer<typeof GetHomeResponseSchema>;
export type ConsistencyDayDto = z.infer<typeof ConsistencyDaySchema>;
