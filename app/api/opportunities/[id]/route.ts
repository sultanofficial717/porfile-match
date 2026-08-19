import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
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
        applications: {
          include: {
            studentProfile: {
              include: { user: true, skills: true },
            },
          },
        },
        matches: {
          include: {
            studentProfile: {
              include: { user: true, skills: true },
            },
          },
          orderBy: { overallScore: "desc" },
        },
      },
    });

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json(opportunity);
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
      title,
      type,
      company,
      location,
      workplaceType,
      minGpa,
      requiredDegree,
      minExperienceYears,
      requiredSkills,
      preferredSkills,
      certificationsRequired,
      workAuthorization,
      deadline,
      fullDescription,
      responsibilities,
      preferredQualifications,
      benefits,
      salaryOrStipend,
      applicationUrl,
      contactInfo,
      verificationStatus,
      skills,
      requirements,
    } = body;

    const updated = await prisma.opportunity.update({
      where: { id },
      data: {
        title,
        type,
        company,
        location,
        workplaceType,
        minGpa: minGpa ? parseFloat(minGpa) : null,
        requiredDegree,
        minExperienceYears: minExperienceYears !== undefined ? parseFloat(minExperienceYears) : undefined,
        requiredSkills,
        preferredSkills,
        certificationsRequired,
        workAuthorization,
        deadline,
        fullDescription,
        responsibilities,
        preferredQualifications,
        benefits,
        salaryOrStipend,
        applicationUrl,
        contactInfo,
        verificationStatus,
      },
    });

    if (Array.isArray(skills)) {
      await prisma.opportunitySkill.deleteMany({ where: { opportunityId: id } });
      for (const sk of skills) {
        if (sk.skillName && sk.skillName.trim()) {
          await prisma.opportunitySkill.create({
            data: {
              opportunityId: id,
              skillName: sk.skillName.trim(),
              isMandatory: sk.isMandatory !== undefined ? Boolean(sk.isMandatory) : true,
              requiredLevel: sk.requiredLevel || "Intermediate",
            },
          });
        }
      }
    }

    if (Array.isArray(requirements)) {
      await prisma.opportunityRequirement.deleteMany({ where: { opportunityId: id } });
      for (const req of requirements) {
        if (req.requirementType && req.description) {
          await prisma.opportunityRequirement.create({
            data: {
              opportunityId: id,
              requirementType: req.requirementType,
              description: req.description,
              isMandatory: req.isMandatory !== undefined ? Boolean(req.isMandatory) : true,
              value: req.value || null,
            },
          });
        }
      }
    }

    const fullUpdated = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        recruiter: true,
        skills: true,
        requirements: true,
      },
    });

    return NextResponse.json(fullUpdated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.opportunity.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Opportunity deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
