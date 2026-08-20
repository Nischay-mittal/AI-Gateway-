import type { ChatCompletionInput } from "../schemas/chat.schema.js";
import type { ProviderResponse } from "../providers/provider.interface.js";
import { ProviderFactory } from "../providers/provider.factory.js";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

export interface ExecutionResult{
    response: ProviderResponse;
    fallbackUsed: boolean;
    attemptedModels: string[];
}

export class RouterService{
    private static fallbackMap: Record<string,string[]>={
        "gpt-4o": ["claude-3-5-sonnet", "gemini-1.5-pro"],
        "claude-3-5-sonnet": ["gpt-4o", "gemini-1.5-pro"],
        "gemini-1.5-pro": ["gpt-4o", "claude-3-5-sonnet"],
    };


    static async executeWithFallback(input : ChatCompletionInput): Promise<ExecutionResult>{
        const primaryModel=input.model;
        const fallbacks=this.fallbackMap[primaryModel] || [];
        const modelsTotry=[primaryModel, ...fallbacks];
        const attemptedModels: string[]=[];

        for(let i=0;i<modelsTotry.length;i++)
        {
            const currentModel=modelsTotry[i];
            attemptedModels.push(currentModel);

            try{
                const provider=ProviderFactory.getProvider(currentModel);

                const response = await provider.complete({
                    ...input,
                    model:currentModel,
                });
                return {
                    response,
                    fallbackUsed:i>0,
                    attemptedModels,
                };
            }catch(error){
                logger.error(
                    `model execution failed for ${currentModel}, Retrying next fallback if available. Error: ${(error as Error).message}`
                );
                if(i===modelsTotry.length-1){
                    throw new AppError(
                        `All Providers failed for request. Attempted :${attemptedModels.join(", ")}`,502
                    );
                }
            }
        }
        throw new AppError("Unexpected routing termination",500);
    }
    
}