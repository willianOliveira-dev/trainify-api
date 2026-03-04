import { z } from 'zod';
import { weekDayEnum } from '@/db/schemas/enums/week-day-enum';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const ChatBodySchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
});

const ChatResponseSchema = z.object({
  text: z.string(),
});

const ExerciseSchema = z.object({
  name: z.string().describe('Nome do exercício'),
  order: z.number().describe('Ordem do exercício na sessão'),
  sets: z.number().describe('Quantidade de séries'),
  reps: z.number().describe('Quantidade de repetições'),
  restTimeInSeconds: z.number().describe('Tempo de descanso em segundos'),
});

const WorkoutDaySchema = z.object({
  name: z.string().describe('Nome do dia (ex: Superior A)'),
  weekDay: z.enum(weekDayEnum.enumValues).describe('Dia da semana'),
  isRest: z.boolean().describe('Se é dia de descanso'),
  coverImageUrl: z.string().url().describe('URL da imagem de capa'),
  estimatedDurationInSeconds: z.number().describe('Duração estimada em segundos'),
  exercises: z.array(ExerciseSchema),
});

export { ChatBodySchema, ChatResponseSchema, ChatMessageSchema, ExerciseSchema, WorkoutDaySchema };
