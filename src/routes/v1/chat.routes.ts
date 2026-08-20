import {Router, type Request, type Response, NextFunction} from "express";
import {validate} from "../../middleware/validate.js";
import {type ChatCompletionInput , ChatCompletionSchema} from "../../schemas/chat.schema.js";
import { ProviderFactory } from "../../providers/provider.factory.js";
import {responseCache} from "../../utils/cache.js";
import { createRatelimiter } from "../../middleware/rateLimiter.js";
import { RouterService } from "../../services/router.service.js";
import { authenticateApiKey } from "../../middleware/auth.js";
import { CostService } from "../../services/cost.service.js";
import { metricsCollector } from "../../utils/metrics.js";
const router = Router();

const chatRateLimiter=createRatelimiter({
    windowMs: 60*1000,
    maxRequests: 10, 
})
router.post(
    "/completions",
    authenticateApiKey,
    chatRateLimiter,
    validate(ChatCompletionSchema),

    async(req: Request<{},{},ChatCompletionInput>, res: Response,next:NextFunction):Promise<void>=>{
        try{ 

            metricsCollector.recordrequest();
            if (req.body.stream) {
            const provider = ProviderFactory.getProvider(req.body.model);
            if (!provider.completeStream) {
                 res.status(400).json({ error: { message: "Streaming not supported by provider" } });
                 return;
                }

        
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");

        const stream = await provider.completeStream(req.body);

        for await (const chunk of stream) {
          const sseData = {
            id: `chatcmpl-${Date.now()}`,
            object: "chat.completion.chunk",
            created: Math.floor(Date.now() / 1000),
            model: req.body.model,
            choices: [
              {
                index: 0,
                delta: { content: chunk },
                finish_reason: null,
              },
            ],
          };
          res.write(`data: ${JSON.stringify(sseData)}\n\n`);
        }

        res.write("data: [DONE]\n\n");
        res.end();
        return;
        }
            const cacheKey= responseCache.generateKey(req.body);
            const cachedResponse= responseCache.get(cacheKey);
             if(cachedResponse){

                metricsCollector.recordCacheHit();
                metricsCollector.recordSuccess();
                res.setHeader("X-cache","HIT");
                res.status(200).json(cachedResponse);
                return;
             }
            const {response: result , fallbackUsed , attemptedModels}= await RouterService.executeWithFallback(req.body);
            const usageReport = CostService.calculationCost(
                result.model,
                result.usage.promptTokens,
                result.usage.completionTokens
            );

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
            prompt_tokens: usageReport.promptTokens,
            completion_tokens:  usageReport.completionTokens,
            total_tokens:  usageReport.totalTokens ,
            cost_usd: usageReport.costUsd,
          },
        };
     responseCache.set(cacheKey, responsePayload,60000);
     metricsCollector.recordCacheMiss();
     metricsCollector.recordSuccess();
     metricsCollector.recordTokensAndCost(
        result.model,
        usageReport.totalTokens,
        usageReport.costUsd
     );
     res.setHeader("X-cache","MISS");
     res.setHeader("X-Fallback-Triggered", fallbackUsed.toString());
     res.setHeader("X-Attempted-Models", attemptedModels.join(", "));
     res.status(200).json(responsePayload);
    } catch(error){
        metricsCollector.recordFailure();
        next(error);
    }}
);

export const chatRouter= router;