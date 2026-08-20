import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateProfileCompleteness } from "@/lib/matching/scoring";
import { getOrComputeStudentEmbedding } from "@/lib/matching/semantic";

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
        leaderships: true,
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
      avatar,
      phone,
      country = "Pakistan",
      bio,
      location,
      gpa,
      university,
      degree,
      graduationYear,
      yearsExperience,
      workAuthorization = "Pakistan",
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      otherUrl,
      skills,
      educations,
      experiences,
      projects,
      certifications,
      courses,
      communityWork,
      achievements,
      leaderships,
      languages,
    } = body;

    // 1. Update Student Profile scalar fields
    const updatedProfile = await prisma.studentProfile.update({
      where: { id },
      data: {
        phone: phone || null,
        country: country || "Pakistan",
        bio: bio || null,
        location: location || null,
        gpa: gpa !== undefined && gpa !== "" && gpa !== null ? parseFloat(gpa) : null,
        university: university || null,
        degree: degree || null,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
        yearsExperience: yearsExperience !== undefined && yearsExperience !== "" ? parseFloat(yearsExperience) || 0 : 0,
        workAuthorization: workAuthorization || "Pakistan",
        portfolioUrl: portfolioUrl || null,
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        otherUrl: otherUrl || null,
      },
      include: { user: true },
    });

    // Update User Name / Avatar if provided
    if ((name || avatar) && updatedProfile.userId) {
      await prisma.user.update({
        where: { id: updatedProfile.userId },
        data: {
          ...(name ? { name } : {}),
          ...(avatar ? { avatar } : {}),
        },
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
              category: sk.category || "Technical",
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
              gpa: edu.gpa !== undefined && edu.gpa !== "" && edu.gpa !== null ? parseFloat(edu.gpa) : null,
              gpaScale: edu.gpaScale ? parseFloat(edu.gpaScale) : 4.0,
              startYear: parseInt(edu.startYear, 10) || 2021,
              endYear: edu.endYear ? parseInt(edu.endYear, 10) : null,
              startDate: edu.startDate || null,
              endDate: edu.endDate || null,
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
              skillsUsed: exp.skillsUsed || null,
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
              role: p.role || null,
              url: p.url || null,
              githubUrl: p.githubUrl || null,
              technologies: p.technologies || "",
              startDate: p.startDate || null,
              endDate: p.endDate || null,
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
              issueDate: c.issueDate || null,
              expiryDate: c.expiryDate || null,
              credentialId: c.credentialId || null,
              credentialUrl: c.credentialUrl || null,
            },
          });
        }
      }
    }

    // 7. Sync Courses if provided
    if (Array.isArray(courses)) {
      await prisma.course.deleteMany({ where: { studentProfileId: id } });
      for (const cs of courses) {
        if (cs.title) {
          await prisma.course.create({
            data: {
              studentProfileId: id,
              title: cs.title,
              institution: cs.institution || "Online",
              completionDate: cs.completionDate || null,
              description: cs.description || null,
              skillsLearned: cs.skillsLearned || null,
            },
          });
        }
      }
    }

    // 8. Sync Community Work
    if (Array.isArray(communityWork)) {
      await prisma.communityWork.deleteMany({ where: { studentProfileId: id } });
      for (const cw of communityWork) {
        if (cw.title) {
          await prisma.communityWork.create({
            data: {
              studentProfileId: id,
              title: cw.title,
              organization: cw.organization || "",
              role: cw.role || null,
              description: cw.description || "",
              startDate: cw.startDate || null,
              endDate: cw.endDate || null,
            },
          });
        }
      }
    }

    // 9. Sync Achievements
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
              description: a.description || null,
            },
          });
        }
      }
    }

    // 10. Sync Leaderships
    if (Array.isArray(leaderships)) {
      await prisma.leadership.deleteMany({ where: { studentProfileId: id } });
      for (const l of leaderships) {
        if (l.organization && l.position) {
          await prisma.leadership.create({
            data: {
              studentProfileId: id,
              organization: l.organization,
              position: l.position,
              description: l.description || null,
              duration: l.duration || null,
            },
          });
        }
      }
    }

    // 11. Sync Languages
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
        courses: true,
        communityWork: true,
        achievements: true,
        leaderships: true,
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
        courses: true,
        communityWork: true,
        achievements: true,
        leaderships: true,
        languages: true,
        user: true,
      },
    });

    // Try to update Ollama embedding in the background if Ollama is running
    try {
      await getOrComputeStudentEmbedding(finalProfile as any, true);
    } catch (embErr) {
      console.warn("Could not generate Ollama embedding for student immediately:", (embErr as any)?.message);
    }

    return NextResponse.json(finalProfile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

