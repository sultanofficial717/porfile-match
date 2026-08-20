import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const opportunityId = searchParams.get("opportunityId");
    const studentId = searchParams.get("studentId");

    const whereClause: any = {};
    if (opportunityId) whereClause.opportunityId = opportunityId;
    if (studentId) whereClause.studentId = studentId;

    const evaluations = await prisma.modelEvaluationFeedback.findMany({
      where: whereClause,
      include: {
        studentProfile: { include: { user: true } },
        opportunity: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evaluations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      opportunityId,
      modelProvider = "ollama",
      modelName = process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",
      score,
      recruiterDecision, // "STRONG_MATCH" | "GOOD_MATCH" | "WEAK_MATCH" | "WRONG_MATCH"
      feedbackReason,
      feedbackText,
      createdById,
    } = body;

    if (!studentId || !opportunityId || !recruiterDecision) {
      return NextResponse.json(
        { error: "Student, Opportunity, and Recruiter Decision are required." },
        { status: 400 }
      );
    }

    let targetUserId = createdById;
    if (!targetUserId) {
      const rec = await prisma.user.findFirst({ where: { role: "RECRUITER" } });
      targetUserId = rec?.id;
    }
    if (!targetUserId) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      targetUserId = admin?.id;
    }

    const evaluation = await prisma.modelEvaluationFeedback.create({
      data: {
        studentId,
        opportunityId,
        modelProvider,
        modelName,
        score: parseFloat(score) || 0,
        recruiterDecision,
        feedbackReason: feedbackReason || null,
        feedbackText: feedbackText || null,
        createdById: targetUserId!,
      },
      include: {
        studentProfile: { include: { user: true } },
        opportunity: true,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

