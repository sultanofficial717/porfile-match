import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, userId, studentName, studentEmail, studentMajor, action = "RSVP" } = body;

    if (!eventId || !userId) {
      return NextResponse.json({ error: "Missing eventId or userId" }, { status: 400 });
    }

    if (action === "CANCEL") {
      await prisma.eventRsvp.deleteMany({
        where: {
          eventId,
          userId,
        },
      });
      return NextResponse.json({ success: true, message: "RSVP cancelled successfully" });
    }

    // Register RSVP
    const rsvp = await prisma.eventRsvp.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      create: {
        eventId,
        userId,
        studentName: studentName || "Candidate",
        studentEmail: studentEmail || "",
        studentMajor: studentMajor || "Computer Science",
        status: "REGISTERED",
      },
      update: {
        status: "REGISTERED",
      },
    });

    // Also trigger a notification for user
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (event) {
      await prisma.notification.create({
        data: {
          userId,
          matchScore: 100,
          title: `🎟️ RSVP Confirmed: ${event.title}`,
          message: `You're confirmed for ${event.company}'s ${event.title} on ${event.date} at ${event.time}.`,
          emailSubject: `Event Confirmation: ${event.title} (${event.company})`,
          emailBody: `Hi ${studentName || "there"},\n\nYou are successfully registered for ${event.title}.\n\n📅 Date: ${event.date}\n⏰ Time: ${event.time}\n🔗 Meeting Link: ${event.meetingUrl || "Will be shared before the event"}\n\nAdd this to your calendar and be ready to ask questions directly to recruiters!`,
          status: "SENT",
        },
      });
    }

    return NextResponse.json({ success: true, rsvp });
  } catch (error: any) {
    console.error("Error processing event RSVP:", error);
    return NextResponse.json({ error: "Failed to process RSVP" }, { status: 500 });
  }
}
