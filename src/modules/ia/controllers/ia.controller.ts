import { google } from '@ai-sdk/google';
import { generateText, type ModelMessage, streamText } from 'ai';
import type { ChatHandler } from '@/modules/ia/controllers/ia.controller.types';
import { buildAiTools } from '@/modules/ia/helpers/build-ai-tools.helper';
import { SYSTEM_PROMPT } from '@/modules/ia/prompts/personal-trainer.prompt';
import { UnauthorizedError } from '@/shared/errors/app.error';

class IaController {
    chat: ChatHandler = async (request, reply) => {
        const { messages } = request.body;
        const session = request.session;

        if (!session) {
            throw new UnauthorizedError('Usuário não autenticado');
        }

        const result = streamText({
            model: google('gemini-2.5-flash'),
            system: SYSTEM_PROMPT,
            messages: messages as ModelMessage[],
            tools: buildAiTools(session.user.id),
        });

        const accept = request.headers.accept ?? '';
        const wantsSSE = accept.includes('text/event-stream');

        if (wantsSSE) {
            reply.header('Content-Type', 'text/event-stream; charset=utf-8');
            reply.header('Cache-Control', 'no-cache');
            reply.header('Connection', 'keep-alive');
            reply.raw.writeHead(200);
            for await (const delta of result.textStream) {
                reply.raw.write(delta);
            }
            reply.raw.end();
            return reply;
        }

        let { text } = await generateText({
            model: google('gemini-2.5-flash'),
            system: SYSTEM_PROMPT,
            messages: messages as ModelMessage[],
            tools: buildAiTools(session.user.id),
        });

        if (!text || text.trim() === '') {
            const secondPass = await generateText({
                model: google('gemini-2.5-flash'),
                system: SYSTEM_PROMPT,
                messages: messages as ModelMessage[],
                toolChoice: 'none',
            });
            text = secondPass.text;
        }

        return reply.status(200).send({ text });
    };
}

const iaController = new IaController();

export { IaController, iaController };
