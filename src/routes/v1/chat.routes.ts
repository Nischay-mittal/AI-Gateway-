import {Router, type Request, type Response, NextFunction} from "express";
import {validate} from "../../middleware/validate.js";
import {type ChatCompletionInput , ChatCompletionSchema} from "../../schemas/chat.schema.js";
import { ProviderFactory } from "../../providers/provider.factory.js";
import {responseCache} from "../../utils/cache.js";
import { createRatelimiter } from "../../middleware/rateLimiter.js";
const router = Router();

const chatRateLimiter=createRatelimiter({
    windowMs: 60*1000,
    maxRequests: 5, 
})
router.post(
    "/completions",
    chatRateLimiter,
    validate(ChatCompletionSchema),

    async(req: Request<{},{},ChatCompletionInput>, res: Response,next:NextFunction):Promise<void>=>{
        try{ 

             const cacheKey= responseCache.generateKey(req.body);
             const cachedResponse= responseCache.get(cacheKey);
             if(cachedResponse){
                res.setHeader("X-cache","HIT");
                res.status(200).json(cachedResponse);
                return;
             }
             const provider= ProviderFactory.getProvider(req.body.model);
             const result= await provider.complete(req.body);
       

            const responsePayload={
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
        };
     responseCache.set(cacheKey, responsePayload,60000);
     res.setHeader("X-cache","MISS");
     res.status(200).json(responsePayload);
    } catch(error){
        next(error);
    }}
);

export const chatRouter= router;