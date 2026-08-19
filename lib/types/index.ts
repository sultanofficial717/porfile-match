export type UserRole = "STUDENT" | "RECRUITER" | "ADMIN";

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export type OpportunityType =
  | "Job"
  | "Internship"
  | "Scholarship"
  | "Fellowship"
  | "Competition"
  | "Volunteer"
  | "Training";

export type WorkplaceType = "Remote" | "Hybrid" | "On-site";

export type VerificationStatus = "Pending" | "Verified" | "Rejected" | "Expired";

export type HardEligibilityStatus = "PASS" | "FAIL";

export type RecruiterDecision =
  | "STRONG_MATCH"
  | "GOOD_MATCH"
  | "WEAK_MATCH"
  | "WRONG_MATCH";

export interface ScoringWeights {
  semanticWeight: number; // e.g. 0.40
  skillWeight: number; // e.g. 0.20
  experienceWeight: number; // e.g. 0.15
  educationWeight: number; // e.g. 0.10
  completenessWeight: number; // e.g. 0.10
  otherWeight: number; // e.g. 0.05
}

export interface EligibilityResult {
  passed: boolean;
  status: HardEligibilityStatus;
  reasons: string[];
  failedChecks: {
    rule: string;
    required: string | number;
    actual: string | number | null | undefined;
    message: string;
  }[];
  passedChecks: string[];
}

export interface MatchExplanation {
  overallAssessment: "Strong candidate" | "Competitive match" | "Moderate match" | "Weak candidate" | "Not eligible";
  strongMatches: string[];
  missingSkills: string[];
  matchedSkills: {
    skill: string;
    studentLevel: string;
    requiredLevel?: string;
    isMandatory: boolean;
    status: "EXACT" | "SURPASSED" | "PARTIAL" | "MISSING";
  }[];
  educationMatchDetails: {
    degreeMatch: boolean;
    degreeName: string;
    requiredDegree: string;
    gpaMatch: boolean;
    gpa: number | null;
    minGpa: number | null;
  };
  experienceMatchDetails: {
    requiredYears: number;
    actualYears: number;
    isSatisfied: boolean;
  };
  scoreBreakdown: {
    semantic: number;
    skill: number;
    experience: number;
    education: number;
    completeness: number;
    other: number;
    finalOverall: number;
  };
  weightsUsed: ScoringWeights;
}

export interface MatchScoreResult {
  hardEligibility: EligibilityResult;
  semanticSimilarity: number; // 0 - 100
  skillMatchScore: number; // 0 - 100
  experienceMatchScore: number; // 0 - 100
  educationMatchScore: number; // 0 - 100
  completenessScore: number; // 0 - 100
  otherFactorsScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  explanation: MatchExplanation;
  thresholdReached: boolean;
  configuredThreshold: number;
}

export interface ModelExperimentResultItem {
  provider: string;
  modelName: string;
  hardEligibility: HardEligibilityStatus;
  semanticScore: number;
  overallScore: number;
  latencyMs: number;
  dimension: number;
  topKRank: number;
  status: "success" | "error" | "mock";
  errorMessage?: string;
  explanation: MatchExplanation;
}
