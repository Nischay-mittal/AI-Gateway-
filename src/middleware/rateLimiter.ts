import type{Response, Request, NextFunction} from "express";
import {AppError} from "../utils/errors.js";

interface RateLimitConfig{
    windowMs: number;
    maxRequests: number;
}

interface ClientRecord{
    count:number;
    resetTime: number;
}

export const createRatelimiter=(config: RateLimitConfig)=>{
    const tracker=new Map<string, ClientRecord>();

    return (req:Request,res:Response,next:NextFunction):void=>{
        const clientId= req.ip || req.socket.remoteAddress || "anonymous";
        const now= Date.now();
        
        let record = tracker.get(clientId);
        
        if(!record || now>record.resetTime)
        {
            record={count:1,resetTime:now+config.windowMs};
            tracker.set(clientId,record);
        }
        else record.count++;

        const remaining = Math.max(0,config.maxRequests- record.count);
        const resetSeconds= Math.ceil(record.resetTime/1000);
        res.setHeader("X-RateLimit-Limit",config.maxRequests.toString());
        res.setHeader("X-Ratelimit-Remaining",remaining.toString());
        res.setHeader("X-rateLimit-Reset", resetSeconds.toString());
        if(record.count>config.maxRequests)
        {   
            const retryAfter=Math.ceil((record.resetTime-now)/1000);
            res.setHeader("Retry-after",retryAfter.toString());
            return next(
                new AppError("Too many requests at the moment , Please try again later.",429)
            );

        }
        next();
    };
};