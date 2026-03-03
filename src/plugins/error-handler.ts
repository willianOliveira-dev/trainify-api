import type { FastifyError } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '@/shared/errors/app.error';

interface ErrorResponse {
    statusCode: number;
    code: string;
    success: boolean;
    message: string;
    issues?: { field: string; message: string }[];
}

export default fp(
    async (app) => {
        app.setErrorHandler((error: FastifyError, request, reply) => {
            if (error.validation) {
                return reply.status(400).send({
                    statusCode: 400,
                    success: false,
                    code: 'VALIDATION_ERROR',
                    message: 'Dados inválidos',
                    issues: error.validation.map((v) => ({
                        field:
                            String(v.instancePath).replace('/', '') ||
                            String(v.params?.missingProperty ?? 'unknown'),
                        message: v.message ?? 'Erro de validação',
                    })),
                } satisfies ErrorResponse);
            }

            if (error instanceof AppError) {
                if (error.statusCode >= 500) {
                    app.log.error(
                        { err: error, req: request.id },
                        error.message,
                    );
                }

                return reply.status(error.statusCode).send({
                    statusCode: error.statusCode,
                    success: false,
                    code: error.code,
                    message: error.message,
                } satisfies ErrorResponse);
            }

            if (error.statusCode) {
                if (error.code === 'FST_ERR_RESPONSE_SERIALIZATION') {
                    app.log.error(
                        { err: error, req: request.id },
                        'Schema/DB mismatch on response',
                    );
                    return reply.status(500).send({
                        statusCode: 500,
                        success: false,
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Erro interno do servidor',
                    } satisfies ErrorResponse);
                }

                return reply.status(error.statusCode).send({
                    statusCode: error.statusCode,
                    success: false,
                    code: error.code ?? 'FASTIFY_ERROR',
                    message: error.message,
                } satisfies ErrorResponse);
            }

            app.log.error({ err: error, req: request.id }, 'Unhandled error');
            
            return reply.status(500).send({
                statusCode: 500,
                code: 'INTERNAL_SERVER_ERROR',
                success: false,
                message: 'Erro interno do servidor',
            } satisfies ErrorResponse);
        });
    },
    {
        name: 'error-handler',
    },
);
