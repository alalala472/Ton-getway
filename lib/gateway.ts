import { db } from "./db";
import { decryptSecret, hashToken } from "./crypto";
import { adapterFor } from "./providers";
import type { ProviderType } from "@prisma/client";

export async function resolveGatewayKey(rawKey: string) {
  const hash = hashToken(rawKey);
  return db.apiConfig.findFirst({ where: { gatewayKeyHash: hash, active: true } });
}

export async function runProvider(config: any, body: Record<string, unknown>) {
  const key = decryptSecret(config.encryptedApiKey);
  const adapter = adapterFor(config.provider as ProviderType);
  const model = String(body.model || config.defaultModel || "");
  if (!model) throw new Error("Model is required.");
  return adapter.chat(config.baseUrl, key, { model, body, stream: Boolean(body.stream) });
}

export async function listProviderModels(config: any) {
  const key = decryptSecret(config.encryptedApiKey);
  return adapterFor(config.provider as ProviderType).listModels(config.baseUrl, key);
}
