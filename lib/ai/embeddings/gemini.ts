import { GoogleGenerativeAI } from "@google/generative-ai";
import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export class GeminiEmbeddingProvider implements IEmbeddingProvider {
  readonly provider = "gemini" as const;
  readonly modelName: string;
  private apiKey: string | undefined;

  constructor(modelName?: string, apiKey?: string) {
    this.modelName = modelName || process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
  }

  async getModelInfo(): Promise<EmbeddingModelInfo> {
    const isConfigured = Boolean(this.apiKey && this.apiKey.trim().length > 0);
    return {
      provider: "gemini",
      modelName: this.modelName,
      dimension: 768,
      isConfigured,
      requiresKey: true,
      description: "Google Gemini Text Embedding (e.g. text-embedding-004, 768 dimensions)",
    };
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const startTime = performance.now();
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: this.modelName });
      const result = await model.embedContent(text);
      const vector = result.embedding.values;
      const latencyMs = Math.round(performance.now() - startTime);

      return {
        embedding: vector,
        dimension: vector.length,
        modelName: this.modelName,
        provider: "gemini",
        latencyMs,
        isMock: false,
      };
    } catch (error: any) {
      throw new Error(`Gemini Embedding error: ${error?.message || "Unknown error"}`);
    }
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      results.push(await this.embedText(text));
    }
    return results;
  }
}
