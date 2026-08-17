import dotenv from "dotenv";
import {z} from "zod";

dotenv.config();

const envSchema= z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().positive().default(3000),
});

const parsedEnv = envSchema.safeParse(process.env);
if(!parsedEnv.success){
    console.error("Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}

export const config=parsedEnv.data;
export type Config = z.infer<typeof envSchema>;
