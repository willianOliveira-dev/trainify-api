import { google } from '@ai-sdk/google';
import { stepCountIs, streamText, type UIMessage } from 'ai';
import type { ChatHandler } from '@/modules/ia/controllers/ia.controller.types';
import { buildAiTools } from '@/modules/ia/helpers/build-ai-tools.helper';
import { SYSTEM_PROMPT } from '@/modules/ia/prompts/personal-trainer.prompt';

function convertUiToModelMessages(messages: UIMessage[]) {
    return messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.parts
            .filter((part) => part.type === 'text')
            .map((part) => (part as { type: 'text'; text: string }).text)
            .join(''),
    }));
}

class IaController {
    chat: ChatHandler = async (request, reply) => {
        const { messages } = request.body as { messages: UIMessage[] };
        const session = request.session;

        const tools = buildAiTools(session.user.id);
        const modelMessages = convertUiToModelMessages(messages);

        const result = streamText({
            model: google('gemini-2.5-flash'),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            maxRetries: 3,
            maxOutputTokens: 500,
            stopWhen: stepCountIs(5),
            tools,
        });

        const response = result.toUIMessageStreamResponse();

        reply.status(response.status);
        response.headers.forEach((value, key) => {
            reply.header(key, value);
        });

        return reply.send(response.body);
    };
}

const iaController = new IaController();

export { IaController, iaController };
