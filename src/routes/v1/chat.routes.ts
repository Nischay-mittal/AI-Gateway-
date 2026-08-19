import {Router, type Request, type Response, NextFunction} from "express";
import {validate} from "../../middleware/validate.js";
import {type ChatCompletionInput , ChatCompletionSchema} from "../../schemas/chat.schema.js";
import { ProviderFactory } from "../../providers/provider.factory.js";
const router = Router();

router.post(
    "/completions",
    validate(ChatCompletionSchema),
    async(req: Request<{},{},ChatCompletionInput>, res: Response,next:NextFunction):Promise<void>=>{
        try{
             const provider= ProviderFactory.getProvider(req.body.model);
             const result= await provider.complete(req.body);
       

            res.status(200).json({
            id: result.id,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model:result.model,
            choices: [
            {
                index: 0,
                message: {
                role: "assistant",
                content: result.content,
            },
            finish_reason: "stop",
            },
           ],
            usage: {
            prompt_tokens: result.usage.promptTokens,
            completion_tokens: result.usage.completionTokens,
            total_tokens: result.usage.promptTokens + result.usage.completionTokens,
          },
        });
    } catch(error){
        next(error);
    }}
);

export const chatRouter= router;