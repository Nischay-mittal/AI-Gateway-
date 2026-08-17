import {randomUUID} from "node:crypto";
import type{ Request, Response, NextFunction} from "express";

export const correlationId=(
    req: Request,
    res: Response,
    next: NextFunction
): void => {

const headerId=req.headers["x-request-id"];
const requestId= typeof headerId === "string"? headerId : randomUUID();

req.headers["x-request-id"]= requestId;
res.setHeader("x-request-id",requestId);
next();
};