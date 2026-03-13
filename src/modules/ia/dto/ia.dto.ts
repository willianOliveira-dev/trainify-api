import type { z } from 'zod';
import type {
  ChatBodySchema,
  WorkoutDaySchema,
} from '@/modules/ia/schemas/ia.schema';

export type ChatBodyDto = z.infer<typeof ChatBodySchema>;
export type WorkoutDayDto = z.infer<typeof WorkoutDaySchema>;

