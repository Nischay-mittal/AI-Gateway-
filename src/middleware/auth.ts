import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

const VALID_API_KEYS=new Set<string>([
    "gw-live-secret-key-1",
    "gw-live-secret-key-2",
]);

export interface AuthenticatedRequest extends Request{
    apiKey?:string;
}

export const authenticateApiKey=(
    req:AuthenticatedRequest,
    _res:Response,
    next: NextFunction
): void=>{
    const authHeader=req.headers.authorization;
    const xApiKey=req.headers["x-api-key"] as string | undefined;

    let token: string|undefined;

    if(authHeader && authHeader.startsWith("Bearer ")){
        token=authHeader.split(" ")[1];
    }else if(xApiKey){
        token=xApiKey;
    }

    if(!token){
        return next(
            new AppError(
                "Unauthorized: Missing API Key. Provide via 'Authorization:Bearer <key>'or 'x-api-key' header.",401
            )
        );
    }

    if(!VALID_API_KEYS.has(token)){
        return next(new AppError("Unauthorized : Invalid API Key.",401));
    }

    req.apiKey=token;
    next();
};