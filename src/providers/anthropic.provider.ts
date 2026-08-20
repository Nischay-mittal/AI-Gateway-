import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, ProviderResponse } from "./provider.interface.js";
import type { ChatCompletionInput } from "../schemas/chat.schema.js";
import { AppError } from "../utils/errors.js";

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });
  }

  async complete(input: ChatCompletionInput): Promise<ProviderResponse> {
    try {
      // 1. Extract system message (Anthropic expects system prompt at top-level)
      const systemMessage = input.messages.find((msg) => msg.role === "system");
      const systemPrompt = typeof systemMessage?.content === "string" 
        ? systemMessage.content 
        : undefined;

      // 2. Filter non-system messages for Anthropic messages payload
      const conversationMessages = input.messages
        .filter((msg) => msg.role === "user" || msg.role === "assistant")
        .map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        }));

      // 3. Model mapping
      const modelName = input.model.includes("claude")
        ? input.model
        : "claude-3-5-sonnet-20241022";

      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: input.max_tokens ?? 1024,
        temperature: input.temperature,
        system: systemPrompt,
        messages: conversationMessages,
      });

      // 4. Extract text response
      const firstBlock = response.content[0];
      const text = firstBlock?.type === "text" ? firstBlock.text : "";

      return {
        id: response.id,
        content: text,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      const statusCode = error.status || 500;
      throw new AppError(
        `Anthropic API error: ${error.message || "Unknown error"}`,
        statusCode
      );
    }
  }
}