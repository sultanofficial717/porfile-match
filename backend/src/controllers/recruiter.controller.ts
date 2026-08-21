import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { profileService } from "../services/profile.service";
import { embeddingService } from "../services/embedding.service";

export const getRecruiterProfile = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.params.id;

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterId },
      include: {
        profile: true,
        opportunities: {
          include: {
            requirements: true,
            skills: { include: { skill: true } },
            matches: true,
          },
        },
      },
    });

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    return res.json({ recruiter });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const onboardRecruiter = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.params.id;
    const { organizationName, organizationWebsite, jobTitle } = req.body;

    const recruiter = await prisma.recruiterProfile.update({
      where: { id: recruiterId },
      data: {
        organizationName: organizationName || "Organization",
        organizationWebsite: organizationWebsite || "",
        jobTitle: jobTitle || "Recruiter",
      },
      include: { profile: true },
    });

    return res.json({ recruiter });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const createOpportunity = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.params.id;
    const {
      title,
      type,
      organization,
      description,
      responsibilities,
      location,
      isRemote,
      compensation,
      applicationDeadline,
      applicationUrl,
      applyInPlatform,
      submitForReview,
      requirements,
      requiredSkills,
      preferredSkills,
    } = req.body;

    if (!title || !type || !applicationDeadline) {
      return res.status(400).json({
        error: "Title, Type, and Application Deadline are mandatory fields.",
      });
    }

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { id: recruiterId },
    });

    const status = submitForReview ? "submitted" : "draft";

    const opportunity = await prisma.opportunity.create({
      data: {
        recruiterId: recruiter ? recruiterId : null,
        title,
        type: type.toLowerCase(),
        organization: organization || recruiter?.organizationName || "Company",
        description: description || "",
        responsibilities: responsibilities || "",
        location: location || "",
        isRemote: !!isRemote,
        compensation: compensation || "",
        applicationDeadline: new Date(applicationDeadline),
        applicationUrl: applicationUrl || "",
        applyInPlatform: !!applyInPlatform,
        status,
      },
    });

    // Create structured requirements block
    if (requirements) {
      await prisma.opportunityRequirement.create({
        data: {
          opportunityId: opportunity.id,
          minGpa: requirements.minGpa ? parseFloat(requirements.minGpa) : null,
          minGpaScale: requirements.minGpaScale ? parseFloat(requirements.minGpaScale) : 4.0,
          requiredDegrees: requirements.requiredDegrees ? (Array.isArray(requirements.requiredDegrees) ? JSON.stringify(requirements.requiredDegrees) : requirements.requiredDegrees) : null,
          minExperienceYears: requirements.minExperienceYears ? parseFloat(requirements.minExperienceYears) : 0,
          minAcademicYear: requirements.minAcademicYear ? parseInt(requirements.minAcademicYear, 10) : null,
        },
      });
    }

    // Connect required skills
    if (Array.isArray(requiredSkills)) {
      for (const sk of requiredSkills) {
        const skillName = typeof sk === "string" ? sk.trim() : sk.name?.trim();
        if (skillName) {
          const canonical = await prisma.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
          });
          await prisma.opportunitySkill.upsert({
            where: {
              opportunityId_skillId_requirementType: {
                opportunityId: opportunity.id,
                skillId: canonical.id,
                requirementType: "required",
              },
            },
            create: {
              opportunityId: opportunity.id,
              skillId: canonical.id,
              requirementType: "required",
            },
            update: {},
          });
        }
      }
    }

    // Connect preferred skills
    if (Array.isArray(preferredSkills)) {
      for (const sk of preferredSkills) {
        const skillName = typeof sk === "string" ? sk.trim() : sk.name?.trim();
        if (skillName) {
          const canonical = await prisma.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
          });
          await prisma.opportunitySkill.upsert({
            where: {
              opportunityId_skillId_requirementType: {
                opportunityId: opportunity.id,
                skillId: canonical.id,
                requirementType: "preferred",
              },
            },
            create: {
              opportunityId: opportunity.id,
              skillId: canonical.id,
              requirementType: "preferred",
            },
            update: {},
          });
        }
      }
    }

    // Fetch full opportunity with relations
    const fullOpp = await prisma.opportunity.findUnique({
      where: { id: opportunity.id },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
      },
    });

    // Compute embedding vector via Ollama
    try {
      const doc = profileService.buildOpportunityEmbeddingText(fullOpp);
      const vec = await embeddingService.embedText(doc);
      if (vec && vec.length > 0) {
        await prisma.opportunity.update({
          where: { id: opportunity.id },
          data: { opportunityEmbedding: JSON.stringify(vec) },
        });
      }
    } catch (e) {
      console.warn("Embedding computation deferred for opportunity:", e);
    }

    return res.status(201).json({ opportunity: fullOpp });
  } catch (err: any) {
    console.error("Create opportunity error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const listRecruiterOpportunities = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.params.id;

    const opportunities = await prisma.opportunity.findMany({
      where: { recruiterId },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
        matches: {
          where: { eligibilityStatus: "pass" },
          include: { student: { include: { profile: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ opportunities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getRecruiterMetrics = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.params.id;

    const opportunities = await prisma.opportunity.findMany({
      where: { recruiterId },
      include: { matches: { where: { eligibilityStatus: "pass" } } },
    });

    const activeCount = opportunities.filter((o) => o.status === "published").length;
    const pendingReviewCount = opportunities.filter((o) => o.status === "submitted").length;
    const totalMatches = opportunities.reduce((acc, o) => acc + o.matches.length, 0);

    return res.json({
      metrics: {
        activeCount,
        pendingReviewCount,
        totalMatches,
        totalPostings: opportunities.length,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
