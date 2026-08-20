import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const roleParam = request.nextUrl.searchParams.get("role");
    const userIdParam = request.nextUrl.searchParams.get("userId");

    let user = null;
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
      user = await prisma.user.findFirst({
        include: { studentProfile: true, recruiterProfile: true },
        orderBy: { createdAt: "asc" },
      });
    }

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
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      currentUser: user,
      availableUsers: allUsers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role = "STUDENT", companyName, position } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = (role || "STUDENT").toUpperCase();

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { studentProfile: true, recruiterProfile: true },
    });

    if (user) {
      return NextResponse.json({ user, message: "Logged in successfully" });
    }

    // Create new real user
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || normalizedEmail)}`;

    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        role: normalizedRole,
        avatar,
        ...(normalizedRole === "STUDENT"
          ? {
              studentProfile: {
                create: {
                  country: "Pakistan",
                  profileCompleteness: 15,
                },
              },
            }
          : {}),
        ...(normalizedRole === "RECRUITER"
          ? {
              recruiterProfile: {
                create: {
                  companyName: companyName || "My Company",
                  position: position || "Talent Acquisition",
                  isVerified: true,
                },
              },
            }
          : {}),
      },
      include: { studentProfile: true, recruiterProfile: true },
    });

    return NextResponse.json({ user, message: "Account created successfully" }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

