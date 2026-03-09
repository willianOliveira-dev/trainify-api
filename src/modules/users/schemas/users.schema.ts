import { z } from 'zod';

export const UpsertUserTrainDataSchema = z.object({
  weightInGrams: z
    .number()
    .int()
    .positive({ message: 'Peso deve ser positivo' })
    .describe('Peso do usuário em gramas'),
  heightInCentimeters: z
    .number()
    .int()
    .positive({ message: 'Altura deve ser positiva' })
    .describe('Altura do usuário em centímetros'),
  age: z
    .number()
    .int()
    .min(1, { message: 'Idade deve ser no mínimo 1' })
    .max(120, { message: 'Idade deve estar entre 1 e 120' })
    .describe('Idade do usuário em anos'),
  bodyFatPercentage: z
    .number()
    .min(0, { message: 'Percentual de gordura deve ser >= 0' })
    .max(1, { message: 'Percentual de gordura deve ser <= 1 (1 = 100%)' })
    .describe('Percentual de gordura corporal (0 a 1, onde 1 = 100%)'),
}).describe('Dados de treino do usuário');

export const GetUserTrainDataResponseSchema = z
  .object({
    userId: z.string().describe('ID do usuário'),
    userName: z.string().describe('Nome do usuário'),
    weightInGrams: z.number().describe('Peso do usuário em gramas'),
    heightInCentimeters: z.number().describe('Altura do usuário em centímetros'),
    age: z.number().describe('Idade do usuário em anos'),
    bodyFatPercentage: z.number().describe('Percentual de gordura corporal (0 a 1)'),
  })
  .describe('Resposta com dados de treino do usuário')
  .nullable();
