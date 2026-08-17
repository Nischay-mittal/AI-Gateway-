import express, {Express} from "express";
import {pinoHttp} from "pino-http";
import {logger} from "./utils/logger.js";
import { correlationId } from "./middleware/correlationId.js";

export const createApp=(): Express=> {
    const app= express();

    app.use(express.json());
    app.use(correlationId);
    app.use(pinoHttp({logger,genReqId: (req) => req.headers["x-request-id"] as string,}));

    app.get("/health",(req,res)=> {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString()});
    });

    return app;
};