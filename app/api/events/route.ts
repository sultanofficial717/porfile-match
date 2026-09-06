import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const company = searchParams.get("company");
    const userId = searchParams.get("userId");

    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
    }
    if (company && company !== "ALL") {
      where.company = company;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        rsvps: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If userId provided, tag whether the user has RSVPed
    const formatted = events.map((event) => ({
      ...event,
      isRsvped: userId ? event.rsvps.some((r) => r.userId === userId && r.status === "REGISTERED") : false,
      rsvpCount: event.rsvps.filter((r) => r.status === "REGISTERED").length,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      company,
      companyLogo,
      description,
      type,
      date,
      time,
      duration,
      locationType,
      meetingUrl,
      tags,
      hostName,
      hostTitle,
      hostAvatar,
      targetAudience,
      capacity,
      recruiterId,
    } = body;

    if (!title || !company || !description || !date || !time) {
      return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        company,
        companyLogo: companyLogo || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=100",
        description,
        type: type || "Info Session",
        date,
        time,
        duration: duration || "60 mins",
        locationType: locationType || "Virtual",
        meetingUrl: meetingUrl || "https://zoom.us",
        tags: tags || "Early Career, Tech",
        hostName,
        hostTitle,
        hostAvatar,
        targetAudience,
        capacity: capacity ? parseInt(capacity) : 500,
        recruiterId,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
