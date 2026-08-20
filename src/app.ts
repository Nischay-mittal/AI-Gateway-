import express, {Express} from "express";
import {pinoHttp} from "pino-http";
import {logger} from "./utils/logger.js";
import { correlationId } from "./middleware/correlationId.js";
import { errorHandler } from "./middleware/errorHandler.js";
import {v1Router} from "./routes/v1/index.js";
import { healthRouter } from "./routes/v1/health.routes.js";
export const createApp=(): Express=> {
    const app= express();

    app.use(express.json());
    app.use(correlationId);
    app.use(pinoHttp({logger,genReqId: (req) => req.headers["x-request-id"] as string,}));
    app.use("/api/v1",v1Router);
    app.use("/",healthRouter);

  
    app.use(errorHandler);
    return app;
};