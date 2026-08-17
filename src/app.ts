import express, {Express} from "express";
import {pinoHttp} from "pino-http";
import {logger} from "./utils/logger.js";

export const createApp=(): Express=> {
    const app= express();

    app.use(express.json());
    app.use(pinoHttp({logger}));

    app.get("/health",(req,res)=> {
        res.status(200).json({ status: "ok", timestamp: new Date().toISOString()});
    });

    return app;
};