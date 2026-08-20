import { NextResponse } from "next/server";
import { defaultOllamaProvider } from "@/lib/ai/embeddings";

export async function GET() {
  try {
    const health = await defaultOllamaProvider.checkHealth();
    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      {
        isConnected: false,
        model: defaultOllamaProvider.getModel(),
        isModelAvailable: false,
        availableModels: [],
        statusText: "DISCONNECTED",
        baseUrl: defaultOllamaProvider.getBaseUrl(),
        error: error.message || "Ollama embedding service unavailable.",
      },
      { status: 503 }
    );
  }
}
