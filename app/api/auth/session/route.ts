import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get("role");
    const userIdParam = request.nextUrl.searchParams.get("userId");

    let user;
    if (userIdParam) {
      user = await prisma.user.findUnique({
        where: { id: userIdParam },
        include: { studentProfile: true, recruiterProfile: true },
      });
    } else if (roleParam) {
      user = await prisma.user.findFirst({
        where: { role: roleParam.toUpperCase() },
        include: { studentProfile: true, recruiterProfile: true },
      });
    } else {
      // Default to the first student (Ali Rehman)
      user = await prisma.user.findFirst({
        where: { role: "STUDENT" },
        include: { studentProfile: true, recruiterProfile: true },
      });
    }

    if (!user) {
      return NextResponse.json({ error: "No user found" }, { status: 404 });
    }

    // Get list of all available demo users for quick switching
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        studentProfile: { select: { id: true, degree: true, gpa: true } },
        recruiterProfile: { select: { id: true, companyName: true } },
      },
    });

    return NextResponse.json({
      currentUser: user,
      availableUsers: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
