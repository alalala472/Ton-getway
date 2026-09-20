import { openAICompatible } from "./openai-compatible";
import type { ProviderAdapter } from "./types";

export const openRouter: ProviderAdapter = {
  ...openAICompatible,
  async listModels(base, key) {
    const r = await fetch(`${base.replace(/\/$/, "")}/models`, { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!r.ok) throw new Error(`Model discovery failed (${r.status})`);
    const j = await r.json();
    return (j.data || []).map((m: any) => ({
      id: m.id,
      displayName: m.name,
      contextLength: m.context_length,
      isFree: typeof m.pricing?.prompt === "string" && Number(m.pricing.prompt) === 0 && Number(m.pricing.completion || 0) === 0,
      inputPrice: Number(m.pricing?.prompt || 0),
      outputPrice: Number(m.pricing?.completion || 0),
      raw: m
    }));
  }
};
