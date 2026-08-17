import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';
import {AppError} from '../utils/errors.js';

export const errorHandler: ErrorRequestHandler=(
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) : void=>{
    const requestId=  (req.headers["x-request-id"] as string) || "unknown";

    if(err instanceof AppError){
        logger.warn({err,requestId},`Operational Error : ${err.message}`);
        res.status(err.statusCode).json({
            error:{
                message: err.message,
                statusCode: err.statusCode,
                requestId,
            },
        });
        return;
    }

    logger.error({err,requestId},`Unhandled internal error: ${err.message}`);
    res.status(500).json({
        error:{
            message:"Internal server error",
            statusCode:500,
            requestId,
        },
    });
};