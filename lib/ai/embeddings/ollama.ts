import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export interface OllamaHealthStatus {
  isConnected: boolean;
  model: string;
  isModelAvailable: boolean;
  availableModels: string[];
  statusText: "AVAILABLE" | "UNAVAILABLE" | "DISCONNECTED";
  baseUrl: string;
  error?: string;
}

export class OllamaEmbeddingProvider implements IEmbeddingProvider {
  readonly provider = "ollama" as const;
  readonly modelName: string;
  private baseUrl: string;

  constructor(modelName?: string, baseUrl?: string) {
    this.modelName = modelName || process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text";
    this.baseUrl = baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  getModel(): string {
    return this.modelName;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async checkHealth(): Promise<OllamaHealthStatus> {
    try {
      const cleanUrl = this.baseUrl.replace(/\/+$/, "");
      const res = await fetch(`${cleanUrl}/api/tags`, {
        method: "GET",
        signal: AbortSignal.timeout(3000),
      });

      if (!res.ok) {
        return {
          isConnected: false,
          model: this.modelName,
          isModelAvailable: false,
          availableModels: [],
          statusText: "DISCONNECTED",
          baseUrl: this.baseUrl,
          error: `Ollama service returned HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      const availableModels: string[] = (data?.models || []).map((m: any) => m.name || m.model);
      const isModelAvailable = availableModels.some((m) =>
        m.toLowerCase().startsWith(this.modelName.toLowerCase())
      );

      return {
        isConnected: true,
        model: this.modelName,
        isModelAvailable,
        availableModels,
        statusText: isModelAvailable ? "AVAILABLE" : "UNAVAILABLE",
        baseUrl: this.baseUrl,
        error: isModelAvailable
          ? undefined
          : `Model '${this.modelName}' not found in Ollama library (${availableModels.join(", ") || "None"}). Run: ollama pull ${this.modelName}`,
      };
    } catch (err: any) {
      return {
        isConnected: false,
        model: this.modelName,
        isModelAvailable: false,
        availableModels: [],
        statusText: "DISCONNECTED",
        baseUrl: this.baseUrl,
        error: `Cannot connect to Ollama at ${this.baseUrl}: ${err.message || "Ensure Ollama daemon is running."}`,
      };
    }
  }

  async getModelInfo(): Promise<EmbeddingModelInfo> {
    const health = await this.checkHealth();

    return {
      provider: "ollama",
      modelName: this.modelName,
      dimension: 768,
      isConfigured: health.isConnected && health.isModelAvailable,
      requiresKey: false,
      baseUrl: this.baseUrl,
      description: `Local Ollama embedding provider (${this.modelName} at ${this.baseUrl})`,
    };
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    const startTime = performance.now();
    const cleanText = text?.trim();
    if (!cleanText) {
      throw new Error("Cannot generate embedding for empty text.");
    }

    try {
      const endpoint = `${this.baseUrl.replace(/\/+$/, "")}/api/embeddings`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt: cleanText,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(
          `Ollama returned HTTP ${response.status}: ${errText || "Embedding extraction failed"}`
        );
      }

      const data = await response.json();
      const vector = data?.embedding;
      if (!vector || !Array.isArray(vector) || vector.length === 0) {
        throw new Error("Ollama returned an empty or invalid embedding vector.");
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
        throw new Error(`Ollama embedding request timed out at ${this.baseUrl}`);
      }
      throw new Error(
        `Ollama embedding service unavailable (${this.baseUrl}, model: ${this.modelName}): ${error.message || "Ensure Ollama is running"}`
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

export const defaultOllamaProvider = new OllamaEmbeddingProvider();

