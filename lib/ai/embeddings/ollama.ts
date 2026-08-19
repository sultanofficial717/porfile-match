import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  readonly provider = "ollama" as const;
  readonly modelName: string;
  private baseUrl: string;

  constructor(modelName?: string, baseUrl?: string) {
    this.modelName = modelName || process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  async getModelInfo(): Promise<EmbeddingModelInfo> {
    let isRunning = false;
    try {
      const res = await fetch(`${this.baseUrl.replace(/\/+$/, "")}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(1500),
      });
      isRunning = res.ok;
    } catch {
      isRunning = false;
    }

    return {
      provider: "ollama",
      modelName: this.modelName,
      dimension: 768, // nomic-embed-text is 768; all-minilm is 384
      isConfigured: isRunning,
      requiresKey: false,
      baseUrl: this.baseUrl,
      description: `Local Ollama embeddings running at ${this.baseUrl} (Model: ${this.modelName})`,
    };
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    const startTime = performance.now();
    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/api/embeddings`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: text,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Ollama returned HTTP ${response.status}: ${err}`);
      }

      const data = await response.json();
      const vector = data?.embedding;
      if (!vector || !Array.isArray(vector)) {
        throw new Error("Ollama did not return a valid embedding vector.");
      }

      const latencyMs = Math.round(performance.now() - startTime);

      return {
        embedding: vector,
        dimension: vector.length,
        modelName: this.modelName,
        provider: "ollama",
        latencyMs,
        isMock: false,
      };
    } catch (error: any) {
      if (error.name === "TimeoutError") {
        throw new Error(`Ollama request timed out at ${this.baseUrl}`);
      }
      throw new Error(
        `Ollama connection failed (${this.baseUrl}): ${error.message || "Is Ollama running locally?"}`
      );
    }
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      results.push(await this.embedText(text));
    }
    return results;
  }
}
