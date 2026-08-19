import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeSemanticSimilarity } from "@/lib/matching/semantic";
import { computeMatchScore, DEFAULT_SCORING_WEIGHTS, DEFAULT_NOTIFICATION_THRESHOLD } from "@/lib/matching/scoring";
import { getAllProvidersInfo } from "@/lib/ai/embeddings";
import { ModelExperimentResultItem } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providersOnly = searchParams.get("providersOnly");

    if (providersOnly === "true") {
      const providers = await getAllProvidersInfo();
      return NextResponse.json(providers);
    }

    // List past experiments with results
    const experiments = await prisma.experiment.findMany({
      include: {
        results: {
          include: {
            studentProfile: { include: { user: true } },
            opportunity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(experiments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      studentId,
      opportunityId,
      providers = ["gemini", "qwen", "ollama"],
      saveExperiment = true,
    } = body;

    if (!studentId || !opportunityId) {
      return NextResponse.json(
        { error: "Please select both a Student and an Opportunity." },
        { status: 400 }
      );
    }

    // Fetch full student & opportunity records
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        educations: true,
        experiences: true,
        skills: true,
        certifications: true,
        projects: true,
        communityWork: true,
        achievements: true,
        languages: true,
      },
    });

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        skills: true,
        requirements: true,
      },
    });

    if (!student || !opportunity) {
      return NextResponse.json({ error: "Student or Opportunity not found." }, { status: 404 });
    }

    // Fetch active scoring weights
    const scoringConfig = await prisma.scoringConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    const weights = scoringConfig
      ? {
          semanticWeight: scoringConfig.semanticWeight,
          skillWeight: scoringConfig.skillWeight,
          experienceWeight: scoringConfig.experienceWeight,
          educationWeight: scoringConfig.educationWeight,
          completenessWeight: scoringConfig.completenessWeight,
          otherWeight: scoringConfig.otherWeight,
        }
      : DEFAULT_SCORING_WEIGHTS;

    const threshold = scoringConfig?.notificationThreshold ?? DEFAULT_NOTIFICATION_THRESHOLD;

    // Run experiment across each requested provider
    const experimentResults: ModelExperimentResultItem[] = [];

    for (const p of providers) {
      const startTime = performance.now();
      try {
        const semanticRes = await computeSemanticSimilarity(
          student as any,
          opportunity as any,
          p
        );

        const scoreRes = computeMatchScore(
          student as any,
          opportunity as any,
          semanticRes.similarityScore,
          weights,
          threshold
        );

        const latency = Math.round(performance.now() - startTime);

        experimentResults.push({
          provider: p.toUpperCase(),
          modelName: semanticRes.modelName,
          hardEligibility: scoreRes.hardEligibility.status,
          semanticScore: semanticRes.similarityScore,
          overallScore: scoreRes.overallScore,
          latencyMs: semanticRes.latencyMs || latency,
          dimension: semanticRes.dimension,
          topKRank: 1,
          status: semanticRes.isMock ? "mock" : "success",
          explanation: scoreRes.explanation,
        });
      } catch (err: any) {
        experimentResults.push({
          provider: p.toUpperCase(),
          modelName: p === "gemini" ? "text-embedding-004" : p === "qwen" ? "text-embedding-v3" : "nomic-embed-text",
          hardEligibility: "FAIL",
          semanticScore: 0,
          overallScore: 0,
          latencyMs: Math.round(performance.now() - startTime),
          dimension: 0,
          topKRank: 999,
          status: "error",
          errorMessage: err.message,
          explanation: {} as any,
        });
      }
    }

    // Save to DB if requested
    let savedExperiment = null;
    if (saveExperiment) {
      savedExperiment = await prisma.experiment.create({
        data: {
          name: name || `Comparison: ${student.user.name} vs ${opportunity.title}`,
          studentId: student.id,
          opportunityId: opportunity.id,
          providersJson: JSON.stringify(providers),
          status: "COMPLETED",
          results: {
            create: experimentResults.map((r) => ({
              studentId: student.id,
              opportunityId: opportunity.id,
              provider: r.provider,
              modelName: r.modelName,
              hardEligibility: r.hardEligibility,
              semanticScore: r.semanticScore,
              overallScore: r.overallScore,
              latencyMs: r.latencyMs,
              dimension: r.dimension,
              topKRank: r.topKRank,
              explanationJson: JSON.stringify(r.explanation),
            })),
          },
        },
        include: { results: true },
      });
    }

    return NextResponse.json({
      experiment: savedExperiment,
      student: { id: student.id, name: student.user.name, gpa: student.gpa, degree: student.degree },
      opportunity: { id: opportunity.id, title: opportunity.title, company: opportunity.company },
      results: experimentResults,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
