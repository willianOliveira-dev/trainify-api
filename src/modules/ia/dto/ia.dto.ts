import type { z } from 'zod';
import type {
  ChatBodySchema,
  ChatMessageSchema,
  WorkoutDaySchema,
} from '@/modules/ia/schemas/ia.schema';

export type ChatBodyDto = z.infer<typeof ChatBodySchema>;
export type ChatMessageDto = z.infer<typeof ChatMessageSchema>;
export type WorkoutDayDto = z.infer<typeof WorkoutDaySchema>;
