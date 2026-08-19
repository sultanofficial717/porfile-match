import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export class QwenEmbeddingProvider implements IEmbeddingProvider {
  readonly provider = "qwen" as const;
  readonly modelName: string;
  private apiKey: string | undefined;
  private baseUrl: string;

  constructor(modelName?: string, apiKey?: string, baseUrl?: string) {
    this.modelName = modelName || process.env.QWEN_EMBEDDING_MODEL || "text-embedding-v3";
    this.apiKey = apiKey || process.env.QWEN_API_KEY;
    this.baseUrl =
      baseUrl ||
      process.env.QWEN_BASE_URL ||
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
  }

  async getModelInfo(): Promise<EmbeddingModelInfo> {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return {
      provider: "qwen",
      modelName: this.modelName,
      dimension: 1024,
      isConfigured,
      requiresKey: true,
      baseUrl: this.baseUrl,
      description: "Qwen / DashScope Text Embedding (e.g. text-embedding-v3, 1024 dimensions)",
    };
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("QWEN_API_KEY is not configured in environment variables.");
    }

    const startTime = performance.now();
    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/embeddings`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API responded with HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const vector = data?.data?.[0]?.embedding;
      if (!vector || !Array.isArray(vector)) {
        throw new Error("Qwen API returned invalid embedding vector response.");
      }

      const latencyMs = Math.round(performance.now() - startTime);

      return {
        embedding: vector,
        dimension: vector.length,
        modelName: this.modelName,
        provider: "qwen",
        latencyMs,
        isMock: false,
      };
    } catch (error: any) {
      throw new Error(`Qwen Embedding error: ${error?.message || "Unknown error"}`);
    }
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("QWEN_API_KEY is not configured in environment variables.");
    }

    const startTime = performance.now();
    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/embeddings`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          input: texts,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Qwen API responded with HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const latencyMs = Math.round(performance.now() - startTime);

      return data.data.map((item: any) => ({
        embedding: item.embedding,
        dimension: item.embedding.length,
        modelName: this.modelName,
        provider: "qwen",
        latencyMs: Math.round(latencyMs / texts.length),
        isMock: false,
      }));
    } catch (error: any) {
      throw new Error(`Qwen Batch Embedding error: ${error?.message || "Unknown error"}`);
    }
  }
}
