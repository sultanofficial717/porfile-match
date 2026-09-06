import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      opportunityId,
      studentProfileId,
      recruiterId,
      customMessage,
      interviewType = "Technical Round 1",
    } = body;

    if (!opportunityId || !studentProfileId) {
      return NextResponse.json({ error: "Missing opportunityId or studentProfileId" }, { status: 400 });
    }

    // 1. Fetch Opportunity and Student
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { recruiter: true },
    });

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true },
    });

    if (!opportunity || !student) {
      return NextResponse.json({ error: "Opportunity or Student not found" }, { status: 404 });
    }

    // 2. Upsert Application with "Interviewing" status
    const application = await prisma.application.upsert({
      where: {
        opportunityId_studentProfileId: {
          opportunityId,
          studentProfileId,
        },
      },
      create: {
        opportunityId,
        studentProfileId,
        status: "Interviewing",
        notes: customMessage || `Fast-track interview invitation sent by ${opportunity.company}.`,
      },
      update: {
        status: "Interviewing",
        notes: customMessage || `Fast-track interview invitation sent by ${opportunity.company}.`,
      },
    });

    // 3. Create High-Priority Notification for the Candidate
    const noteText =
      customMessage ||
      `Congratulations! The recruiting team at ${opportunity.company} reviewed your profile and matched qualifications for ${opportunity.title}. You have been fast-tracked directly to ${interviewType}!`;

    await prisma.notification.create({
      data: {
        userId: student.userId,
        studentProfileId: student.id,
        opportunityId: opportunity.id,
        matchScore: 98,
        title: `🚀 Interview Invitation from ${opportunity.company}!`,
        message: noteText,
        emailSubject: `Fast-Track Interview Invitation: ${opportunity.title} at ${opportunity.company}`,
        emailBody: `Hi ${student.user.name},\n\nGreat news! The recruiting team at ${opportunity.company} was impressed by your profile and wants to invite you to interview for the ${opportunity.title} role.\n\nRecruiter Note:\n"${noteText}"\n\nNext Steps:\n1. Log in to your EasyMatch portal.\n2. Review your match details and confirm your interview availability.\n\nBest of luck!`,
        status: "SENT",
      },
    });

    return NextResponse.json({
      success: true,
      application,
      message: `Interview invitation sent successfully to ${student.user.name}!`,
    });
  } catch (error: any) {
    console.error("Error sending interview invite:", error);
    return NextResponse.json({ error: "Failed to send interview invitation" }, { status: 500 });
  }
}
