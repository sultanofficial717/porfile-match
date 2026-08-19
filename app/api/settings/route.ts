import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_SCORING_WEIGHTS, DEFAULT_NOTIFICATION_THRESHOLD } from "@/lib/matching/scoring";

export async function GET() {
  try {
    let config = await prisma.scoringConfig.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!config) {
      config = await prisma.scoringConfig.create({
        data: {
          name: "Default Weights",
          ...DEFAULT_SCORING_WEIGHTS,
          notificationThreshold: DEFAULT_NOTIFICATION_THRESHOLD,
          isActive: true,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name = "Custom Scoring Configuration",
      semanticWeight,
      skillWeight,
      experienceWeight,
      educationWeight,
      completenessWeight,
      otherWeight,
      notificationThreshold,
    } = body;

    // Validate weights sum approximately to 1.0
    const sum =
      (parseFloat(semanticWeight) || 0) +
      (parseFloat(skillWeight) || 0) +
      (parseFloat(experienceWeight) || 0) +
      (parseFloat(educationWeight) || 0) +
      (parseFloat(completenessWeight) || 0) +
      (parseFloat(otherWeight) || 0);

    if (Math.abs(sum - 1.0) > 0.05) {
      return NextResponse.json(
        { error: `Scoring weights must sum to 1.0 (100%). Current sum: ${(sum * 100).toFixed(0)}%` },
        { status: 400 }
      );
    }

    // Deactivate previous configs
    await prisma.scoringConfig.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const newConfig = await prisma.scoringConfig.create({
      data: {
        name,
        semanticWeight: parseFloat(semanticWeight),
        skillWeight: parseFloat(skillWeight),
        experienceWeight: parseFloat(experienceWeight),
        educationWeight: parseFloat(educationWeight),
        completenessWeight: parseFloat(completenessWeight),
        otherWeight: parseFloat(otherWeight),
        notificationThreshold: parseFloat(notificationThreshold) || DEFAULT_NOTIFICATION_THRESHOLD,
        isActive: true,
      },
    });

    return NextResponse.json(newConfig);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
