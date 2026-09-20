import type { ProviderAdapter } from "./types";
import { normalizeGemini, normalizeStreamFromSSE } from "./normalize";
const u = (b: string, p: string) => `${b.replace(/\/$/, "")}${p}`;
function toGemini(body: any) {
  const contents = (body.messages || []).filter((m: any) => m.role !== "system").map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: typeof m.content === "string" ? m.content : JSON.stringify(m.content) }] }));
  const system = (body.messages || []).filter((m: any) => m.role === "system").map((m: any) => typeof m.content === "string" ? m.content : JSON.stringify(m.content)).join("\n");
  const out: any = { contents };
  if (system) out.systemInstruction = { parts: [{ text: system }] };
  const cfg: any = {};
  if (body.temperature !== undefined) cfg.temperature = body.temperature;
  if (body.top_p !== undefined) cfg.topP = body.top_p;
  if (body.max_tokens !== undefined) cfg.maxOutputTokens = body.max_tokens;
  if (Object.keys(cfg).length) out.generationConfig = cfg;
  return out;
}
export const gemini: ProviderAdapter = {
  async listModels(base, key) {
    const r = await fetch(u(base, "/models"), { headers: { "x-goog-api-key": key }, cache: "no-store" });
    if (!r.ok) throw new Error(`Gemini model discovery failed (${r.status})`);
    const j = await r.json();
    return (j.models || []).map((m: any) => ({ id: String(m.name).replace(/^models\//, ""), displayName: m.displayName, contextLength: m.inputTokenLimit, supportsVision: Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"), raw: m }));
  },
  async test(base, key) { try { const models = await this.listModels(base, key); return { ok: true, models }; } catch (e) { return { ok: false, message: e instanceof Error ? e.message : "Connection failed" }; } },
  async normalizeNonStream(response, model) { return normalizeGemini(response, model); },
  normalizeStream(response, model) { return normalizeStreamFromSSE(response, model, (d) => { const c=d.candidates?.[0]; const text=(c?.content?.parts||[]).map((p:any)=>p.text||"").join(""); return {text, finish:c?.finishReason?.toLowerCase()==="stop"?"stop":undefined, usage:d.usageMetadata?{prompt_tokens:d.usageMetadata.promptTokenCount||0,completion_tokens:d.usageMetadata.candidatesTokenCount||0,total_tokens:d.usageMetadata.totalTokenCount||0}:undefined}; }); },
  async chat(base, key, req) {
    const method = req.stream ? "streamGenerateContent" : "generateContent";
    const suffix = req.stream ? "&alt=sse" : "";
    return fetch(`${u(base, `/models/${encodeURIComponent(req.model)}:${method}`)}?alt=${req.stream?"sse":"json"}`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(toGemini(req.body)), cache: "no-store" });
  }
};
