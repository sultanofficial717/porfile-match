import { ScoringWeights, MatchScoreResult, MatchExplanation, EligibilityResult } from "../types";
import { checkHardEligibility, StudentForEligibility, OpportunityForEligibility } from "./eligibility";
import { StudentProfileForDoc, OpportunityForDoc } from "./document";

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  semanticWeight: 0.40,
  skillWeight: 0.20,
  experienceWeight: 0.15,
  educationWeight: 0.10,
  completenessWeight: 0.10,
  otherWeight: 0.05,
};

export const DEFAULT_NOTIFICATION_THRESHOLD = 92.0;

const LEVEL_SCORES: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

/**
 * Calculates Skill Match Score (0 - 100)
 */
export function calculateSkillScore(
  studentSkills: Array<{ skillName: string; level: string }>,
  opportunitySkills: Array<{ skillName: string; isMandatory: boolean; requiredLevel?: string }> = [],
  rawRequiredSkills: string = "",
  rawPreferredSkills: string = ""
): { score: number; matched: any[]; missing: string[]; strong: string[] } {
  // Parse skills from raw strings if structured array is empty
  let targetSkills = [...opportunitySkills];
  if (targetSkills.length === 0) {
    const reqTokens = rawRequiredSkills.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
    const prefTokens = rawPreferredSkills.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
    for (const s of reqTokens) {
      targetSkills.push({ skillName: s, isMandatory: true, requiredLevel: "Intermediate" });
    }
    for (const s of prefTokens) {
      targetSkills.push({ skillName: s, isMandatory: false, requiredLevel: "Beginner" });
    }
  }

  if (targetSkills.length === 0) {
    return { score: 100, matched: [], missing: [], strong: [] };
  }

  let totalWeight = 0;
  let earnedPoints = 0;
  const matched: any[] = [];
  const missing: string[] = [];
  const strong: string[] = [];

  for (const target of targetSkills) {
    const weight = target.isMandatory ? 2.0 : 1.0;
    totalWeight += weight;

    const found = studentSkills.find(
      (s) => s.skillName.toLowerCase().trim() === target.skillName.toLowerCase().trim()
    );

    if (found) {
      const studentRank = LEVEL_SCORES[found.level.toLowerCase()] || 50;
      const targetRank = LEVEL_SCORES[(target.requiredLevel || "Intermediate").toLowerCase()] || 50;

      let status: "EXACT" | "SURPASSED" | "PARTIAL" | "MISSING" = "EXACT";
      let ratio = 1.0;

      if (studentRank > targetRank) {
        status = "SURPASSED";
        ratio = 1.0;
        strong.push(`${found.skillName} (${found.level})`);
      } else if (studentRank === targetRank) {
        status = "EXACT";
        ratio = 1.0;
        strong.push(`${found.skillName} (${found.level})`);
      } else {
        status = "PARTIAL";
        ratio = studentRank / targetRank;
      }

      earnedPoints += weight * ratio;
      matched.push({
        skill: target.skillName,
        studentLevel: found.level,
        requiredLevel: target.requiredLevel || "Intermediate",
        isMandatory: target.isMandatory,
        status,
      });
    } else {
      missing.push(target.skillName);
      matched.push({
        skill: target.skillName,
        studentLevel: "None",
        requiredLevel: target.requiredLevel || "Intermediate",
        isMandatory: target.isMandatory,
        status: "MISSING",
      });
    }
  }

  const score = totalWeight > 0 ? (earnedPoints / totalWeight) * 100 : 100;
  return {
    score: Number(Math.min(100, Math.max(0, score)).toFixed(1)),
    matched,
    missing,
    strong,
  };
}

/**
 * Calculates Experience Match Score (0 - 100)
 */
export function calculateExperienceScore(
  studentYears: number = 0,
  requiredYears: number = 0
): number {
  if (requiredYears <= 0) return 100;
  if (studentYears >= requiredYears) return 100;
  const ratio = studentYears / requiredYears;
  return Number((ratio * 80).toFixed(1)); // Proportional penalty
}

/**
 * Calculates Education Match Score (0 - 100)
 */
export function calculateEducationScore(
  studentGpa: number | null | undefined,
  minGpa: number | null | undefined,
  isDegreeMatched: boolean
): number {
  let score = 0;
  // Degree component: 60% of education score
  if (isDegreeMatched) {
    score += 60;
  } else {
    score += 20;
  }

  // GPA component: 40% of education score
  if (minGpa !== undefined && minGpa !== null && minGpa > 0) {
    if (studentGpa !== undefined && studentGpa !== null) {
      if (studentGpa >= minGpa) {
        score += 40;
      } else {
        score += (studentGpa / minGpa) * 30;
      }
    }
  } else {
    // No min GPA requested, reward good GPA if present
    if (studentGpa) {
      score += Math.min(40, (studentGpa / 4.0) * 40);
    } else {
      score += 35;
    }
  }

  return Number(Math.min(100, Math.max(0, score)).toFixed(1));
}

/**
 * Calculates Profile Completeness Score (0 - 100)
 */
export function calculateProfileCompleteness(profile: StudentProfileForDoc): number {
  let points = 0;
  if (profile.bio && profile.bio.trim().length > 10) points += 10;
  if (profile.degree || (profile.educations && profile.educations.length > 0)) points += 15;
  if (profile.gpa) points += 5;
  if (profile.skills && profile.skills.length >= 3) points += 20;
  else if (profile.skills && profile.skills.length > 0) points += 10;
  if (profile.experiences && profile.experiences.length > 0) points += 15;
  if (profile.projects && profile.projects.length > 0) points += 15;
  if (profile.certifications && profile.certifications.length > 0) points += 5;
  if (profile.communityWork && profile.communityWork.length > 0) points += 5;
  if (profile.achievements && profile.achievements.length > 0) points += 5;
  if (profile.languages && profile.languages.length > 0) points += 5;

  return Math.min(100, points);
}

/**
 * Calculates Other Factors (Certifications, Leadership, Volunteer, Languages) (0 - 100)
 */
export function calculateOtherFactorsScore(profile: StudentProfileForDoc): number {
  let score = 50; // baseline
  if (profile.certifications && profile.certifications.length > 0) score += 15;
  if (profile.communityWork && profile.communityWork.length > 0) score += 15;
  if (profile.achievements && profile.achievements.length > 0) score += 10;
  if (profile.languages && profile.languages.length >= 2) score += 10;
  return Math.min(100, score);
}

/**
 * Master Hybrid Score Calculator
 */
export function computeMatchScore(
  student: StudentProfileForDoc & StudentForEligibility,
  opportunity: OpportunityForDoc & OpportunityForEligibility,
  semanticSimilarity: number,
  customWeights?: Partial<ScoringWeights>,
  threshold: number = DEFAULT_NOTIFICATION_THRESHOLD
): MatchScoreResult {
  const weights: ScoringWeights = {
    ...DEFAULT_SCORING_WEIGHTS,
    ...customWeights,
  };

  // 1. Hard Eligibility Filter
  const hardEligibility = checkHardEligibility(student, opportunity);

  // 2. Component scores
  const skillAnalysis = calculateSkillScore(
    student.skills || [],
    opportunity.skills || [],
    opportunity.requiredSkills,
    opportunity.preferredSkills || ""
  );
  const skillMatchScore = skillAnalysis.score;

  const experienceMatchScore = calculateExperienceScore(
    student.yearsExperience || 0,
    opportunity.minExperienceYears || 0
  );

  const degreePassed = !hardEligibility.failedChecks.some((f) => f.rule === "REQUIRED_DEGREE");
  const educationMatchScore = calculateEducationScore(
    student.gpa,
    opportunity.minGpa,
    degreePassed
  );

  const completenessScore = calculateProfileCompleteness(student);
  const otherFactorsScore = calculateOtherFactorsScore(student);

  // 3. Weighted Combination
  let overallScore = 0;
  if (hardEligibility.passed) {
    const rawWeighted =
      semanticSimilarity * weights.semanticWeight +
      skillMatchScore * weights.skillWeight +
      experienceMatchScore * weights.experienceWeight +
      educationMatchScore * weights.educationWeight +
      completenessScore * weights.completenessWeight +
      otherFactorsScore * weights.otherWeight;

    overallScore = Number(Math.min(100, Math.max(0, rawWeighted)).toFixed(1));
  } else {
    // Hard Eligibility FAIL means overallScore is 0 for matching decisions, though component scores remain visible for analytics
    overallScore = 0;
  }

  // 4. Strong matches & explanation synthesis
  const strongMatches: string[] = [];
  if (hardEligibility.passed) {
    for (const sk of skillAnalysis.strong) {
      strongMatches.push(sk);
    }
    if (student.gpa && opportunity.minGpa && student.gpa >= opportunity.minGpa) {
      strongMatches.push(`GPA ${student.gpa.toFixed(2)} (Satisfies >= ${opportunity.minGpa.toFixed(2)})`);
    }
    if (student.degree && degreePassed) {
      strongMatches.push(`Relevant Degree: ${student.degree}`);
    }
    if (student.yearsExperience && student.yearsExperience >= (opportunity.minExperienceYears || 0)) {
      strongMatches.push(`${student.yearsExperience} yrs relevant experience`);
    }
    if (student.projects && student.projects.length > 0) {
      strongMatches.push(`${student.projects.length} relevant technical project(s)`);
    }
  }

  let overallAssessment: MatchExplanation["overallAssessment"] = "Not eligible";
  if (hardEligibility.passed) {
    if (overallScore >= 90) overallAssessment = "Strong candidate";
    else if (overallScore >= 80) overallAssessment = "Competitive match";
    else if (overallScore >= 65) overallAssessment = "Moderate match";
    else overallAssessment = "Weak candidate";
  }

  const explanation: MatchExplanation = {
    overallAssessment,
    strongMatches,
    missingSkills: skillAnalysis.missing,
    matchedSkills: skillAnalysis.matched,
    educationMatchDetails: {
      degreeMatch: degreePassed,
      degreeName: student.degree || "N/A",
      requiredDegree: opportunity.requiredDegree || "Any",
      gpaMatch: student.gpa ? (opportunity.minGpa ? student.gpa >= opportunity.minGpa : true) : false,
      gpa: student.gpa || null,
      minGpa: opportunity.minGpa || null,
    },
    experienceMatchDetails: {
      requiredYears: opportunity.minExperienceYears || 0,
      actualYears: student.yearsExperience || 0,
      isSatisfied: (student.yearsExperience || 0) >= (opportunity.minExperienceYears || 0),
    },
    scoreBreakdown: {
      semantic: Number(semanticSimilarity.toFixed(1)),
      skill: skillMatchScore,
      experience: experienceMatchScore,
      education: educationMatchScore,
      completeness: completenessScore,
      other: otherFactorsScore,
      finalOverall: overallScore,
    },
    weightsUsed: weights,
  };

  const thresholdReached = hardEligibility.passed && overallScore >= threshold;

  return {
    hardEligibility,
    semanticSimilarity: Number(semanticSimilarity.toFixed(1)),
    skillMatchScore,
    experienceMatchScore,
    educationMatchScore,
    completenessScore,
    otherFactorsScore,
    overallScore,
    explanation,
    thresholdReached,
    configuredThreshold: threshold,
  };
}
