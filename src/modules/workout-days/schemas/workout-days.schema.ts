import { z } from 'zod';
import { weekDayEnum } from '@/db/schemas';
import {
  CreateWorkoutExerciseSchema,
  WorkoutExerciseResponseSchema,
} from '@/modules/workout-exercises/schemas/workout-exercises.schema';

export const WorkoutDaysSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
  name: z
    .string()
    .trim()
    .min(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
    .max(50, {
      message: 'Nome deve ter no máximo 50 caracteres',
    })
    .nonempty({ message: 'Nome é obrigatório' }),
  weekDay: z.enum(weekDayEnum.enumValues),
  isRest: z.boolean({ message: 'Dia de descanso deve ser booleano' }).default(false),
  coverImageUrl: z
    .string()
    .url({ message: 'URL inválida' })
    .optional()
    .or(z.literal('').transform((val) => (val === '' ? null : val))),
  estimatedDurationInSeconds: z.number({ message: 'Duração deve ser um número' }).min(1, {
    message: 'Duração deve ser maior que 0',
  }),
  workoutPlanId: z.string().nonempty({ message: 'Plano de treino é obrigatório' }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutDaySchema = WorkoutDaysSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  exercises: z.array(CreateWorkoutExerciseSchema.omit({ workoutDayId: true })),
});

export const UpdateWorkoutDaySchema = WorkoutDaysSchema.omit({
  id: true,
  workoutPlanId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  exercises: z.array(CreateWorkoutExerciseSchema.omit({ workoutDayId: true })),
});

export const WorkoutDaysParamsSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
});

export const WorkoutDaysResponseSchema = WorkoutDaysSchema.omit({
  workoutPlanId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  exercises: z.array(WorkoutExerciseResponseSchema),
});
