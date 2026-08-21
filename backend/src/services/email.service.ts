import { prisma } from "../db/prisma";

export class EmailService {
  async sendMatchEmail(
    student: any,
    opportunity: any,
    score: number,
    explanation: any
  ): Promise<boolean> {
    try {
      const email = student.profile?.email;
      if (!email) return false;

      // Check if already sent (deduplication)
      const existing = await prisma.emailLog.findUnique({
        where: {
          studentId_opportunityId: {
            studentId: student.id,
            opportunityId: opportunity.id,
          },
        },
      });

      if (existing) {
        return false; // Already notified, do not duplicate
      }

      const recipientName = student.profile?.fullName || "Student";
      const subject = `New Opportunity Match: ${opportunity.title} (${score}% Match)`;

      const strongMatchesText = explanation.strongMatches?.length
        ? explanation.strongMatches.map((m: string) => `• ${m}`).join("\n")
        : "• Strong semantic and background alignment";

      const missingText = explanation.missingSkills?.length
        ? `\nRecommended Skills to Explore:\n${explanation.missingSkills.map((s: string) => `• ${s}`).join("\n")}\n`
        : "";

      const deadlineText = opportunity.applicationDeadline
        ? new Date(opportunity.applicationDeadline).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Open";

      const body = `Dear ${recipientName},

We found an opportunity that strongly matches your profile:

🎯 Opportunity: ${opportunity.title}
🏢 Organization: ${opportunity.organization}
📍 Location: ${opportunity.location || "Remote"} (${opportunity.isRemote ? "Remote Available" : "On-site/Hybrid"})
📊 Overall Match Score: ${score}%
📅 Application Deadline: ${deadlineText}

Why this is a great fit for you:
${strongMatchesText}
${missingText}
Apply or view full details here:
${opportunity.applicationUrl || `https://opportunity-matcher.app/opportunities/${opportunity.id}`}

Best regards,
MatchAI Opportunity Matching Engine`;

      // Log in EmailLog
      await prisma.emailLog.create({
        data: {
          studentId: student.id,
          opportunityId: opportunity.id,
          recipientEmail: email,
          subject,
          body,
          deliveryStatus: "sent",
        },
      });

      return true;
    } catch (err) {
      console.error("Email service error:", err);
      return false;
    }
  }
}

export const emailService = new EmailService();
