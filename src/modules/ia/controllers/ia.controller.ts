import { google } from '@ai-sdk/google';
import { type ModelMessage, streamText } from 'ai';
import type { ChatHandler } from '@/modules/ia/controllers/ia.controller.types';
import { buildAiTools } from '@/modules/ia/helpers/build-ai-tools.helper';
import { SYSTEM_PROMPT } from '@/modules/ia/prompts/personal-trainer.prompt';
import { UnauthorizedError } from '@/shared/errors/app.error';

class IaController {
    chat: ChatHandler = async (request, _reply) => {
        const { messages } = request.body;
        const session = request.session;

        if (!session) {
            throw new UnauthorizedError('Usuário não autenticado');
        }

        const result = streamText({
            model: google('gemini-1.5-flash'),
            system: SYSTEM_PROMPT,
            messages: messages as ModelMessage[],
            tools: buildAiTools(session.user.id),
        });

        return result.toTextStreamResponse();
    };
}

const iaController = new IaController();

export { IaController, iaController };
