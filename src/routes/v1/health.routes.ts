import {Router,type Request,type Response} from "express";
import {metricsCollector} from "../../utils/metrics.js";

const router=Router();

router.get("/health",(_req:Request,res:Response)=>{
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

router.get("/metrics",(_req:Request, res:Response)=>{
    res.status(200).json(metricsCollector.getSnapshot());
});

export const healthRouter=router;