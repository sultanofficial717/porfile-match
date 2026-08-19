import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        studentProfile: { select: { id: true, degree: true, university: true, gpa: true } },
        opportunity: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            salaryOrStipend: true,
            deadline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId, action = "SEND_TEST_EMAIL" } = body;

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID is required." }, { status: 400 });
    }

    if (action === "SEND_TEST_EMAIL") {
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "SENT" },
        include: { user: true, opportunity: true },
      });

      console.log(`\n========================================`);
      console.log(`📧 [EMAIL SIMULATION SENT]`);
      console.log(`To: ${updated.user.name} <${updated.user.email}>`);
      console.log(`Subject: ${updated.emailSubject}`);
      console.log(`\n${updated.emailBody}`);
      console.log(`========================================\n`);

      return NextResponse.json({
        success: true,
        message: `Simulated test email sent to ${updated.user.email}`,
        notification: updated,
      });
    }

    if (action === "MARK_READ") {
      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "READ" },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
