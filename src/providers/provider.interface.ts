import type {ChatCompletionInput} from "../schemas/chat.schema.js";

export interface ProviderResponse{
    id:string;
    content:string;
    model:string;
    usage:{
        promptTokens:number;
        completionTokens:number;
    };
}

export interface LLMProvider{
    name:string;
    complete(input:ChatCompletionInput):Promise<ProviderResponse>;
}