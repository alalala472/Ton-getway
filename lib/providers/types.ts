export type ProviderModel = {
  id: string;
  displayName?: string;
  isFree?: boolean;
  supportsVision?: boolean;
  supportsReasoning?: boolean;
  supportsEmbedding?: boolean;
  contextLength?: number;
  inputPrice?: number;
  outputPrice?: number;
  raw?: unknown;
};

export type ProviderRequest = {
  model: string;
  body: Record<string, unknown>;
  stream: boolean;
};

export type ProviderAdapter = {
  listModels: (baseUrl: string, apiKey: string) => Promise<ProviderModel[]>;
  test: (baseUrl: string, apiKey: string) => Promise<{ ok: boolean; message?: string; models?: ProviderModel[] }>;
  chat: (baseUrl: string, apiKey: string, req: ProviderRequest) => Promise<Response>;
  normalizeNonStream?: (response: Response, model: string) => Promise<Response>;
  normalizeStream?: (response: Response, model: string) => Response;
};
