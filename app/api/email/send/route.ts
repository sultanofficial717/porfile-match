import { NextResponse } from "next/server";
import {
  sendApplicationConfirmationEmail,
  sendNewApplicationRecruiterEmail,
  sendShortlistNotificationEmail,
  sendInterviewInvitationEmail,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case "application_submitted": {
        const {
          studentEmail,
          studentName,
          roleTitle,
          companyName,
          earliestStartDate,
          recruiterEmail,
          recruiterName,
          matchScore,
          pitchSnippet,
          degree,
          institution,
          roleId,
        } = payload;

        // 1. Send confirmation to student
        if (studentEmail) {
          await sendApplicationConfirmationEmail({
            studentEmail,
            studentName: studentName || "Candidate",
            roleTitle,
            companyName,
            earliestStartDate,
          });
        }

        // 2. Send notification to recruiter
        if (recruiterEmail) {
          await sendNewApplicationRecruiterEmail({
            recruiterEmail,
            recruiterName: recruiterName || "Hiring Manager",
            studentName: studentName || "Candidate",
            roleTitle,
            matchScore: matchScore || 85,
            pitchSnippet,
            degree,
            institution,
            roleId,
          });
        }

        return NextResponse.json({ success: true, message: "Application emails dispatched" });
      }

      case "shortlisted": {
        const { studentEmail, studentName, roleTitle, companyName } = payload;
        if (studentEmail) {
          await sendShortlistNotificationEmail({
            studentEmail,
            studentName: studentName || "Candidate",
            roleTitle,
            companyName,
          });
        }
        return NextResponse.json({ success: true, message: "Shortlist email dispatched" });
      }

      case "contacted": {
        const { studentEmail, studentName, roleTitle, companyName, recruiterEmail, message } =
          payload;
        if (studentEmail) {
          await sendInterviewInvitationEmail({
            studentEmail,
            studentName: studentName || "Candidate",
            roleTitle,
            companyName,
            recruiterEmail,
            message,
          });
        }
        return NextResponse.json({ success: true, message: "Interview outreach email dispatched" });
      }

      default:
        return NextResponse.json({ error: "Invalid email action" }, { status: 400 });
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Email dispatch failed";
    console.error("Email API handler error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
