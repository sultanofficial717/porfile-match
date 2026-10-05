import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "ProfileMatch <onboarding@resend.dev>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Initialize Resend client only if API key is provided
const resend = RESEND_API_KEY && RESEND_API_KEY !== "re_sample_key"
  ? new Resend(RESEND_API_KEY)
  : null;

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Core email sender with graceful simulation fallback if API key is not yet configured.
 */
export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; id?: string }> {
  try {
    if (!resend) {
      console.log("\n✉️ [RESEND EMAIL SIMULATED - Configure RESEND_API_KEY in .env for live dispatch]");
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${FROM_EMAIL}`);
      return { success: true, id: `sim_${Date.now()}` };
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API error:", error);
      // Fallback to simulated delivery to never break user flow
      return { success: false };
    }

    console.log(`✉️ Email successfully delivered to ${to} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send email via Resend:", err);
    return { success: false };
  }
}

/**
 * Base responsive email template styling adhering to ProfileMatch's editorial theme.
 */
function renderBaseTemplate({
  badgeText,
  badgeColor = "#F59E0B",
  heading,
  bodyContent,
  ctaText,
  ctaLink,
}: {
  badgeText: string;
  badgeColor?: string;
  heading: string;
  bodyContent: string;
  ctaText: string;
  ctaLink: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d0e; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141517; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 36px 20px; background-color: #18191c; border-bottom: 1px solid #27272a;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #F59E0B; width: 28px; height: 28px; border-radius: 6px; text-align: center; line-height: 28px; font-weight: bold; color: #000; font-size: 15px; margin-right: 10px; vertical-align: middle;">P</div>
                    <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; vertical-align: middle;">ProfileMatch</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; background-color: ${badgeColor}15; color: ${badgeColor}; border: 1px solid ${badgeColor}30;">
                      ${badgeText}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 36px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                ${heading}
              </h1>
              
              <div style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin-bottom: 30px;">
                ${bodyContent}
              </div>

              <!-- Call to Action Button -->
              <table border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="border-radius: 8px; background-color: #F59E0B;">
                    <a href="${ctaLink}" target="_blank" style="font-size: 14px; font-weight: 600; color: #000000; text-decoration: none; padding: 12px 28px; display: inline-block; border-radius: 8px;">
                      ${ctaText} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #101113; border-top: 1px solid #222327; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #71717a;">
                This email was sent by <a href="${APP_URL}" style="color: #F59E0B; text-decoration: none;">ProfileMatch</a> · Automated Opportunity Matching Platform
              </p>
              <p style="margin: 6px 0 0; font-size: 11px; color: #52525b;">
                You are receiving this notification because of your account activity on ProfileMatch.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ─── High-Level Transactional Email Dispatchers ───────────────────────────────

/**
 * 1. Sent to student upon successful application submission.
 */
export async function sendApplicationConfirmationEmail(params: {
  studentEmail: string;
  studentName: string;
  roleTitle: string;
  companyName: string;
  earliestStartDate?: string;
}) {
  const { studentEmail, studentName, roleTitle, companyName, earliestStartDate } = params;

  const bodyContent = `
    <p>Hi ${studentName},</p>
    <p>Your application for <strong>${roleTitle}</strong> at <strong>${companyName}</strong> has been successfully submitted to the hiring team!</p>
    
    <div style="background-color: #1a1c1f; border: 1px solid #2d3035; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #e4e4e7;"><strong>Application Snapshot:</strong></p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #a1a1aa; line-height: 1.6;">
        <li>Role: <span style="color: #f4f4f5;">${roleTitle}</span></li>
        <li>Organization: <span style="color: #f4f4f5;">${companyName}</span></li>
        <li>Target Start Date: <span style="color: #f4f4f5;">${earliestStartDate || "Flexible"}</span></li>
        <li>Status: <span style="color: #F59E0B; font-weight: 600;">Under Review</span></li>
      </ul>
    </div>

    <p>The recruiter has received your candidate pitch, verified coursework, and credentials. You can track your real-time status in your student dashboard.</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `Application Submitted: ${roleTitle} at ${companyName}`,
    html: renderBaseTemplate({
      badgeText: "Application Submitted",
      badgeColor: "#10B981",
      heading: `Application Confirmed for ${roleTitle}`,
      bodyContent,
      ctaText: "Track My Application",
      ctaLink: `${APP_URL}/dashboard`,
    }),
  });
}

/**
 * 2. Sent to recruiter when a student submits an application.
 */
export async function sendNewApplicationRecruiterEmail(params: {
  recruiterEmail: string;
  recruiterName: string;
  studentName: string;
  roleTitle: string;
  matchScore: number;
  pitchSnippet?: string;
  degree?: string;
  institution?: string;
  roleId: string;
}) {
  const {
    recruiterEmail,
    recruiterName,
    studentName,
    roleTitle,
    matchScore,
    pitchSnippet,
    degree,
    institution,
    roleId,
  } = params;

  const bodyContent = `
    <p>Hi ${recruiterName},</p>
    <p>A candidate has just submitted a tailored application for your open position: <strong>${roleTitle}</strong>.</p>
    
    <div style="background-color: #1a1c1f; border: 1px solid #2d3035; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
        <span style="font-size: 15px; font-weight: 700; color: #ffffff;">${studentName}</span>
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; background-color: #F59E0B20; color: #F59E0B;">
          ${matchScore}% Match
        </span>
      </div>
      <p style="margin: 0 0 6px; font-size: 13px; color: #a1a1aa;">
        ${degree || "Student"} · ${institution || "University"}
      </p>
      ${
        pitchSnippet
          ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #27272a; font-size: 13px; color: #d4d4d8; font-style: italic;">
              &ldquo;${pitchSnippet}&rdquo;
            </div>`
          : ""
      }
    </div>

    <p>Log in to view their complete dossier, relevant coursework, resume document, and update candidate stage.</p>
  `;

  return sendEmail({
    to: recruiterEmail,
    subject: `New Candidate Application: ${studentName} (${matchScore}% Match) for ${roleTitle}`,
    html: renderBaseTemplate({
      badgeText: "New Application",
      badgeColor: "#F59E0B",
      heading: `New Candidate Applied for ${roleTitle}`,
      bodyContent,
      ctaText: "Review Candidate Dossier",
      ctaLink: `${APP_URL}/recruiter/roles/${roleId}/candidates`,
    }),
  });
}

/**
 * 3. Sent to student when recruiter shortlists them.
 */
export async function sendShortlistNotificationEmail(params: {
  studentEmail: string;
  studentName: string;
  roleTitle: string;
  companyName: string;
}) {
  const { studentEmail, studentName, roleTitle, companyName } = params;

  const bodyContent = `
    <p>Hi ${studentName},</p>
    <p>Exciting news! <strong>${companyName}</strong> has reviewed your application and moved you to their <strong>Shortlist</strong> for the <strong>${roleTitle}</strong> position.</p>
    
    <div style="background-color: #064e3b20; border: 1px solid #05966940; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #34d399;">
        ✓ Candidate Shortlisted
      </p>
      <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">
        The recruitment team is evaluating next steps and will be in contact shortly regarding interview scheduling.
      </p>
    </div>

    <p>Ensure your contact phone and availability date are up to date on your profile.</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `You've Been Shortlisted! ${roleTitle} at ${companyName}`,
    html: renderBaseTemplate({
      badgeText: "Shortlisted",
      badgeColor: "#10B981",
      heading: `Shortlisted by ${companyName}!`,
      bodyContent,
      ctaText: "View Application Status",
      ctaLink: `${APP_URL}/dashboard`,
    }),
  });
}

/**
 * 4. Sent to student when recruiter reaches out or invites to interview.
 */
export async function sendInterviewInvitationEmail(params: {
  studentEmail: string;
  studentName: string;
  roleTitle: string;
  companyName: string;
  recruiterEmail?: string;
  message?: string;
}) {
  const { studentEmail, studentName, roleTitle, companyName, recruiterEmail, message } = params;

  const bodyContent = `
    <p>Hi ${studentName},</p>
    <p><strong>${companyName}</strong> would like to connect with you regarding the <strong>${roleTitle}</strong> role!</p>
    
    <div style="background-color: #1e3a8a20; border: 1px solid #3b82f640; border-radius: 10px; padding: 18px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #60a5fa;">
        📅 Interview & Outreach Invitation
      </p>
      ${
        message
          ? `<p style="margin: 10px 0 0; font-size: 13px; color: #bfdbfe; font-style: italic;">
              &ldquo;${message}&rdquo;
            </p>`
          : `<p style="margin: 6px 0 0; font-size: 13px; color: #bfdbfe;">
              The hiring team is interested in scheduling an introductory interview to discuss your qualifications.
            </p>`
      }
      ${
        recruiterEmail
          ? `<p style="margin: 10px 0 0; font-size: 12px; color: #93c5fd;">
              Direct recruiter contact: <strong>${recruiterEmail}</strong>
            </p>`
          : ""
      }
    </div>

    <p>Visit your dashboard to view full position details and prepare for your conversation.</p>
  `;

  return sendEmail({
    to: studentEmail,
    subject: `Interview Outreach: ${companyName} wants to connect for ${roleTitle}`,
    html: renderBaseTemplate({
      badgeText: "Interview Outreach",
      badgeColor: "#3B82F6",
      heading: `${companyName} wants to interview you!`,
      bodyContent,
      ctaText: "Go to Dashboard",
      ctaLink: `${APP_URL}/dashboard`,
    }),
  });
}
