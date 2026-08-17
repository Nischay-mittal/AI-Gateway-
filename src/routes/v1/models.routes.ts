import {Router, type Request, type Response} from "express";

const router = Router();

router.get("/",(_req: Request, res: Response)=>{
    const models=[
        { id : "gpt-4o", provider : "openai", contextWindow: 128000 },
        { id : " claude-3-5-sonnet", provider: "anthropic", contextWindow: 200000},
        { id : "gemini-1.5-pro", provider: "google", contextWindow:1000000}
    ];
    res.status(200).json({data : models});

});

export const modelsRouter=router;