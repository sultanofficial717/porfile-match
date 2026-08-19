export interface EmbeddingModelInfo {
  provider: "gemini" | "qwen" | "ollama" | "mock";
  modelName: string;
  dimension: number;
  isConfigured: boolean;
  requiresKey: boolean;
  baseUrl?: string;
  description: string;
}

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
  modelName: string;
  provider: string;
  latencyMs: number;
  isMock: boolean;
}

export interface IEmbeddingProvider {
  readonly provider: "gemini" | "qwen" | "ollama" | "mock";
  readonly modelName: string;
  getModelInfo(): Promise<EmbeddingModelInfo>;
  embedText(text: string): Promise<EmbeddingResult>;
  embedBatch(texts: string[]): Promise<EmbeddingResult[]>;
}
