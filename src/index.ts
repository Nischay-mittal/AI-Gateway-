import {config} from "./config/env.js"
import {logger} from "./utils/logger.js";
import {createApp} from "./app.js";


const app= createApp();

console.log("Config loaded successfully:" , config);
logger.info("gateway initialisation started");

app.listen(config.PORT,()=>{
    logger.info(`AI gateway running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});