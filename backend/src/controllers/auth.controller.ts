import { Request, Response } from "express";
import { prisma } from "../db/prisma";

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, fullName, role, organizationName, organizationWebsite, jobTitle } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userRole = ["student", "recruiter", "admin"].includes(role) ? role : "student";

    const existing = await prisma.profile.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const profile = await prisma.profile.create({
      data: {
        email: normalizedEmail,
        fullName: fullName || normalizedEmail.split("@")[0],
        role: userRole,
      },
    });

    if (userRole === "student") {
      await prisma.studentProfile.create({
        data: {
          id: profile.id,
          profileCompletionPct: 15,
        },
      });

      // Default initial preference
      await prisma.studentPreference.create({
        data: {
          studentId: profile.id,
          opportunityTypes: JSON.stringify(["job", "internship"]),
          workMode: "any",
          minMatchThreshold: 92,
          emailNotificationsEnabled: true,
        },
      });
    } else if (userRole === "recruiter") {
      await prisma.recruiterProfile.create({
        data: {
          id: profile.id,
          organizationName: organizationName || "Company",
          organizationWebsite: organizationWebsite || "",
          jobTitle: jobTitle || "Talent Lead",
          status: "pending", // Requires admin approval per PRD §4.1
        },
      });
    }

    const userWithDetails = await prisma.profile.findUnique({
      where: { id: profile.id },
      include: {
        studentProfile: { include: { preferences: true } },
        recruiterProfile: true,
      },
    });

    return res.status(201).json({ user: userWithDetails });
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message || "Failed to create account" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const profile = await prisma.profile.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: { include: { preferences: true } },
        recruiterProfile: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    return res.json({ user: profile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers["x-user-id"] as string);

    const availableUsers = await prisma.profile.findMany({
      include: {
        studentProfile: true,
        recruiterProfile: true,
      },
      orderBy: { createdAt: "desc" },
    });

    let currentUser = null;
    if (userId) {
      currentUser = availableUsers.find((u) => u.id === userId) || null;
    }

    if (!currentUser && availableUsers.length > 0) {
      currentUser = availableUsers[0];
    }

    return res.json({
      currentUser,
      availableUsers,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
