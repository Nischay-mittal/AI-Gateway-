import {Router} from "express";
import { modelsRouter} from "./models.routes.js";
import {chatRouter} from "./chat.routes.js";

const v1Router= Router();

v1Router.use("/models",modelsRouter);
v1Router.use("/chat",chatRouter);

export {v1Router};