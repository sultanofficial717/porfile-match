import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getOllamaStatus } from "@/lib/ai/embeddings";

export async function GET() {
  try {
    const [
      totalStudents,
      totalRecruiters,
      totalOpportunities,
      verifiedOpportunities,
      pendingOpportunities,
      totalMatches,
      matchesAboveThreshold,
      notificationsGenerated,
      pendingNotifications,
      recruiterFeedbackCount,
      allMatches,
      opportunitiesGrouped,
      recentFeedbacks,
      ollamaStatus,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.recruiterProfile.count(),
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { verificationStatus: "Verified" } }),
      prisma.opportunity.count({ where: { verificationStatus: "Pending" } }),
      prisma.match.count(),
      prisma.match.count({ where: { overallScore: { gte: 92.0 } } }),
      prisma.notification.count(),
      prisma.notification.count({ where: { status: "PENDING" } }),
      prisma.modelEvaluationFeedback.count(),
      prisma.match.findMany({
        select: {
          overallScore: true,
          semanticScore: true,
          modelProvider: true,
          createdAt: true,
        },
      }),
      prisma.opportunity.groupBy({
        by: ["type"],
        _count: { id: true },
      }),
      prisma.modelEvaluationFeedback.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          studentProfile: { include: { user: true } },
          opportunity: true,
          createdBy: true,
        },
      }),
      getOllamaStatus().catch((err) => ({
        isConnected: false,
        model: process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
        isModelAvailable: false,
        availableModels: [],
        statusText: "DISCONNECTED" as const,
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        error: err.message,
      })),
    ]);

    const avgScore =
      allMatches.length > 0
        ? Number((allMatches.reduce((acc, m) => acc + m.overallScore, 0) / allMatches.length).toFixed(1))
        : 0;

    // Score distribution buckets: <60, 60-75, 75-85, 85-92, 92-100
    const distribution = [
      { range: "0-59% (Low)", count: allMatches.filter((m) => m.overallScore < 60).length },
      { range: "60-74% (Moderate)", count: allMatches.filter((m) => m.overallScore >= 60 && m.overallScore < 75).length },
      { range: "75-84% (Good)", count: allMatches.filter((m) => m.overallScore >= 75 && m.overallScore < 85).length },
      { range: "85-91% (High)", count: allMatches.filter((m) => m.overallScore >= 85 && m.overallScore < 92).length },
      { range: "92-100% (Top Match)", count: allMatches.filter((m) => m.overallScore >= 92).length },
    ];

    const categoryData = opportunitiesGrouped.map((g) => ({
      name: g.type,
      count: g._count.id,
    }));

    return NextResponse.json({
      totalStudents,
      totalRecruiters,
      totalOpportunities,
      verifiedOpportunities,
      pendingOpportunities,
      totalMatches,
      matchesAboveThreshold,
      highQualityMatches: matchesAboveThreshold,
      notificationsGenerated,
      pendingNotifications,
      recruiterFeedbackCount,
      recentFeedbacks,
      avgScore,
      distribution,
      categories: categoryData,
      ollamaStatus,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

