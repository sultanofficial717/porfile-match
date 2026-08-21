import { Request, Response } from "express";
import { embeddingService } from "../services/embedding.service";

export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    const ollama = await embeddingService.checkHealth();
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      ollama,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
