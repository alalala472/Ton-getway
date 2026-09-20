import type { ProviderAdapter } from "./types";
import { normalizeAnthropic } from "./normalize";
const u = (b: string, p: string) => `${b.replace(/\/$/, "")}${p}`;
export const anthropic: ProviderAdapter = {
  async listModels(base, key) {
    const r = await fetch(u(base, "/models"), { headers: { "x-api-key": key, "anthropic-version": "2023-06-01" }, cache: "no-store" });
    if (!r.ok) throw new Error(`Anthropic model discovery failed (${r.status})`);
    const j = await r.json();
    return (j.data || []).map((m: any) => ({ id: m.id, displayName: m.display_name, raw: m }));
  },
  async test(base, key) { try { const models = await this.listModels(base, key); return { ok: true, models }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Connection failed" }; } },
  async normalizeNonStream(response, model) { return normalizeAnthropic(response, model); },
  async chat(base, key, req) {
    const input = req.body as any;
    const messages = Array.isArray(input.messages) ? input.messages.filter((m: any) => m.role !== "system") : [];
    const system = Array.isArray(input.messages) ? input.messages.filter((m: any) => m.role === "system").map((m: any) => typeof m.content === "string" ? m.content : "").join("\n") : undefined;
    const body: any = { model: req.model, messages, max_tokens: input.max_tokens || 1024, stream: req.stream };
    if (system) body.system = system;
    return fetch(u(base, "/messages"), { method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json", "accept": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  }
};
