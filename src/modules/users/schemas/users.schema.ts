import { z } from 'zod';

export const UpsertUserTrainDataSchema = z.object({
  weightInGrams: z.number().int().positive({ message: 'Peso deve ser positivo' }),
  heightInCentimeters: z.number().int().positive({ message: 'Altura deve ser positiva' }),
  age: z.number().int().min(1).max(120, { message: 'Idade deve estar entre 1 e 120' }),
  bodyFatPercentage: z
    .number()
    .min(0, { message: 'Percentual de gordura deve ser >= 0' })
    .max(1, { message: 'Percentual de gordura deve ser <= 1 (1 = 100%)' }),
});

export const GetUserTrainDataResponseSchema = z
  .object({
    userId: z.string(),
    userName: z.string(),
    weightInGrams: z.number(),
    heightInCentimeters: z.number(),
    age: z.number(),
    bodyFatPercentage: z.number(),
  })
  .nullable();
