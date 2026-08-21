import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { matchingService } from "../services/matching.service";

export const getStudentMatches = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        educations: true,
        studentSkills: { include: { skill: true } },
        experiences: true,
        projects: true,
        certifications: true,
        courses: true,
        communityWork: true,
        leadership: true,
        achievements: true,
        preferences: true,
      },
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get all published opportunities
    const publishedOpportunities = await prisma.opportunity.findMany({
      where: { status: "published" },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
        recruiter: { include: { profile: true } },
      },
      orderBy: { applicationDeadline: "asc" },
    });

    // Evaluate matches for any newly published opportunity
    for (const opp of publishedOpportunities) {
      const matchResult = await matchingService.calculateMatchScore(student, opp);

      await prisma.match.upsert({
        where: {
          studentId_opportunityId: {
            studentId: student.id,
            opportunityId: opp.id,
          },
        },
        create: {
          studentId: student.id,
          opportunityId: opp.id,
          eligibilityStatus: matchResult.eligibility.status,
          semanticScore: matchResult.semanticScore,
          skillScore: matchResult.skillScore,
          educationScore: matchResult.educationScore,
          experienceScore: matchResult.experienceScore,
          finalScore: matchResult.finalScore,
          matchingModel: "ollama-nomic-embed-text",
          explanation: JSON.stringify(matchResult.explanation),
        },
        update: {
          eligibilityStatus: matchResult.eligibility.status,
          semanticScore: matchResult.semanticScore,
          skillScore: matchResult.skillScore,
          educationScore: matchResult.educationScore,
          experienceScore: matchResult.experienceScore,
          finalScore: matchResult.finalScore,
          explanation: JSON.stringify(matchResult.explanation),
        },
      });
    }

    // Fetch all student matches
    const matches = await prisma.match.findMany({
      where: { studentId },
      include: {
        opportunity: {
          include: {
            requirements: true,
            skills: { include: { skill: true } },
            recruiter: { include: { profile: true } },
          },
        },
      },
      orderBy: { finalScore: "desc" },
    });

    const formatted = matches.map((m) => ({
      ...m,
      explanation: m.explanation ? JSON.parse(m.explanation) : null,
    }));

    return res.json({ matches: formatted });
  } catch (err: any) {
    console.error("Get student matches error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const getMatchExplanation = async (req: Request, res: Response) => {
  try {
    const { studentId, opportunityId } = req.params;

    const match = await prisma.match.findUnique({
      where: {
        studentId_opportunityId: {
          studentId,
          opportunityId,
        },
      },
      include: {
        opportunity: {
          include: {
            requirements: true,
            skills: { include: { skill: true } },
          },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }

    return res.json({
      match: {
        ...match,
        explanation: match.explanation ? JSON.parse(match.explanation) : null,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
