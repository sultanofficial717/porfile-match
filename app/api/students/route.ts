import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const students = await prisma.studentProfile.findMany({
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
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
