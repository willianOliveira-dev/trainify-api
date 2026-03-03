import { z } from 'zod';

export const WorkoutExerciseSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
  name: z
    .string()
    .trim()
    .min(3, {
      message: 'Nome deve ter no mínimo 3 caracteres',
    })
    .max(50, {
      message: 'Nome deve ter no máximo 50 caracteres',
    })
    .nonempty({ message: 'Nome é obrigatório' }),
  order: z.number({ message: 'Ordem deve ser um número' }).min(0, {
    message: 'Ordem deve ser maior ou igual a 0',
  }),
  sets: z.number({ message: 'Séries deve ser um número' }).min(1, {
    message: 'Número de séries deve ser maior que 0',
  }),
  reps: z.number({ message: 'Repetições deve ser um número' }).min(1, {
    message: 'Número de repetições deve ser maior que 0',
  }),
  restTimeInSeconds: z.number({ message: 'Tempo de descanso deve ser um número' }).min(0, {
    message: 'Tempo de descanso não pode ser negativo',
  }),
  workoutDayId: z.string().nonempty({ message: 'Dia de treino é obrigatório' }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateWorkoutExerciseSchema = WorkoutExerciseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateWorkoutExerciseSchema = WorkoutExerciseSchema.omit({
  id: true,
  workoutDayId: true,
  createdAt: true,
  updatedAt: true,
});

export const WorkoutExerciseParamsSchema = z.object({
  id: z
    .uuid({ version: 'v7', message: 'Id deve ser um uuid v7' })
    .nonempty({ message: 'Id é obrigatório' }),
});

export const WorkoutExerciseResponseSchema = WorkoutExerciseSchema.omit({
  workoutDayId: true,
  createdAt: true,
  updatedAt: true,
});
