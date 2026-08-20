import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const recruiterId = searchParams.get("recruiterId");
    const search = searchParams.get("search");

    const whereClause: any = {};
    if (status && status !== "ALL") {
      whereClause.verificationStatus = status;
    }
    if (type && type !== "ALL") {
      whereClause.type = type;
    }
    if (recruiterId) {
      whereClause.recruiterId = recruiterId;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { requiredSkills: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
            email: true,
            recruiterProfile: true,
          },
        },
        skills: true,
        requirements: true,
        _count: {
          select: {
            applications: true,
            matches: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      type,
      company,
      location,
      country = "Pakistan",
      workplaceType,
      minGpa,
      gpaScale = 4.0,
      isGpaMandatory = true,
      requiredDegree,
      educationDegreePreferred,
      fieldOfStudy,
      minExperienceYears,
      preferredExperienceYears,
      requiredSkills,
      preferredSkills,
      certificationsRequired,
      languagesRequired,
      graduationYear,
      workAuthorization = "Pakistan",
      deadline,
      fullDescription,
      responsibilities,
      preferredQualifications,
      benefits,
      salaryOrStipend,
      applicationUrl,
      contactInfo,
      recruiterId,
      skills,
      requirements,
      verificationStatus = "Pending", // Default is Pending verification per requirements
    } = body;

    if (!title || !company || !fullDescription) {
      return NextResponse.json(
        { error: "Title, Company, and Full Description are mandatory." },
        { status: 400 }
      );
    }

    // Default recruiter if not provided
    let targetRecruiterId = recruiterId;
    if (!targetRecruiterId) {
      const rec = await prisma.user.findFirst({ where: { role: "RECRUITER" } });
      targetRecruiterId = rec?.id;
    }

    if (!targetRecruiterId) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      targetRecruiterId = admin?.id;
    }

    const created = await prisma.opportunity.create({
      data: {
        title,
        type: type || "Job",
        company,
        location: location || "Islamabad",
        country,
        workplaceType: workplaceType || "Hybrid",
        minGpa: minGpa !== undefined && minGpa !== null && minGpa !== "" ? parseFloat(minGpa) : null,
        gpaScale: gpaScale ? parseFloat(gpaScale) : 4.0,
        isGpaMandatory: Boolean(isGpaMandatory),
        requiredDegree: requiredDegree || null,
        educationDegreePreferred: educationDegreePreferred || null,
        fieldOfStudy: fieldOfStudy || null,
        minExperienceYears: minExperienceYears !== undefined && minExperienceYears !== "" ? parseFloat(minExperienceYears) : 0,
        preferredExperienceYears: preferredExperienceYears !== undefined && preferredExperienceYears !== "" ? parseFloat(preferredExperienceYears) : null,
        requiredSkills: requiredSkills || "",
        preferredSkills: preferredSkills || null,
        certificationsRequired: certificationsRequired || null,
        languagesRequired: languagesRequired || null,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        workAuthorization: workAuthorization || "Pakistan",
        deadline: deadline || null,
        fullDescription,
        responsibilities: responsibilities || null,
        preferredQualifications: preferredQualifications || null,
        benefits: benefits || null,
        salaryOrStipend: salaryOrStipend || null,
        applicationUrl: applicationUrl || null,
        contactInfo: contactInfo || null,
        verificationStatus,
        recruiterId: targetRecruiterId!,
      },
    });

    // Create Opportunity Skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (const sk of skills) {
        if (sk.skillName && sk.skillName.trim()) {
          await prisma.opportunitySkill.create({
            data: {
              opportunityId: created.id,
              skillName: sk.skillName.trim(),
              isMandatory: sk.isMandatory !== undefined ? Boolean(sk.isMandatory) : true,
              requiredLevel: sk.requiredLevel || "Intermediate",
              minExperience: sk.minExperience ? parseFloat(sk.minExperience) : 0,
            },
          });
        }
      }
    } else if (requiredSkills) {
      // Parse comma-separated skills
      const skillNames = requiredSkills.split(",").map((s: string) => s.trim()).filter(Boolean);
      for (const sn of skillNames) {
        await prisma.opportunitySkill.create({
          data: {
            opportunityId: created.id,
            skillName: sn,
            isMandatory: true,
            requiredLevel: "Intermediate",
            minExperience: 0,
          },
        });
      }
    }

    // Create Requirements
    if (Array.isArray(requirements) && requirements.length > 0) {
      for (const req of requirements) {
        if (req.requirementType && req.description) {
          await prisma.opportunityRequirement.create({
            data: {
              opportunityId: created.id,
              requirementType: req.requirementType,
              description: req.description,
              isMandatory: req.isMandatory !== undefined ? Boolean(req.isMandatory) : true,
              value: req.value || null,
            },
          });
        }
      }
    }

    const fullOpportunity = await prisma.opportunity.findUnique({
      where: { id: created.id },
      include: {
        recruiter: true,
        skills: true,
        requirements: true,
      },
    });

    return NextResponse.json(fullOpportunity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

