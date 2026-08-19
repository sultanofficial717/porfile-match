import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateProfileCompleteness } from "@/lib/matching/scoring";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: true,
        skills: true,
        educations: true,
        experiences: true,
        projects: true,
        certifications: true,
        courses: true,
        communityWork: true,
        achievements: true,
        languages: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      bio,
      location,
      gpa,
      university,
      degree,
      graduationYear,
      yearsExperience,
      workAuthorization,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      skills,
      educations,
      experiences,
      projects,
      certifications,
      communityWork,
      achievements,
      languages,
    } = body;

    // 1. Update Student Profile scalar fields
    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: {
        bio,
        location,
        gpa: gpa !== undefined ? parseFloat(gpa) || null : undefined,
        university,
        degree,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        yearsExperience: yearsExperience !== undefined ? parseFloat(yearsExperience) || 0 : undefined,
        workAuthorization,
        portfolioUrl,
        githubUrl,
        linkedinUrl,
      },
      include: { user: true },
    });

    // Update User's Name if provided
    if (name && updatedProfile.userId) {
      await prisma.user.update({
        where: { id: updatedProfile.userId },
        data: { name },
      });
    }

    // 2. Sync Skills if provided
    if (Array.isArray(skills)) {
      await prisma.studentSkill.deleteMany({ where: { studentProfileId: id } });
      for (const sk of skills) {
        if (sk.skillName && sk.skillName.trim()) {
          await prisma.studentSkill.create({
            data: {
              studentProfileId: id,
              skillName: sk.skillName.trim(),
              level: sk.level || "Intermediate",
              yearsExperience: parseFloat(sk.yearsExperience) || 1.0,
            },
          });
        }
      }
    }

    // 3. Sync Educations if provided
    if (Array.isArray(educations)) {
      await prisma.education.deleteMany({ where: { studentProfileId: id } });
      for (const edu of educations) {
        if (edu.institution && edu.degree) {
          await prisma.education.create({
            data: {
              studentProfileId: id,
              institution: edu.institution,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || "",
              gpa: edu.gpa ? parseFloat(edu.gpa) : null,
              startYear: parseInt(edu.startYear, 10) || 2021,
              endYear: edu.endYear ? parseInt(edu.endYear, 10) : null,
              isCurrent: Boolean(edu.isCurrent),
              courses: edu.courses || null,
              honors: edu.honors || null,
            },
          });
        }
      }
    }

    // 4. Sync Experiences if provided
    if (Array.isArray(experiences)) {
      await prisma.experience.deleteMany({ where: { studentProfileId: id } });
      for (const exp of experiences) {
        if (exp.title && exp.company) {
          await prisma.experience.create({
            data: {
              studentProfileId: id,
              title: exp.title,
              company: exp.company,
              location: exp.location || null,
              type: exp.type || "Full-time",
              startDate: exp.startDate || "2023-01",
              endDate: exp.endDate || null,
              isCurrent: Boolean(exp.isCurrent),
              description: exp.description || null,
              years: parseFloat(exp.years) || 0,
              months: parseInt(exp.months, 10) || 0,
            },
          });
        }
      }
    }

    // 5. Sync Projects if provided
    if (Array.isArray(projects)) {
      await prisma.project.deleteMany({ where: { studentProfileId: id } });
      for (const p of projects) {
        if (p.title) {
          await prisma.project.create({
            data: {
              studentProfileId: id,
              title: p.title,
              description: p.description || "",
              technologies: p.technologies || "",
            },
          });
        }
      }
    }

    // 6. Sync Certifications if provided
    if (Array.isArray(certifications)) {
      await prisma.certification.deleteMany({ where: { studentProfileId: id } });
      for (const c of certifications) {
        if (c.name) {
          await prisma.certification.create({
            data: {
              studentProfileId: id,
              name: c.name,
              issuer: c.issuer || "Online Platform",
            },
          });
        }
      }
    }

    // 7. Sync Community Work
    if (Array.isArray(communityWork)) {
      await prisma.communityWork.deleteMany({ where: { studentProfileId: id } });
      for (const cw of communityWork) {
        if (cw.title) {
          await prisma.communityWork.create({
            data: {
              studentProfileId: id,
              title: cw.title,
              organization: cw.organization || "",
              description: cw.description || "",
            },
          });
        }
      }
    }

    // 8. Sync Achievements
    if (Array.isArray(achievements)) {
      await prisma.achievement.deleteMany({ where: { studentProfileId: id } });
      for (const a of achievements) {
        if (a.title) {
          await prisma.achievement.create({
            data: {
              studentProfileId: id,
              title: a.title,
              type: a.type || "Award",
              issuer: a.issuer || "",
              date: a.date || "",
            },
          });
        }
      }
    }

    // 9. Sync Languages
    if (Array.isArray(languages)) {
      await prisma.language.deleteMany({ where: { studentProfileId: id } });
      for (const l of languages) {
        if (l.language) {
          await prisma.language.create({
            data: {
              studentProfileId: id,
              language: l.language,
              proficiency: l.proficiency || "Professional",
            },
          });
        }
      }
    }

    // Recalculate Profile Completeness
    const refreshed = await prisma.studentProfile.findUnique({
      where: { id },
      include: {
        skills: true,
        educations: true,
        experiences: true,
        projects: true,
        certifications: true,
        communityWork: true,
        achievements: true,
        languages: true,
        user: true,
      },
    });

    const completeness = calculateProfileCompleteness(refreshed as any);
    const finalProfile = await prisma.studentProfile.update({
      where: { id },
      data: { profileCompleteness: completeness },
      include: {
        skills: true,
        educations: true,
        experiences: true,
        projects: true,
        certifications: true,
        communityWork: true,
        achievements: true,
        languages: true,
        user: true,
      },
    });

    return NextResponse.json(finalProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
