import { OllamaEmbeddingProvider, defaultOllamaProvider, OllamaHealthStatus } from "./ollama";
import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export * from "./types";
export * from "./ollama";

export function getEmbeddingProvider(
  provider: string = "ollama",
  options?: {
    modelName?: string;
    baseUrl?: string;
  }
): IEmbeddingProvider {
  return new OllamaEmbeddingProvider(options?.modelName, options?.baseUrl);
}

export async function getOllamaStatus(): Promise<OllamaHealthStatus> {
  return defaultOllamaProvider.checkHealth();
}

export async function getAllProvidersInfo(): Promise<EmbeddingModelInfo[]> {
  const modelInfo = await defaultOllamaProvider.getModelInfo();
  return [modelInfo];
}



/**
 * Robust cosine similarity calculation between two vectors of matching dimension.
 * Returns value between 0.0 and 1.0 (or -1.0 to 1.0 clamped).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) {
    // If dimensions differ (e.g. comparing two different models), cannot compute directly
    return 0;
  }

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
  // Normalize cosine similarity from [-1, 1] into [0, 1] range for intuitive match percentages
  const normalized = Math.max(0, Math.min(1, (similarity + 1) / 2));
  return normalized;
}

/**
 * Standard cosine similarity in [0, 1] mapped to percentage (0 - 100).
 */
export function cosineSimilarityToPercentage(vecA: number[], vecB: number[]): number {
  const sim = cosineSimilarity(vecA, vecB);
  return Number((sim * 100).toFixed(1));
}
