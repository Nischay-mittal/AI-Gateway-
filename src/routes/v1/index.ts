import {Router} from "express";
import { modelsRouter} from "./models.routes.js";

const v1Router= Router();

v1Router.use("/models",modelsRouter);

export {v1Router};