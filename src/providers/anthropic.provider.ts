import type {LLMProvider, ProviderResponse} from "./provider.interface.js";
import type { ChatCompletionInput} from "../schemas/chat.schema.js";


export class AnthropicProvider implements LLMProvider{
    readonly name = "anthropic";

    async complete(input : ChatCompletionInput):Promise<ProviderResponse>{
        const lastUserMessage= input.messages[input.messages.length-1]?.content || "";
        return {
            id:`msg-anthropic-${Date.now()}`,
            content: `[Anthropic mock response] Processed: "${lastUserMessage}" using ${input.model}`,
            model: input.model,
            usage:{
                promptTokens: lastUserMessage.length,
                completionTokens: 30,
            },
        };
    }
}