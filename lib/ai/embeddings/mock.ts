import { IEmbeddingProvider, EmbeddingModelInfo, EmbeddingResult } from "./types";

export class MockEmbeddingProvider implements IEmbeddingProvider {
  readonly provider = "mock" as const;
  readonly modelName = "deterministic-semantic-v1";
  readonly dimension = 768;

  async getModelInfo(): Promise<EmbeddingModelInfo> {
    return {
      provider: "mock",
      modelName: this.modelName,
      dimension: this.dimension,
      isConfigured: true,
      requiresKey: false,
      description: "Deterministic semantic embedding generator for testing and demo offline mode",
    };
  }

  // Generate deterministic normalized high-dimensional semantic vector
  private generateVector(text: string): number[] {
    const vector = new Array(this.dimension).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const tokens = cleaned.split(/\s+/).filter(Boolean);

    // Semantic concept clusters to boost similarity for related terms
    const clusters: Record<string, number[]> = {
      ai_ml: [10, 11, 12, 13, 14, 15, 50, 51, 52],
      software_eng: [20, 21, 22, 23, 24, 25, 60, 61, 62],
      data_science: [30, 31, 32, 33, 34, 35, 70, 71, 72],
      cybersecurity: [40, 41, 42, 43, 44, 45, 80, 81, 82],
      frontend: [100, 101, 102, 103, 104, 105],
      cloud_devops: [120, 121, 122, 123, 124, 125],
    };

    const termToCluster: Record<string, string> = {
      python: "ai_ml",
      pytorch: "ai_ml",
      tensorflow: "ai_ml",
      machine: "ai_ml",
      learning: "ai_ml",
      deep: "ai_ml",
      nlp: "ai_ml",
      llm: "ai_ml",
      ai: "ai_ml",
      javascript: "frontend",
      typescript: "frontend",
      react: "frontend",
      nextjs: "frontend",
      html: "frontend",
      css: "frontend",
      tailwind: "frontend",
      node: "software_eng",
      java: "software_eng",
      golang: "software_eng",
      cplusplus: "software_eng",
      c: "software_eng",
      sql: "data_science",
      postgres: "data_science",
      database: "data_science",
      pandas: "data_science",
      analytics: "data_science",
      bi: "data_science",
      docker: "cloud_devops",
      kubernetes: "cloud_devops",
      aws: "cloud_devops",
      cloud: "cloud_devops",
      security: "cybersecurity",
      penetration: "cybersecurity",
      cryptography: "cybersecurity",
    };

    for (const token of tokens) {
      const clusterKey = termToCluster[token];
      if (clusterKey && clusters[clusterKey]) {
        for (const idx of clusters[clusterKey]) {
          vector[idx % this.dimension] += 3.0;
        }
      }

      // Hash token into indices
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const baseIdx = Math.abs(hash) % this.dimension;
      vector[baseIdx] += 1.5;
      vector[(baseIdx + 7) % this.dimension] += 0.8;
      vector[(baseIdx + 23) % this.dimension] += 0.4;
    }

    // Add baseline text length energy
    const lengthSeed = text.length % 100;
    vector[lengthSeed] += 0.2;

    // Normalize to unit sphere (L2 norm)
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1.0;
    return vector.map((v) => Number((v / norm).toFixed(6)));
  }

  async embedText(text: string): Promise<EmbeddingResult> {
    const startTime = performance.now();
    // Simulate slight natural latency (20-40ms)
    await new Promise((r) => setTimeout(r, 25));
    const vector = this.generateVector(text);
    const latencyMs = Math.round(performance.now() - startTime);

    return {
      embedding: vector,
      dimension: this.dimension,
      modelName: this.modelName,
      provider: "mock",
      latencyMs,
      isMock: true,
    };
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      results.push(await this.embedText(text));
    }
    return results;
  }
}
