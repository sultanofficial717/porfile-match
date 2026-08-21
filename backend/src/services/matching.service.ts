import { prisma } from "../db/prisma";
import { embeddingService } from "./embedding.service";
import { profileService } from "./profile.service";
import { emailService } from "./email.service";

export interface HardEligibilityResult {
  passed: boolean;
  status: "pass" | "fail";
  failedChecks: string[];
}

export interface MatchScoreResult {
  eligibility: HardEligibilityResult;
  semanticScore: number;
  skillScore: number;
  educationScore: number;
  experienceScore: number;
  finalScore: number;
  thresholdReached: boolean;
  explanation: {
    overallAssessment: string;
    strongMatches: string[];
    missingSkills: string[];
    scoreBreakdown: {
      semantic: number;
      skill: number;
      experience: number;
      education: number;
      completeness: number;
      other: number;
    };
  };
}

export class MatchingService {
  checkHardEligibility(student: any, opp: any): HardEligibilityResult {
    const failedChecks: string[] = [];

    // 0. Preferences gate
    if (student.preferences) {
      try {
        const types = typeof student.preferences.opportunityTypes === "string"
          ? JSON.parse(student.preferences.opportunityTypes)
          : student.preferences.opportunityTypes;
        if (Array.isArray(types) && types.length > 0) {
          const matchedType = types.some(
            (t: string) => t.toLowerCase() === opp.type.toLowerCase()
          );
          if (!matchedType) {
            failedChecks.push(`Opportunity type '${opp.type}' is not in your selected opportunity preferences.`);
          }
        }
      } catch {
        // pass
      }
    }

    const req = opp.requirements;
    if (req) {
      // 1. Minimum GPA check
      if (req.minGpa && req.minGpa > 0) {
        const studentGpa = student.educations?.reduce(
          (max: number, e: any) => Math.max(max, e.gpa || 0),
          0
        ) || 0;

        if (studentGpa < req.minGpa) {
          failedChecks.push(
            `GPA ${studentGpa.toFixed(2)} is below required minimum ${req.minGpa.toFixed(2)}`
          );
        }
      }

      // 2. Minimum Experience check
      if (req.minExperienceYears && req.minExperienceYears > 0) {
        const totalExp = student.experiences?.length
          ? student.experiences.length * 0.8
          : 0;
        if (totalExp < req.minExperienceYears) {
          failedChecks.push(
            `Experience (${totalExp.toFixed(1)} yrs) is below required ${req.minExperienceYears} yrs`
          );
        }
      }

      // 3. Required Degrees check
      if (req.requiredDegrees) {
        try {
          const reqDegrees = typeof req.requiredDegrees === "string"
            ? JSON.parse(req.requiredDegrees)
            : req.requiredDegrees;
          if (Array.isArray(reqDegrees) && reqDegrees.length > 0) {
            const studentFields = (student.educations || []).map(
              (e: any) => `${e.degree || ""} ${e.fieldOfStudy || ""}`.toLowerCase()
            );
            const matchesDegree = reqDegrees.some((rd: string) => {
              const term = rd.toLowerCase();
              return studentFields.some((sf: string) => sf.includes(term) || term.includes(sf));
            });

            if (!matchesDegree) {
              failedChecks.push(`Degree field does not match required: ${reqDegrees.join(", ")}`);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // 4. Mandatory / Required Skills Check
    if (opp.skills && opp.skills.length > 0) {
      const requiredSkills = opp.skills.filter(
        (s: any) => s.requirementType === "required"
      );

      const studentSkillNames = (student.studentSkills || []).map((sk: any) =>
        (sk.skill?.name || sk.skillId || "").toLowerCase()
      );

      for (const rs of requiredSkills) {
        const reqName = (rs.skill?.name || rs.skillId || "").toLowerCase();
        const hasSkill = studentSkillNames.some(
          (ss: string) => ss === reqName || ss.includes(reqName) || reqName.includes(ss)
        );

        if (!hasSkill) {
          failedChecks.push(`Missing mandatory skill: ${rs.skill?.name || rs.skillId}`);
        }
      }
    }

    const passed = failedChecks.length === 0;
    return {
      passed,
      status: passed ? "pass" : "fail",
      failedChecks,
    };
  }

  async calculateMatchScore(student: any, opp: any): Promise<MatchScoreResult> {
    const hardEligibility = this.checkHardEligibility(student, opp);

    // 1. Semantic Similarity via Ollama embeddings
    let semanticScore = 50.0;
    try {
      let studentVec: number[] | null = null;
      if (student.profileEmbedding) {
        try {
          studentVec = JSON.parse(student.profileEmbedding);
        } catch {}
      }

      if (!studentVec || studentVec.length === 0) {
        const stuDoc = profileService.buildStudentEmbeddingText(student);
        studentVec = await embeddingService.embedText(stuDoc);
        if (studentVec && studentVec.length > 0) {
          await prisma.studentProfile.update({
            where: { id: student.id },
            data: { profileEmbedding: JSON.stringify(studentVec) },
          });
        }
      }

      let oppVec: number[] | null = null;
      if (opp.opportunityEmbedding) {
        try {
          oppVec = JSON.parse(opp.opportunityEmbedding);
        } catch {}
      }

      if (!oppVec || oppVec.length === 0) {
        const oppDoc = profileService.buildOpportunityEmbeddingText(opp);
        oppVec = await embeddingService.embedText(oppDoc);
        if (oppVec && oppVec.length > 0) {
          await prisma.opportunity.update({
            where: { id: opp.id },
            data: { opportunityEmbedding: JSON.stringify(oppVec) },
          });
        }
      }

      if (studentVec && oppVec && studentVec.length > 0 && oppVec.length > 0) {
        semanticScore = embeddingService.cosineSimilarityToPercentage(studentVec, oppVec);
      }
    } catch (err) {
      console.warn("Semantic vector computation error:", err);
      semanticScore = 60.0;
    }

    // 2. Skill Score Calculation
    let skillScore = 70.0;
    const strongMatches: string[] = [];
    const missingSkills: string[] = [];

    const studentSkillMap = new Map<string, string>();
    (student.studentSkills || []).forEach((s: any) => {
      const name = (s.skill?.name || s.skillId || "").toLowerCase();
      studentSkillMap.set(name, s.level || "Intermediate");
    });

    if (opp.skills && opp.skills.length > 0) {
      let matchedCount = 0;
      opp.skills.forEach((os: any) => {
        const skillName = os.skill?.name || os.skillId || "";
        const lower = skillName.toLowerCase();
        const level = studentSkillMap.get(lower);

        if (level) {
          matchedCount += 1;
          strongMatches.push(`${skillName} (${level})`);
        } else if (os.requirementType === "preferred") {
          missingSkills.push(skillName);
        }
      });

      skillScore = Number(
        Math.min(100, Math.max(30, (matchedCount / opp.skills.length) * 100)).toFixed(1)
      );
    } else {
      skillScore = 80.0;
    }

    // 3. Education Score
    let educationScore = 80.0;
    const gpa = student.educations?.[0]?.gpa || 3.0;
    educationScore = Number(Math.min(100, (gpa / 4.0) * 100).toFixed(1));
    if (gpa >= 3.5) {
      strongMatches.push(`Strong academic standing (GPA ${gpa.toFixed(2)})`);
    }

    // 4. Experience Score
    const expCount = student.experiences?.length || 0;
    const experienceScore = Math.min(100, 60 + expCount * 15);
    if (expCount > 0) {
      strongMatches.push(`${expCount} relevant experience role(s)`);
    }

    // 5. Completeness & Other
    const completeness = student.profileCompletionPct || profileService.calculateCompletionPercentage(student);
    const otherScore = (student.certifications?.length || 0) > 0 || (student.projects?.length || 0) > 0 ? 90 : 70;

    // Weighted final score: 40% semantic, 20% skill, 15% exp, 10% edu, 10% completeness, 5% other
    let weightedScore =
      semanticScore * 0.40 +
      skillScore * 0.20 +
      experienceScore * 0.15 +
      educationScore * 0.10 +
      completeness * 0.10 +
      otherScore * 0.05;

    weightedScore = Number(weightedScore.toFixed(1));

    const finalScore = hardEligibility.passed ? weightedScore : 0;
    const threshold = student.preferences?.minMatchThreshold || 92;
    const thresholdReached = hardEligibility.passed && finalScore >= threshold;

    const overallAssessment = !hardEligibility.passed
      ? "Not eligible: Does not meet mandatory requirements"
      : finalScore >= 90
      ? "Strong candidate: High semantic & structural alignment"
      : finalScore >= 80
      ? "Good candidate: Meets qualifications with moderate alignment"
      : "Fair candidate: Consider additional matching experience";

    return {
      eligibility: hardEligibility,
      semanticScore,
      skillScore,
      educationScore,
      experienceScore,
      finalScore,
      thresholdReached,
      explanation: {
        overallAssessment,
        strongMatches,
        missingSkills,
        scoreBreakdown: {
          semantic: semanticScore,
          skill: skillScore,
          experience: experienceScore,
          education: educationScore,
          completeness,
          other: otherScore,
        },
      },
    };
  }

  async runOpportunityMatching(opportunityId: string) {
    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        requirements: true,
        skills: { include: { skill: true } },
      },
    });

    if (!opp || opp.status !== "published") {
      return { matchesCreated: 0, emailsSent: 0 };
    }

    const students = await prisma.studentProfile.findMany({
      include: {
        profile: true,
        educations: true,
        studentSkills: { include: { skill: true } },
        experiences: true,
        projects: true,
        certifications: true,
        preferences: true,
      },
    });

    let matchesCreated = 0;
    let emailsSent = 0;

    for (const student of students) {
      const matchResult = await this.calculateMatchScore(student, opp);

      // Save match record in database
      await prisma.match.upsert({
        where: {
          studentId_opportunityId: {
            studentId: student.id,
            opportunityId: opp.id,
          },
        },
        create: {
          studentId: student.id,
          opportunityId: opp.id,
          eligibilityStatus: matchResult.eligibility.status,
          semanticScore: matchResult.semanticScore,
          skillScore: matchResult.skillScore,
          educationScore: matchResult.educationScore,
          experienceScore: matchResult.experienceScore,
          finalScore: matchResult.finalScore,
          matchingModel: "ollama-nomic-embed-text",
          explanation: JSON.stringify(matchResult.explanation),
        },
        update: {
          eligibilityStatus: matchResult.eligibility.status,
          semanticScore: matchResult.semanticScore,
          skillScore: matchResult.skillScore,
          educationScore: matchResult.educationScore,
          experienceScore: matchResult.experienceScore,
          finalScore: matchResult.finalScore,
          explanation: JSON.stringify(matchResult.explanation),
        },
      });
      matchesCreated++;

      // If threshold reached and student opted into email notifications, send deduplicated email
      if (
        matchResult.thresholdReached &&
        student.preferences?.emailNotificationsEnabled !== false &&
        student.profile?.email
      ) {
        const sent = await emailService.sendMatchEmail(
          student,
          opp,
          matchResult.finalScore,
          matchResult.explanation
        );
        if (sent) emailsSent++;
      }
    }

    return { matchesCreated, emailsSent };
  }
}

export const matchingService = new MatchingService();
