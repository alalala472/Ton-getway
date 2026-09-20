import type { ProviderType } from "@prisma/client";
import type { ProviderAdapter } from "./types";
import { openAICompatible } from "./openai-compatible";
import { openRouter } from "./openrouter";
import { ollama } from "./ollama";
import { anthropic } from "./anthropic";
import { gemini } from "./gemini";
import { custom } from "./custom";

export function adapterFor(provider: ProviderType): ProviderAdapter {
  switch (provider) {
    case "OPENAI_COMPATIBLE": return openAICompatible;
    case "OPENROUTER": return openRouter;
    case "OLLAMA": return ollama;
    case "ANTHROPIC": return anthropic;
    case "GEMINI": return gemini;
    case "CUSTOM": return custom;
  }
}
