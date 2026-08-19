import { prisma } from "../db/prisma";
import { computeSemanticSimilarity } from "./semantic";
import { computeMatchScore, DEFAULT_SCORING_WEIGHTS, DEFAULT_NOTIFICATION_THRESHOLD } from "./scoring";
import { MatchScoreResult } from "../types";

export interface MatchStudentOpportunityOptions {
  studentProfileId: string;
  opportunityId: string;
  providerName?: string;
  modelName?: string;
  saveToDb?: boolean;
}

/**
 * Runs the complete Hybrid Matching Pipeline for a specific student and opportunity.
 */
export async function matchStudentAndOpportunity(
  options: MatchStudentOpportunityOptions
): Promise<MatchScoreResult & { opportunity: any; student: any }> {
  const { studentProfileId, opportunityId, providerName = "gemini", modelName } = options;

  // 1. Fetch full student profile
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      user: true,
      educations: true,
      experiences: true,
      skills: true,
      certifications: true,
      courses: true,
      projects: true,
      communityWork: true,
      achievements: true,
      languages: true,
    },
  });

  if (!student) {
    throw new Error(`Student profile not found for id: ${studentProfileId}`);
  }

  // 2. Fetch full opportunity
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      recruiter: true,
      skills: true,
      requirements: true,
    },
  });

  if (!opportunity) {
    throw new Error(`Opportunity not found for id: ${opportunityId}`);
  }

  // 3. Fetch active scoring config from DB if present
  const scoringConfig = await prisma.scoringConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  const weights = scoringConfig
    ? {
        semanticWeight: scoringConfig.semanticWeight,
        skillWeight: scoringConfig.skillWeight,
        experienceWeight: scoringConfig.experienceWeight,
        educationWeight: scoringConfig.educationWeight,
        completenessWeight: scoringConfig.completenessWeight,
        otherWeight: scoringConfig.otherWeight,
      }
    : DEFAULT_SCORING_WEIGHTS;

  const threshold = scoringConfig?.notificationThreshold ?? DEFAULT_NOTIFICATION_THRESHOLD;

  // 4. Compute Semantic Similarity
  const semanticResult = await computeSemanticSimilarity(
    student as any,
    opportunity as any,
    providerName,
    { modelName }
  );

  // 5. Compute Hybrid Score & Explanation
  const matchResult = computeMatchScore(
    student as any,
    opportunity as any,
    semanticResult.similarityScore,
    weights,
    threshold
  );

  // 6. Save or Update Match record in database if requested
  if (options.saveToDb !== false) {
    try {
      const matchRecord = await prisma.match.upsert({
        where: {
          opportunityId_studentProfileId_modelProvider_modelName: {
            opportunityId,
            studentProfileId,
            modelProvider: semanticResult.provider,
            modelName: semanticResult.modelName,
          },
        },
        create: {
          opportunityId,
          studentProfileId,
          modelProvider: semanticResult.provider,
          modelName: semanticResult.modelName,
          hardEligibility: matchResult.hardEligibility.status,
          eligibilityReason: matchResult.hardEligibility.reasons.join(" | "),
          semanticScore: matchResult.semanticSimilarity,
          skillScore: matchResult.skillMatchScore,
          experienceScore: matchResult.experienceMatchScore,
          educationScore: matchResult.educationMatchScore,
          completenessScore: matchResult.completenessScore,
          overallScore: matchResult.overallScore,
          explanationJson: JSON.stringify(matchResult.explanation),
          isNotified: matchResult.thresholdReached,
          notifiedAt: matchResult.thresholdReached ? new Date() : null,
        },
        update: {
          hardEligibility: matchResult.hardEligibility.status,
          eligibilityReason: matchResult.hardEligibility.reasons.join(" | "),
          semanticScore: matchResult.semanticSimilarity,
          skillScore: matchResult.skillMatchScore,
          experienceScore: matchResult.experienceMatchScore,
          educationScore: matchResult.educationMatchScore,
          completenessScore: matchResult.completenessScore,
          overallScore: matchResult.overallScore,
          explanationJson: JSON.stringify(matchResult.explanation),
          isNotified: matchResult.thresholdReached,
          notifiedAt: matchResult.thresholdReached ? new Date() : null,
        },
      });

      // 7. Check if Threshold Reached & Create Notification Queue Item
      if (matchResult.thresholdReached) {
        const strongHighlights = matchResult.explanation.strongMatches.map((m) => `✓ ${m}`).join("\n");
        const emailBody = `
🎯 New Opportunity Match: ${opportunity.title} at ${opportunity.company}

Your Match Score: ${matchResult.overallScore}%

Why you matched:
${strongHighlights}

Type: ${opportunity.type}
Location: ${opportunity.location} (${opportunity.workplaceType})
${opportunity.salaryOrStipend ? `Compensation: ${opportunity.salaryOrStipend}` : ""}
${opportunity.deadline ? `Deadline: ${opportunity.deadline}` : ""}

Log in to your dashboard to view the opportunity details and apply.
        `.trim();

        // Check if notification already exists to avoid duplicate spam
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: student.userId,
            opportunityId: opportunity.id,
          },
        });

        if (!existingNotification) {
          await prisma.notification.create({
            data: {
              userId: student.userId,
              studentProfileId: student.id,
              opportunityId: opportunity.id,
              matchScore: matchResult.overallScore,
              title: `🎯 ${matchResult.overallScore}% Match: ${opportunity.title}`,
              message: `You have been matched with ${opportunity.title} at ${opportunity.company} with an overall score of ${matchResult.overallScore}%.`,
              emailSubject: `🎯 New Opportunity Match (${matchResult.overallScore}%): ${opportunity.title} at ${opportunity.company}`,
              emailBody,
              status: "PENDING",
            },
          });
        }
      }
    } catch (dbErr) {
      console.error("Error persisting match to DB:", dbErr);
    }
  }

  return {
    ...matchResult,
    opportunity,
    student,
  };
}

/**
 * Matches a student across all verified opportunities, sorted by overall score descending.
 */
export async function matchStudentWithAllOpportunities(
  studentProfileId: string,
  providerName: string = "gemini"
) {
  const opportunities = await prisma.opportunity.findMany({
    where: { verificationStatus: "Verified" },
    include: {
      recruiter: true,
      skills: true,
      requirements: true,
    },
  });

  const results = [];
  for (const opp of opportunities) {
    try {
      const match = await matchStudentAndOpportunity({
        studentProfileId,
        opportunityId: opp.id,
        providerName,
        saveToDb: true,
      });
      results.push(match);
    } catch (err) {
      console.error(`Error matching opp ${opp.id}:`, err);
    }
  }

  return results.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Matches an opportunity across all student candidates, sorted by overall score descending.
 */
export async function matchOpportunityWithAllStudents(
  opportunityId: string,
  providerName: string = "gemini"
) {
  const students = await prisma.studentProfile.findMany({
    where: { allowRecruiterView: true },
    include: {
      user: true,
      educations: true,
      experiences: true,
      skills: true,
      certifications: true,
      projects: true,
    },
  });

  const results = [];
  for (const stu of students) {
    try {
      const match = await matchStudentAndOpportunity({
        studentProfileId: stu.id,
        opportunityId,
        providerName,
        saveToDb: true,
      });
      results.push(match);
    } catch (err) {
      console.error(`Error matching student ${stu.id}:`, err);
    }
  }

  return results.sort((a, b) => b.overallScore - a.overallScore);
}
