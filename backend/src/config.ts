import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: process.env.DATABASE_URL || "file:./dev.db",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaEmbeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
  defaultMatchThreshold: parseInt(process.env.DEFAULT_MATCH_THRESHOLD || "92", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
};
