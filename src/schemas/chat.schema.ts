import {z} from "zod";


export const ChatMessageSchema=z.object({
    role : z.enum(["system","user","assistant"]),
    content : z.string().min(1, "message content cannot be empty"),
});

export const ChatCompletionSchema=z.object({
    model: z.string().min(1),
    messages: z.array(ChatMessageSchema).min(1),
    temperature: z.number().min(0).max(2).optional(),
    max_tokens: z.number().int().min(1).optional(),
    stream: z.boolean().default(false),
});

export type ChatMessage=z.infer<typeof ChatMessageSchema>;
export type ChatCompletionInput=z.infer<typeof ChatCompletionSchema>;