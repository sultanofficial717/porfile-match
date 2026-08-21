import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { profileService } from "../services/profile.service";
import { embeddingService } from "../services/embedding.service";
import fs from "fs";
import path from "path";

const PROFILES_DATA_DIR = path.join(process.cwd(), "data", "profiles");

const saveProfileToFile = async (studentId: string, studentData: any) => {
  try {
    if (!fs.existsSync(PROFILES_DATA_DIR)) {
      fs.mkdirSync(PROFILES_DATA_DIR, { recursive: true });
    }
    const filePath = path.join(PROFILES_DATA_DIR, `${studentId}.json`);
    const filePayload = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      studentId,
      fullName: studentData.profile?.fullName || studentData.fullName || "",
      email: studentData.profile?.email || studentData.email || "",
      headline: studentData.headline || "",
      location: studentData.location || "",
      country: studentData.country || "",
      bio: studentData.bio || "",
      profileCompletionPct: studentData.profileCompletionPct || 0,
      educations: studentData.educations || [],
      skills: (studentData.studentSkills || []).map((sk: any) => ({
        name: sk.skill?.name || sk.skillId,
        level: sk.level,
        yearsExperience: sk.yearsExperience,
      })),
      experiences: studentData.experiences || [],
      projects: studentData.projects || [],
      certifications: studentData.certifications || [],
      courses: studentData.courses || [],
      preferences: studentData.preferences || null,
    };
    await fs.promises.writeFile(filePath, JSON.stringify(filePayload, null, 2), "utf-8");
  } catch (err) {
    console.warn(`Failed to write profile to file for student ${studentId}:`, err);
  }
};

export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;

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
      return res.status(404).json({ error: "Student profile not found" });
    }

    const completion = profileService.calculateCompletionPercentage(student);

    return res.json({
      student: {
        ...student,
        profileCompletionPct: completion,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const body = req.body;

    const existing = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: { profile: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // 1. Update Profile name
    if (body.fullName) {
      await prisma.profile.update({
        where: { id: studentId },
        data: { fullName: body.fullName },
      });
    }

    // 2. Update StudentProfile basics
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: {
        phone: body.phone !== undefined ? body.phone : existing.phone,
        location: body.location !== undefined ? body.location : existing.location,
        country: body.country !== undefined ? body.country : existing.country,
        headline: body.headline !== undefined ? body.headline : existing.headline,
        bio: body.bio !== undefined ? body.bio : existing.bio,
      },
    });

    // 3. Update Educations
    if (Array.isArray(body.educations)) {
      await prisma.education.deleteMany({ where: { studentId } });
      for (const edu of body.educations) {
        if (edu.institution) {
          await prisma.education.create({
            data: {
              studentId,
              institution: edu.institution,
              degree: edu.degree || null,
              fieldOfStudy: edu.fieldOfStudy || null,
              gpa: edu.gpa ? parseFloat(edu.gpa) : null,
              gpaScale: edu.gpaScale ? parseFloat(edu.gpaScale) : 4.0,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              graduationDate: edu.graduationDate ? new Date(edu.graduationDate) : null,
              isCurrent: !!edu.isCurrent,
            },
          });
        }
      }
    }

    // 4. Update Skills
    if (Array.isArray(body.skills)) {
      await prisma.studentSkill.deleteMany({ where: { studentId } });
      for (const item of body.skills) {
        const skillName = typeof item === "string" ? item.trim() : item.name?.trim();
        if (skillName) {
          const canonical = await prisma.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
          });

          await prisma.studentSkill.create({
            data: {
              studentId,
              skillId: canonical.id,
              level: item.level || "intermediate",
              yearsExperience: item.yearsExperience ? parseFloat(item.yearsExperience) : 1.0,
            },
          });
        }
      }
    }

    // 5. Update Experiences
    if (Array.isArray(body.experiences)) {
      await prisma.experience.deleteMany({ where: { studentId } });
      for (const exp of body.experiences) {
        if (exp.organization && exp.position) {
          await prisma.experience.create({
            data: {
              studentId,
              organization: exp.organization,
              position: exp.position,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              description: exp.description || null,
              achievements: exp.achievements ? JSON.stringify(exp.achievements) : null,
            },
          });
        }
      }
    }

    // 6. Update Projects
    if (Array.isArray(body.projects)) {
      await prisma.project.deleteMany({ where: { studentId } });
      for (const proj of body.projects) {
        if (proj.name) {
          await prisma.project.create({
            data: {
              studentId,
              name: proj.name,
              description: proj.description || null,
              technologies: proj.technologies ? (Array.isArray(proj.technologies) ? JSON.stringify(proj.technologies) : proj.technologies) : null,
              role: proj.role || null,
              projectUrl: proj.projectUrl || null,
              githubUrl: proj.githubUrl || null,
            },
          });
        }
      }
    }

    // 7. Update Certifications & Courses
    if (Array.isArray(body.certifications)) {
      await prisma.certification.deleteMany({ where: { studentId } });
      for (const cert of body.certifications) {
        if (cert.name) {
          await prisma.certification.create({
            data: {
              studentId,
              name: cert.name,
              issuer: cert.issuer || null,
              issuedDate: cert.issuedDate ? new Date(cert.issuedDate) : null,
              credentialId: cert.credentialId || null,
              credentialUrl: cert.credentialUrl || null,
            },
          });
        }
      }
    }

    if (Array.isArray(body.courses)) {
      await prisma.course.deleteMany({ where: { studentId } });
      for (const c of body.courses) {
        if (c.name) {
          await prisma.course.create({
            data: {
              studentId,
              name: c.name,
              provider: c.provider || null,
              completedDate: c.completedDate ? new Date(c.completedDate) : null,
              skillsLearned: c.skillsLearned ? (Array.isArray(c.skillsLearned) ? JSON.stringify(c.skillsLearned) : c.skillsLearned) : null,
            },
          });
        }
      }
    }

    // 8. Update Leadership & Community Work
    if (Array.isArray(body.leadership)) {
      await prisma.leadership.deleteMany({ where: { studentId } });
      for (const l of body.leadership) {
        if (l.title) {
          await prisma.leadership.create({
            data: {
              studentId,
              title: l.title,
              organization: l.organization || null,
              description: l.description || null,
            },
          });
        }
      }
    }

    if (Array.isArray(body.communityWork)) {
      await prisma.communityWork.deleteMany({ where: { studentId } });
      for (const cw of body.communityWork) {
        if (cw.organization || cw.role) {
          await prisma.communityWork.create({
            data: {
              studentId,
              organization: cw.organization || null,
              role: cw.role || null,
              duration: cw.duration || null,
              description: cw.description || null,
            },
          });
        }
      }
    }

    // 9. Update Preferences (if provided)
    if (body.preferences) {
      const p = body.preferences;
      await prisma.studentPreference.upsert({
        where: { studentId },
        create: {
          studentId,
          opportunityTypes: typeof p.opportunityTypes === "string" ? p.opportunityTypes : JSON.stringify(p.opportunityTypes || ["job", "internship"]),
          workMode: p.workMode || "any",
          preferredLocations: p.preferredLocations ? (typeof p.preferredLocations === "string" ? p.preferredLocations : JSON.stringify(p.preferredLocations)) : null,
          minMatchThreshold: p.minMatchThreshold ? parseInt(p.minMatchThreshold, 10) : 92,
          emailNotificationsEnabled: p.emailNotificationsEnabled !== undefined ? !!p.emailNotificationsEnabled : true,
          emailFrequency: p.emailFrequency || "immediate",
        },
        update: {
          opportunityTypes: typeof p.opportunityTypes === "string" ? p.opportunityTypes : JSON.stringify(p.opportunityTypes || ["job", "internship"]),
          workMode: p.workMode || "any",
          preferredLocations: p.preferredLocations ? (typeof p.preferredLocations === "string" ? p.preferredLocations : JSON.stringify(p.preferredLocations)) : null,
          minMatchThreshold: p.minMatchThreshold ? parseInt(p.minMatchThreshold, 10) : 92,
          emailNotificationsEnabled: p.emailNotificationsEnabled !== undefined ? !!p.emailNotificationsEnabled : true,
          emailFrequency: p.emailFrequency || "immediate",
        },
      });
    }

    // Refresh full student profile
    const updated = await prisma.studentProfile.findUnique({
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

    const completion = profileService.calculateCompletionPercentage(updated);
    await prisma.studentProfile.update({
      where: { id: studentId },
      data: { profileCompletionPct: completion },
    });

    // Recompute embedding vector via Ollama asynchronously
    try {
      const doc = profileService.buildStudentEmbeddingText(updated);
      const vec = await embeddingService.embedText(doc);
      if (vec && vec.length > 0) {
        await prisma.studentProfile.update({
          where: { id: studentId },
          data: { profileEmbedding: JSON.stringify(vec) },
        });
      }
    } catch (e) {
      console.warn("Async Ollama embedding update deferred:", e);
    }

    // Also persist student profile to file storage
    await saveProfileToFile(studentId, {
      ...updated,
      profileCompletionPct: completion,
    });

    return res.json({
      success: true,
      student: {
        ...updated,
        profileCompletionPct: completion,
      },
    });
  } catch (err: any) {
    console.error("Update student error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateStudentPreferences = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const { opportunityTypes, workMode, preferredLocations, minMatchThreshold, emailNotificationsEnabled } = req.body;

    const types = Array.isArray(opportunityTypes) ? opportunityTypes : ["job", "internship"];
    if (types.length === 0) {
      return res.status(400).json({ error: "At least one opportunity type is required." });
    }

    const pref = await prisma.studentPreference.upsert({
      where: { studentId },
      create: {
        studentId,
        opportunityTypes: JSON.stringify(types),
        workMode: workMode || "any",
        preferredLocations: preferredLocations ? (typeof preferredLocations === "string" ? preferredLocations : JSON.stringify(preferredLocations)) : null,
        minMatchThreshold: minMatchThreshold ? parseInt(minMatchThreshold, 10) : 92,
        emailNotificationsEnabled: emailNotificationsEnabled !== undefined ? !!emailNotificationsEnabled : true,
      },
      update: {
        opportunityTypes: JSON.stringify(types),
        workMode: workMode || "any",
        preferredLocations: preferredLocations ? (typeof preferredLocations === "string" ? preferredLocations : JSON.stringify(preferredLocations)) : null,
        minMatchThreshold: minMatchThreshold ? parseInt(minMatchThreshold, 10) : 92,
        emailNotificationsEnabled: emailNotificationsEnabled !== undefined ? !!emailNotificationsEnabled : true,
      },
    });

    return res.json({ preferences: pref });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

export const getStudentProfileFile = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.id;
    const filePath = path.join(PROFILES_DATA_DIR, `${studentId}.json`);

    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf-8");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="student_profile_${studentId}.json"`);
      return res.send(content);
    }

    // If file doesn't exist yet, generate from DB and write
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
      return res.status(404).json({ error: "Student profile not found" });
    }

    await saveProfileToFile(studentId, student);
    const content = await fs.promises.readFile(filePath, "utf-8");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="student_profile_${studentId}.json"`);
    return res.send(content);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

