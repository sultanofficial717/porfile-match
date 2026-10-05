import type { Models } from "appwrite";

// ─── Role Types ───────────────────────────────────────────────────────────────

export type UserRole = "student" | "recruiter" | "admin";
export type WorkMode = "remote" | "hybrid" | "onsite" | "any";
export type ExperienceLevel = "entry" | "mid" | "senior" | "any";
export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "internship"
  | "freelance";
export type MatchStatus =
  | "new"
  | "viewed"
  | "shortlisted"
  | "rejected"
  | "contacted";

// ─── Document Types (extend Appwrite Document) ───────────────────────────────

export interface Profile extends Models.Document {
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface StudentProfile extends Models.Document {
  userId: string;
  location?: string;
  bio?: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  gpa?: number;
  skills?: string[];
  resumeFileId?: string;
  profilePhotoFileId?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  desiredRoleType?: string;
  preferredIndustry?: string;
  locationPreference?: string;
  workMode?: WorkMode;
  availabilityDate?: string;
  profileCompleteness?: number;
  email?: string;
  phone?: string;
  whatsapp?: string;
  certificationFileIds?: string[];
  academicDocFileIds?: string[];
}

export interface Experience extends Models.Document {
  studentProfileId: string;
  company: string;
  title: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  description?: string;
  skillsUsed?: string[];
}

export interface Project extends Models.Document {
  studentProfileId: string;
  title: string;
  description?: string;
  techUsed?: string[];
  projectUrl?: string;
  githubUrl?: string;
  thumbnailFileId?: string;
  imageFileIds?: string[];
}

export interface RecruiterProfile extends Models.Document {
  userId: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  location?: string;
  companyDescription?: string;
  logoFileId?: string;
  website?: string;
}

export interface Role extends Models.Document {
  recruiterProfileId: string;
  title: string;
  requiredSkills?: string[];
  experienceLevel?: ExperienceLevel;
  location?: string;
  employmentType?: EmploymentType;
  description?: string;
  salaryRange?: string;
  workMode?: WorkMode;
  deadline?: string;
  isActive?: boolean;
}

export interface Match extends Models.Document {
  studentProfileId: string;
  roleId: string;
  recruiterProfileId: string;
  matchScore: number;
  skillOverlap?: string[];
  matchReasons?: string[];
  status: MatchStatus;
}

// ─── Composite types (for UI) ─────────────────────────────────────────────────

export interface StudentWithProfile {
  profile: Profile;
  studentProfile: StudentProfile;
  experiences: Experience[];
  projects: Project[];
}

export interface RecruiterWithProfile {
  profile: Profile;
  recruiterProfile: RecruiterProfile;
  roles: Role[];
}

export interface MatchWithDetails extends Match {
  role?: Role;
  recruiterProfile?: RecruiterProfile;
  studentProfile?: StudentProfile;
  profile?: Profile;
}

// ─── Match Scoring & Explanation Types ────────────────────────────────────────

export type HardEligibilityStatus = "PASS" | "FAIL";

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

export interface ScoringWeights {
  semanticWeight: number;
  skillWeight: number;
  experienceWeight: number;
  educationWeight: number;
  completenessWeight: number;
  otherWeight: number;
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
  semanticSimilarity: number;
  skillMatchScore: number;
  experienceMatchScore: number;
  educationMatchScore: number;
  completenessScore: number;
  otherFactorsScore: number;
  overallScore: number;
  explanation: MatchExplanation;
  thresholdReached: boolean;
  configuredThreshold: number;
}

export interface SubmittedApplicationData {
  appliedAt: string;
  coverNote: string;
  relevantExperience: string;
  earliestStartDate: string;
  workAuthorization: string;
  preferredWorkMode: string;
  portfolioOrGithub: string;
  phoneNumber: string;
  additionalComments?: string;
}
