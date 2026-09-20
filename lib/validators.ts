import { z } from "zod";

export const providerSchema = z.enum(["OPENAI_COMPATIBLE", "ANTHROPIC", "GEMINI", "OPENROUTER", "OLLAMA", "CUSTOM"]);
export const configSchema = z.object({
  name: z.string().min(1).max(80),
  provider: providerSchema,
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  defaultModel: z.string().max(200).optional().or(z.literal("")),
  logMode: z.enum(["METADATA", "BODY_TRUNCATED", "FULL"]).default("METADATA"),
  maxRequestsPerMin: z.coerce.number().int().min(1).max(100000).optional().nullable(),
  proxyEnabled: z.boolean().default(false),
});
