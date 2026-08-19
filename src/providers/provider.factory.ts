import type {LLMProvider} from "./provider.interface.js";
import {OpenAIProvider} from "./openai.provider.js";
import {AnthropicProvider} from "./anthropic.provider.js";
import {GeminiProvider} from "./gemini.provider.js";
import {AppError} from "../utils/errors.js";


export class ProviderFactory{
    private static providers: Map<string, LLMProvider> = new Map<string, LLMProvider>([
        ["openai", new OpenAIProvider()],
        ["anthropic", new AnthropicProvider()],
        ["gemini", new GeminiProvider()],
    ]);



   static getProvider(model: string): LLMProvider{
    const normalisedModel= model.toLowerCase();

    if(normalisedModel.startsWith("gpt") || normalisedModel.includes("openai")||normalisedModel.includes("o1")||normalisedModel.includes("4o") || normalisedModel.includes("3o")){
        const provider=this.providers.get("openai");
        if(provider) return provider;
    }
    if(normalisedModel.startsWith("claude") || normalisedModel.includes("anthropic")||normalisedModel.includes("code")){
        const provider=this.providers.get("anthropic");
        if(provider) return provider;
    }
    if(normalisedModel.startsWith("gemini") || normalisedModel.includes("google")){
        const provider=this.providers.get("gemini");
        if(provider) return provider;
    }

    throw new AppError(`Unsupported model : ${model}, Supported families: gpt-*, claude-*, gemini-*`,400);
}}