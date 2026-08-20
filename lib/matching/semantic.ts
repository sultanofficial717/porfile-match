import { prisma } from "../db/prisma";
import { getEmbeddingProvider, cosineSimilarityToPercentage, OllamaEmbeddingProvider, EmbeddingResult } from "../ai/embeddings";
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
 * Gets or computes and stores Ollama embedding vector for a Student Profile.
 */
export async function getOrComputeStudentEmbedding(
  studentProfile: StudentProfileForDoc & { id: string },
  forceRegenerate: boolean = false
): Promise<{ vector: number[]; modelName: string; dimension: number }> {
  const provider = new OllamaEmbeddingProvider();
  const modelName = provider.getModel();
  const documentText = buildStudentMatchingDocument(studentProfile);

  if (!forceRegenerate) {
    const existing = await prisma.embedding.findUnique({
      where: {
        entityType_entityId_provider_modelName: {
          entityType: "STUDENT",
          entityId: studentProfile.id,
          provider: "ollama",
          modelName,
        },
      },
    });

    if (existing && existing.embeddingVector) {
      try {
        const parsed = JSON.parse(existing.embeddingVector);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { vector: parsed, modelName, dimension: existing.dimension };
        }
      } catch (e) {
        // recompute if corrupted
      }
    }
  }

  // Embed with Ollama server-side
  const embedRes = await provider.embedText(documentText);

  // Store vector in DB
  await prisma.embedding.upsert({
    where: {
      entityType_entityId_provider_modelName: {
        entityType: "STUDENT",
        entityId: studentProfile.id,
        provider: "ollama",
        modelName,
      },
    },
    create: {
      entityType: "STUDENT",
      entityId: studentProfile.id,
      provider: "ollama",
      modelName,
      dimension: embedRes.dimension,
      version: "v1",
      embeddingVector: JSON.stringify(embedRes.embedding),
      documentText,
    },
    update: {
      dimension: embedRes.dimension,
      embeddingVector: JSON.stringify(embedRes.embedding),
      documentText,
      updatedAt: new Date(),
    },
  });

  return { vector: embedRes.embedding, modelName, dimension: embedRes.dimension };
}

/**
 * Gets or computes and stores Ollama embedding vector for an Opportunity.
 */
export async function getOrComputeOpportunityEmbedding(
  opportunity: OpportunityForDoc & { id: string },
  forceRegenerate: boolean = false
): Promise<{ vector: number[]; modelName: string; dimension: number }> {
  const provider = new OllamaEmbeddingProvider();
  const modelName = provider.getModel();
  const documentText = buildOpportunityMatchingDocument(opportunity);

  if (!forceRegenerate) {
    const existing = await prisma.embedding.findUnique({
      where: {
        entityType_entityId_provider_modelName: {
          entityType: "OPPORTUNITY",
          entityId: opportunity.id,
          provider: "ollama",
          modelName,
        },
      },
    });

    if (existing && existing.embeddingVector) {
      try {
        const parsed = JSON.parse(existing.embeddingVector);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { vector: parsed, modelName, dimension: existing.dimension };
        }
      } catch (e) {
        // recompute
      }
    }
  }

  // Embed with Ollama server-side
  const embedRes = await provider.embedText(documentText);

  // Store vector in DB
  await prisma.embedding.upsert({
    where: {
      entityType_entityId_provider_modelName: {
        entityType: "OPPORTUNITY",
        entityId: opportunity.id,
        provider: "ollama",
        modelName,
      },
    },
    create: {
      entityType: "OPPORTUNITY",
      entityId: opportunity.id,
      provider: "ollama",
      modelName,
      dimension: embedRes.dimension,
      version: "v1",
      embeddingVector: JSON.stringify(embedRes.embedding),
      documentText,
    },
    update: {
      dimension: embedRes.dimension,
      embeddingVector: JSON.stringify(embedRes.embedding),
      documentText,
      updatedAt: new Date(),
    },
  });

  return { vector: embedRes.embedding, modelName, dimension: embedRes.dimension };
}

/**
 * Computes semantic similarity between a student profile and an opportunity using Ollama embeddings only.
 * If Ollama is unavailable, throws an explicit error (NO fake mock fallback vectors).
 */
export async function computeSemanticSimilarity(
  studentProfile: StudentProfileForDoc & { id?: string },
  opportunity: OpportunityForDoc & { id?: string },
  providerName: string = "ollama",
  options?: {
    modelName?: string;
    baseUrl?: string;
  }
): Promise<SemanticMatchResult> {
  const provider = new OllamaEmbeddingProvider(options?.modelName, options?.baseUrl);
  const startTime = performance.now();

  let studentVec: number[];
  let oppVec: number[];
  let modelName = provider.getModel();
  let dimension = 768;

  // Use stored vector caching if id is available
  if (studentProfile.id) {
    const s = await getOrComputeStudentEmbedding(studentProfile as any);
    studentVec = s.vector;
    modelName = s.modelName;
    dimension = s.dimension;
  } else {
    const studentDoc = buildStudentMatchingDocument(studentProfile);
    const res = await provider.embedText(studentDoc);
    studentVec = res.embedding;
    dimension = res.dimension;
  }

  if (opportunity.id) {
    const o = await getOrComputeOpportunityEmbedding(opportunity as any);
    oppVec = o.vector;
  } else {
    const oppDoc = buildOpportunityMatchingDocument(opportunity);
    const res = await provider.embedText(oppDoc);
    oppVec = res.embedding;
  }

  const totalLatency = Math.round(performance.now() - startTime);
  const score = cosineSimilarityToPercentage(studentVec, oppVec);

  return {
    similarityScore: score,
    provider: "ollama",
    modelName,
    dimension,
    latencyMs: totalLatency,
    isMock: false,
    studentEmbedding: studentVec,
    opportunityEmbedding: oppVec,
  };
}

