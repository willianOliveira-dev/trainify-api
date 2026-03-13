import type { z } from 'zod';
import {
  ErrorResponseSchema,
  ValidationErrorResponseSchema,
} from '@/shared/errors/schemas/error.schema';

export const privateResponse = <T extends Record<number, z.ZodTypeAny>>(successResponses: T) => ({
  ...successResponses,
  401: ErrorResponseSchema.describe('Sessão inválida ou ausente'),
  500: ErrorResponseSchema.describe('Erro interno do servidor'),
});

export const privateMutationResponse = <T extends Record<number, z.ZodTypeAny>>(
  successResponses: T,
) => ({
  ...privateResponse(successResponses),
  400: ValidationErrorResponseSchema.describe('Dados inválidos'),
});

