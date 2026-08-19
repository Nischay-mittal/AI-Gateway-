import type {LLMProvider, ProviderResponse} from "./provider.interface.js";
import type { ChatCompletionInput} from "../schemas/chat.schema.js";


export class OpenAIProvider implements LLMProvider{
    readonly name = "openai";

    async complete(input : ChatCompletionInput):Promise<ProviderResponse>{
        const lastUserMessage= input.messages[input.messages.length-1]?.content || "";
        return {
            id:`chatcmpl-openai-${Date.now()}`,
            content: `[OpenAI mock response] Processed: "${lastUserMessage}" using ${input.model}`,
            model: input.model,
            usage:{
                promptTokens: lastUserMessage.length,
                completionTokens: 25,
            },
        };
    }
}