import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const listOpportunities = async (req: Request, res: Response) => {
  try {
    const { type, location, remote, search, status } = req.query;

    const whereClause: any = {};

    if (status) {
      whereClause.status = status as string;
    } else {
      whereClause.status = "published";
    }

    if (type && type !== "all") {
      whereClause.type = (type as string).toLowerCase();
    }

    if (remote === "true") {
      whereClause.isRemote = true;
    }

    if (location) {
      whereClause.location = { contains: location as string };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search as string } },
        { organization: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        requirements: true,
        skills: { include: { skill: true } },
        recruiter: { include: { profile: true } },
      },
      orderBy: { applicationDeadline: "asc" },
    });

    return res.json({ opportunities });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
        recruiter: { include: { profile: true } },
        matches: {
          where: { eligibilityStatus: "pass" },
          include: { student: { include: { profile: true } } },
        },
      },
    });

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    return res.json({ opportunity });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
