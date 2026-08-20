import type {LLMProvider, ProviderResponse} from "./provider.interface.js";
import type { ChatCompletionInput} from "../schemas/chat.schema.js";
import { GoogleGenAI } from "@google/genai";
import { AppError } from "../utils/errors.js";

export class GeminiProvider implements LLMProvider{
    readonly name = "gemini";
    private ai: GoogleGenAI;

    constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });
    }

    async complete(input : ChatCompletionInput):Promise<ProviderResponse>{
        try {
      
      const lastMessage = input.messages[input.messages.length - 1];
      const prompt = typeof lastMessage?.content === "string" 
        ? lastMessage.content 
        : JSON.stringify(lastMessage?.content);

      
      const modelName = input.model.includes("gemini") 
        ? input.model 
        : "gemini-2.5-flash";

      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: input.temperature,
          maxOutputTokens: input.max_tokens,
        },
      });

      const text = response.text || "";
      const usageMeta = response.usageMetadata;

      return {
        id: `gemini-${Date.now()}`,
        content: text,
        model: modelName,
        usage: {
          promptTokens: usageMeta?.promptTokenCount ?? 0,
          completionTokens: usageMeta?.candidatesTokenCount ?? 0,
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const statusCode = error.status || 500;
      throw new AppError(
        `Gemini API error: ${error.message || "Unknown error"}`,
        statusCode
      );
    }
    }
    async *completeStream(input: ChatCompletionInput): AsyncIterable<string> {
    try {
      const lastMessage = input.messages[input.messages.length - 1];
      const prompt = typeof lastMessage?.content === "string" 
        ? lastMessage.content 
        : JSON.stringify(lastMessage?.content);

      const modelName = input.model.includes("gemini") ? input.model : "gemini-2.5-flash";

      const responseStream = await this.ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          temperature: input.temperature,
          maxOutputTokens: input.max_tokens,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) yield text;
      }
    } catch (error: any) {
      throw new AppError(`Gemini Stream error: ${error.message}`, error.status || 500);
    }
  }

}