import type { ProviderAdapter } from "./types";

const url = (base: string, path: string) => `${base.replace(/\/$/, "")}${path}`;

export const openAICompatible: ProviderAdapter = {
  async listModels(base, key) {
    const r = await fetch(url(base, "/models"), { headers: { Authorization: `Bearer ${key}` }, cache: "no-store" });
    if (!r.ok) throw new Error(`Model discovery failed (${r.status})`);
    const j = await r.json();
    return (j.data || []).map((m: any) => ({ id: m.id, displayName: m.name, contextLength: m.context_length, raw: m }));
  },
  async test(base, key) { try { const models = await this.listModels(base, key); return { ok: true, models }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Connection failed" }; } },
  async chat(base, key, req) { return fetch(url(base, "/chat/completions"), { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(req.body), cache: "no-store" }); }
};
