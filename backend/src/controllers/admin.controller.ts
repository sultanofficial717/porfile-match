import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { matchingService } from "../services/matching.service";
import { embeddingService } from "../services/embedding.service";

export const getRecruiterApprovalQueue = async (req: Request, res: Response) => {
  try {
    const recruiters = await prisma.recruiterProfile.findMany({
      where: { status: "pending" },
      include: { profile: true },
      orderBy: { profile: { createdAt: "desc" } },
    });

    return res.json({ recruiters });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateRecruiterStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminId } = req.body;

    if (!["approved", "rejected", "suspended", "pending"].includes(status)) {
      return res.status(400).json({ error: "Invalid recruiter status" });
    }

    const updated = await prisma.recruiterProfile.update({
      where: { id },
      data: {
        status,
        approvedBy: adminId || null,
        approvedAt: status === "approved" ? new Date() : null,
      },
      include: { profile: true },
    });

    return res.json({ recruiter: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getOpportunityReviewQueue = async (req: Request, res: Response) => {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: { status: "submitted" },
      include: {
        recruiter: { include: { profile: true } },
        requirements: true,
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ opportunities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const reviewOpportunity = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminId } = req.body;

    if (!["published", "rejected", "draft", "closed", "expired"].includes(status)) {
      return res.status(400).json({ error: "Invalid opportunity status" });
    }

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        status,
        reviewedBy: adminId || null,
        reviewedAt: new Date(),
      },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
      },
    });

    // If published, trigger the matching engine automatically per architecture §3
    let matchStats = null;
    if (status === "published") {
      matchStats = await matchingService.runOpportunityMatching(id);
    }

    return res.json({
      opportunity: updated,
      matchStats,
    });
  } catch (err: any) {
    console.error("Review opportunity error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const listAllUsers = async (req: Request, res: Response) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: { profile: true, preferences: true, educations: true },
      orderBy: { updatedAt: "desc" },
    });

    const recruiters = await prisma.recruiterProfile.findMany({
      include: { profile: true, opportunities: true },
      orderBy: { status: "asc" },
    });

    return res.json({ students, recruiters });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getPlatformMetrics = async (req: Request, res: Response) => {
  try {
    const [
      totalStudents,
      totalRecruiters,
      allOpportunities,
      totalMatches,
      totalEmails,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.recruiterProfile.count(),
      prisma.opportunity.findMany({
        select: { id: true, type: true, status: true, matches: { select: { id: true } } },
      }),
      prisma.match.count({ where: { eligibilityStatus: "pass" } }),
      prisma.emailLog.count(),
    ]);

    const publishedOpps = allOpportunities.filter((o) => o.status === "published");
    const oppsWithType = {
      jobs: allOpportunities.filter((o) => o.type === "job").length,
      internships: allOpportunities.filter((o) => o.type === "internship").length,
      scholarships: allOpportunities.filter((o) => o.type === "scholarship").length,
      fellowships: allOpportunities.filter((o) => o.type === "fellowship").length,
    };

    const oppsWithMatches = publishedOpps.filter((o) => o.matches.length > 0).length;
    const matchRate = publishedOpps.length > 0 ? Math.round((oppsWithMatches / publishedOpps.length) * 100) : 0;

    const ollamaHealth = await embeddingService.checkHealth();

    return res.json({
      metrics: {
        totalStudents,
        totalRecruiters,
        totalOpportunities: allOpportunities.length,
        publishedOpportunities: publishedOpps.length,
        opportunitiesByType: oppsWithType,
        matchesGenerated: totalMatches,
        emailsSent: totalEmails,
        matchRatePercentage: matchRate,
      },
      ollamaHealth,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
