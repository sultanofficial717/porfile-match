import { getEmbeddingProvider, cosineSimilarityToPercentage, IEmbeddingProvider, EmbeddingResult } from "../ai/embeddings";
import { buildStudentMatchingDocument, buildOpportunityMatchingDocument, StudentProfileForDoc, OpportunityForDoc } from "./document";

export interface SemanticMatchResult {
  similarityScore: number; // 0 - 100
  provider: string;
  modelName: string;
  dimension: number;
  latencyMs: number;
  isMock: boolean;
  studentEmbedding: number[];
  opportunityEmbedding: number[];
}

/**
 * Computes semantic similarity between a student profile and an opportunity using specified embedding provider.
 */
export async function computeSemanticSimilarity(
  studentProfile: StudentProfileForDoc,
  opportunity: OpportunityForDoc,
  providerName: string = "gemini",
  options?: {
    modelName?: string;
    apiKey?: string;
    baseUrl?: string;
  }
): Promise<SemanticMatchResult> {
  let provider = getEmbeddingProvider(providerName, options);

  const studentDoc = buildStudentMatchingDocument(studentProfile);
  const opportunityDoc = buildOpportunityMatchingDocument(opportunity);

  let studentRes: EmbeddingResult;
  let oppRes: EmbeddingResult;

  try {
    const startTime = performance.now();
    [studentRes, oppRes] = await Promise.all([
      provider.embedText(studentDoc),
      provider.embedText(opportunityDoc),
    ]);
    const totalLatency = Math.round(performance.now() - startTime);

    const score = cosineSimilarityToPercentage(studentRes.embedding, oppRes.embedding);

    return {
      similarityScore: score,
      provider: studentRes.provider,
      modelName: studentRes.modelName,
      dimension: studentRes.dimension,
      latencyMs: totalLatency,
      isMock: studentRes.isMock,
      studentEmbedding: studentRes.embedding,
      opportunityEmbedding: oppRes.embedding,
    };
  } catch (error: any) {
    // If external provider fails (e.g. invalid key or connection offline), fall back to Mock provider with warning
    console.warn(
      `Embedding provider '${providerName}' failed: ${error?.message}. Using fallback deterministic semantic provider.`
    );
    provider = getEmbeddingProvider("mock");
    const [mockStudent, mockOpp] = await Promise.all([
      provider.embedText(studentDoc),
      provider.embedText(opportunityDoc),
    ]);

    const score = cosineSimilarityToPercentage(mockStudent.embedding, mockOpp.embedding);

    return {
      similarityScore: score,
      provider: `${providerName} (Mock Fallback)`,
      modelName: mockStudent.modelName,
      dimension: mockStudent.dimension,
      latencyMs: mockStudent.latencyMs + mockOpp.latencyMs,
      isMock: true,
      studentEmbedding: mockStudent.embedding,
      opportunityEmbedding: mockOpp.embedding,
    };
  }
}
