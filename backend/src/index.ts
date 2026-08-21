import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config";
import apiRouter from "./routes";

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Root healthcheck
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Opportunity Discovery & Matching Platform API",
    version: "1.0.0",
    status: "running",
    apiPrefix: "/api",
  });
});

// Mount all API routes
app.use("/api", apiRouter);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled API Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start Server
app.listen(config.port, () => {
  console.log(`🚀 MatchAI Backend API Server running at http://localhost:${config.port}`);
  console.log(`📡 API Endpoints mounted at http://localhost:${config.port}/api`);
  console.log(`🤖 Connected to Ollama at ${config.ollamaBaseUrl} (Model: ${config.ollamaEmbeddingModel})`);
});
