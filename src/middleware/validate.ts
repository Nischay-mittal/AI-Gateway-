import type {Request, Response, NextFunction} from "express";
import { type ZodObject, ZodError } from "zod";
import {AppError} from "../utils/errors.js";

export const validate=(schema: ZodObject)=>{
    return async(req:Request,_res:Response,next:NextFunction):Promise<void>=>{
        try{
             req.body=await schema.parseAsync(req.body);
             next();
        }catch(error){
            if(error instanceof ZodError){
                const formattedErrors= error.issues.map((err)=>`${err.path.join(".")||"body"}:${err.message}`)
                .join("; ");
                return next(new AppError(`Validation failed: ${formattedErrors}`, 400));
            }
            next(error);
        }
    };
};
