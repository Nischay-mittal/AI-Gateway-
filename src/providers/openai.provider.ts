import type {LLMProvider, ProviderResponse} from "./provider.interface.js";
import type { ChatCompletionInput} from "../schemas/chat.schema.js";
import OpenAI from "openai";
import {AppError} from "../utils/errors.js";

export class OpenAIProvider implements LLMProvider{
    readonly name = "openai";
    private client :OpenAI;
    
    constructor(){
        this.client= new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "",
        });
    }
    async complete(input : ChatCompletionInput):Promise<ProviderResponse>{
        try{
            const response = await this.client.chat.completions.create({
                model: input.model,
                messages: input.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
                temperature: input.temperature,
                max_tokens: input.max_tokens,

            });
            const choice= response.choices[0];
            if(!choice?.message?.content){
                throw new AppError("OpenAI returned an empty completion choice",502);
            }
            return {
                id:response.id,
                content: choice.message.content,
                model: response.model,
                usage:{
                    promptTokens: response.usage?.prompt_tokens?? 0,
                    completionTokens: response.usage?.completion_tokens??0,
                },
            };

        }catch(error :any){
            if(error instanceof AppError) throw error;
            const statusCode=error.status || 500;
            throw new AppError(
                `OpenAI API error: ${error.message || "Unknown error"}`, statusCode
            );
        }
        
    }

    async *completeStream(input : ChatCompletionInput): AsyncIterable<string>{
        try{
            const stream= await this.client.chat.completions.create({
                model: input.model,
                messages: input.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
                temperature: input.temperature,
                max_tokens: input.max_tokens,
                stream: true,
            });
            for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) yield delta;
      }
    } catch (error: any) {
      throw new AppError(`OpenAI Stream error: ${error.message}`, error.status || 500);
    }
        } }
