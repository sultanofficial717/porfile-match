import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const getStudentNotifications = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;

    const emailLogs = await prisma.emailLog.findMany({
      where: { studentId },
      include: {
        opportunity: true,
      },
      orderBy: { sentAt: "desc" },
    });

    const strongMatches = await prisma.match.findMany({
      where: {
        studentId,
        eligibilityStatus: "pass",
        finalScore: { gte: 85 },
      },
      include: {
        opportunity: true,
      },
      orderBy: { finalScore: "desc" },
    });

    return res.json({
      emailLogs,
      notifications: strongMatches.map((m) => ({
        id: m.id,
        opportunityId: m.opportunityId,
        title: `Strong Match (${m.finalScore}%): ${m.opportunity.title}`,
        organization: m.opportunity.organization,
        type: m.opportunity.type,
        score: m.finalScore,
        createdAt: m.createdAt,
        deadline: m.opportunity.applicationDeadline,
      })),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const listAllEmailLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.emailLog.findMany({
      include: {
        student: { include: { profile: true } },
        opportunity: true,
      },
      orderBy: { sentAt: "desc" },
    });

    return res.json({ emailLogs: logs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
