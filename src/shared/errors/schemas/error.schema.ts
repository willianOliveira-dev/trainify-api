import { z } from 'zod';

const ErrorResponseSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  message: z.string(),
});

const ValidationErrorResponseSchema = ErrorResponseSchema.extend({
  issues: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
});

export { ErrorResponseSchema, ValidationErrorResponseSchema };

