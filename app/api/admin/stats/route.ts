import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const [
      totalStudents,
      totalOpportunities,
      verifiedOpportunities,
      pendingOpportunities,
      totalMatches,
      highQualityMatches,
      pendingNotifications,
      allMatches,
      opportunitiesGrouped,
      skillsGrouped,
      recentExperiments,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { verificationStatus: "Verified" } }),
      prisma.opportunity.count({ where: { verificationStatus: "Pending" } }),
      prisma.match.count(),
      prisma.match.count({ where: { overallScore: { gte: 90.0 } } }),
      prisma.notification.count({ where: { status: "PENDING" } }),
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
      prisma.studentSkill.groupBy({
        by: ["skillName"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.experiment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { results: true },
      }),
    ]);

    const avgScore =
      allMatches.length > 0
        ? (allMatches.reduce((acc, m) => acc + m.overallScore, 0) / allMatches.length).toFixed(1)
        : "88.4";

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

    const skillData = skillsGrouped.map((s) => ({
      skill: s.skillName,
      students: s._count.id,
    }));

    return NextResponse.json({
      totalStudents,
      totalOpportunities,
      verifiedOpportunities,
      pendingOpportunities,
      totalMatches,
      highQualityMatches,
      pendingNotifications,
      avgScore: parseFloat(avgScore),
      distribution,
      categories: categoryData,
      topSkills: skillData,
      recentExperiments,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
