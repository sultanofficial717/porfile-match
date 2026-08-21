import { config } from "../config";

export interface OllamaHealthStatus {
  isConnected: boolean;
  model: string;
  baseUrl: string;
  isModelAvailable: boolean;
  statusText: "AVAILABLE" | "UNAVAILABLE";
  error?: string;
}

export class EmbeddingService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = config.ollamaBaseUrl.replace(/\/$/, "");
    this.model = config.ollamaEmbeddingModel;
  }

  async checkHealth(): Promise<OllamaHealthStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return {
          isConnected: false,
          model: this.model,
          baseUrl: this.baseUrl,
          isModelAvailable: false,
          statusText: "UNAVAILABLE",
          error: `HTTP ${res.status}: ${res.statusText}`,
        };
      }

      const data = (await res.json()) as { models?: Array<{ name: string }> };
      const modelNames = data.models?.map((m) => m.name) || [];
      const hasModel =
        modelNames.some((n) => n === this.model || n.startsWith(`${this.model}:`)) ||
        modelNames.length > 0;

      return {
        isConnected: true,
        model: this.model,
        baseUrl: this.baseUrl,
        isModelAvailable: hasModel,
        statusText: hasModel ? "AVAILABLE" : "UNAVAILABLE",
        error: hasModel
          ? undefined
          : `Model '${this.model}' not found in Ollama library. Run: 'ollama pull ${this.model}'`,
      };
    } catch (err: any) {
      return {
        isConnected: false,
        model: this.model,
        baseUrl: this.baseUrl,
        isModelAvailable: false,
        statusText: "UNAVAILABLE",
        error: `Ollama connection failed: ${err.message || "Service offline"}. Ensure Ollama is running at ${this.baseUrl}`,
      };
    }
  }

  async embedText(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return [];
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.model,
          prompt: text,
        }),
      });

      if (!res.ok) {
        throw new Error(
          `Ollama embedding service error: ${res.status} ${res.statusText}`
        );
      }

      const data = (await res.json()) as { embedding?: number[] };
      if (!data.embedding || !Array.isArray(data.embedding)) {
        throw new Error("Ollama returned invalid vector structure.");
      }

      return data.embedding;
    } catch (error: any) {
      throw new Error(
        `Ollama embedding service unavailable: ${error.message}. Please ensure Ollama is running at ${this.baseUrl} and model '${this.model}' is pulled.`
      );
    }
  }

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    if (vecA.length !== vecB.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;

    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    // Normalize cosine range [-1, 1] into [0, 1]
    return Math.max(0, Math.min(1, (similarity + 1) / 2));
  }

  cosineSimilarityToPercentage(vecA: number[], vecB: number[]): number {
    const sim = this.cosineSimilarity(vecA, vecB);
    return Number((sim * 100).toFixed(1));
  }
}

export const embeddingService = new EmbeddingService();
