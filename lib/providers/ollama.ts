import type { ProviderAdapter } from "./types";
import { normalizeOllamaStream } from "./normalize";
const u = (b: string, p: string) => `${b.replace(/\/$/, "")}${p}`;
export const ollama: ProviderAdapter = {
  async listModels(base, key) {
    const r = await fetch(u(base, "/api/tags"), { headers: key ? { Authorization: `Bearer ${key}` } : {}, cache: "no-store" });
    if (!r.ok) throw new Error(`Ollama model discovery failed (${r.status})`);
    const j = await r.json();
    return (j.models || []).map((m: any) => ({ id: m.name, displayName: m.name, raw: m }));
  },
  async test(base, key) { try { const models = await this.listModels(base, key); return { ok: true, models }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Connection failed" }; } },
  normalizeStream(response, model) { return normalizeOllamaStream(response, model); },
  async chat(base, key, req) {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const body = { model: req.model, messages, stream: req.stream };
    return fetch(u(base, "/api/chat"), { method: "POST", headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) }, body: JSON.stringify(body), cache: "no-store" });
  }
};
