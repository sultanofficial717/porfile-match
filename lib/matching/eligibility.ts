import { EligibilityResult, SkillLevel } from "../types";

export interface StudentForEligibility {
  id?: string;
  gpa?: number | null;
  degree?: string | null;
  university?: string | null;
  yearsExperience?: number | null;
  location?: string | null;
  workAuthorization?: string | null;
  graduationYear?: number | null;
  educations?: Array<{
    degree: string;
    fieldOfStudy: string;
    gpa?: number | null;
    endYear?: number | null;
  }>;
  skills: Array<{
    skillName: string;
    level: string; // Beginner, Intermediate, Advanced, Expert
    yearsExperience?: number;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
  }>;
}

export interface OpportunityForEligibility {
  id?: string;
  minGpa?: number | null;
  requiredDegree?: string | null;
  minExperienceYears?: number | null;
  location?: string | null;
  workplaceType?: string | null; // Remote, Hybrid, On-site
  workAuthorization?: string | null;
  certificationsRequired?: string | null;
  skills?: Array<{
    skillName: string;
    isMandatory: boolean;
    requiredLevel?: string;
  }>;
  requirements?: Array<{
    requirementType: string;
    description: string;
    isMandatory: boolean;
    value?: string | null;
  }>;
}

const SKILL_LEVEL_RANK: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

/**
 * Normalizes degree string to match against requirements.
 */
function isDegreeMatch(studentDegree: string | null | undefined, studentFields: string[], requiredDegree: string | null | undefined): boolean {
  if (!requiredDegree || requiredDegree.trim() === "" || requiredDegree.toLowerCase().includes("any")) {
    return true;
  }

  const reqLower = requiredDegree.toLowerCase();
  // Split multiple allowed degrees separated by slash, comma, or "or"
  const allowedPatterns = reqLower
    .split(/\/|,|\bor\b/)
    .map((p) => p.trim())
    .filter(Boolean);

  const studentDegreeTokens = [
    studentDegree?.toLowerCase() || "",
    ...studentFields.map((f) => f.toLowerCase()),
  ].join(" ");

  // Direct keyword matching
  const aliases: Record<string, string[]> = {
    "cs": ["computer science", "software engineering", "computing"],
    "computer science": ["cs", "software engineering", "software", "information technology", "data science"],
    "software engineering": ["se", "computer science", "software"],
    "data science": ["data", "machine learning", "ai", "artificial intelligence", "computer science", "statistics"],
    "cybersecurity": ["cyber", "information security", "security", "computer science"],
    "business": ["business administration", "bba", "management", "finance", "marketing", "economics"],
    "engineering": ["electrical engineering", "mechanical engineering", "computer engineering", "civil engineering"],
  };

  for (const pattern of allowedPatterns) {
    if (studentDegreeTokens.includes(pattern)) return true;

    for (const [key, aliasList] of Object.entries(aliases)) {
      if (pattern.includes(key)) {
        if (aliasList.some((alias) => studentDegreeTokens.includes(alias))) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Checks all mandatory structured criteria.
 * If ANY mandatory check fails, returns passed = false (NOT ELIGIBLE).
 */
export function checkHardEligibility(
  student: StudentForEligibility,
  opportunity: OpportunityForEligibility
): EligibilityResult {
  const failedChecks: EligibilityResult["failedChecks"] = [];
  const passedChecks: string[] = [];
  const reasons: string[] = [];

  // 1. GPA Check
  if (opportunity.minGpa !== undefined && opportunity.minGpa !== null && opportunity.minGpa > 0) {
    const studentGpa = student.gpa ?? (student.educations && student.educations.length > 0 ? student.educations[0].gpa : null);
    if (studentGpa === null || studentGpa === undefined) {
      failedChecks.push({
        rule: "MIN_GPA",
        required: opportunity.minGpa,
        actual: "Not specified",
        message: `Minimum GPA requirement of ${opportunity.minGpa.toFixed(2)} not provided on profile.`,
      });
      reasons.push(`GPA missing (Minimum ${opportunity.minGpa.toFixed(2)} required)`);
    } else if (studentGpa < opportunity.minGpa) {
      failedChecks.push({
        rule: "MIN_GPA",
        required: opportunity.minGpa,
        actual: studentGpa,
        message: `Student GPA (${studentGpa.toFixed(2)}) is below the mandatory minimum of ${opportunity.minGpa.toFixed(2)}.`,
      });
      reasons.push(`GPA ${studentGpa.toFixed(2)} is below required minimum ${opportunity.minGpa.toFixed(2)}`);
    } else {
      passedChecks.push(`GPA requirement met (${studentGpa.toFixed(2)} >= ${opportunity.minGpa.toFixed(2)})`);
    }
  }

  // 2. Degree / Discipline Check
  if (opportunity.requiredDegree && opportunity.requiredDegree.trim().length > 0) {
    const studentFields = (student.educations || []).map((e) => `${e.degree} ${e.fieldOfStudy}`);
    const matches = isDegreeMatch(student.degree, studentFields, opportunity.requiredDegree);
    if (!matches) {
      failedChecks.push({
        rule: "REQUIRED_DEGREE",
        required: opportunity.requiredDegree,
        actual: student.degree || "Other discipline",
        message: `Degree/Discipline does not match requirement: ${opportunity.requiredDegree}.`,
      });
      reasons.push(`Degree must be in ${opportunity.requiredDegree}`);
    } else {
      passedChecks.push(`Degree requirement satisfied (${opportunity.requiredDegree})`);
    }
  }

  // 3. Minimum Experience Check
  if (opportunity.minExperienceYears !== undefined && opportunity.minExperienceYears !== null && opportunity.minExperienceYears > 0) {
    const actualExp = student.yearsExperience || 0;
    if (actualExp < opportunity.minExperienceYears) {
      failedChecks.push({
        rule: "MIN_EXPERIENCE",
        required: `${opportunity.minExperienceYears} years`,
        actual: `${actualExp} years`,
        message: `Experience (${actualExp} yrs) is less than the mandatory ${opportunity.minExperienceYears} years.`,
      });
      reasons.push(`Requires at least ${opportunity.minExperienceYears} years experience (has ${actualExp} yrs)`);
    } else {
      passedChecks.push(`Experience requirement met (${actualExp} yrs >= ${opportunity.minExperienceYears} yrs)`);
    }
  }

  // 4. Mandatory Skills & Skill Level Check
  if (opportunity.skills && opportunity.skills.length > 0) {
    const mandatorySkills = opportunity.skills.filter((s) => s.isMandatory);
    for (const reqSkill of mandatorySkills) {
      const studentSkill = student.skills.find(
        (s) => s.skillName.toLowerCase().trim() === reqSkill.skillName.toLowerCase().trim()
      );

      if (!studentSkill) {
        failedChecks.push({
          rule: "MANDATORY_SKILL",
          required: reqSkill.skillName,
          actual: "Missing",
          message: `Mandatory skill '${reqSkill.skillName}' is missing from student profile.`,
        });
        reasons.push(`Missing mandatory skill: ${reqSkill.skillName}`);
      } else if (reqSkill.requiredLevel) {
        const studentRank = SKILL_LEVEL_RANK[studentSkill.level.toLowerCase()] || 1;
        const requiredRank = SKILL_LEVEL_RANK[reqSkill.requiredLevel.toLowerCase()] || 1;
        if (studentRank < requiredRank) {
          failedChecks.push({
            rule: "SKILL_LEVEL",
            required: `${reqSkill.skillName} (${reqSkill.requiredLevel})`,
            actual: `${studentSkill.skillName} (${studentSkill.level})`,
            message: `Skill '${reqSkill.skillName}' level (${studentSkill.level}) is below required level (${reqSkill.requiredLevel}).`,
          });
          reasons.push(`${reqSkill.skillName} level (${studentSkill.level}) is below required (${reqSkill.requiredLevel})`);
        } else {
          passedChecks.push(`Mandatory skill '${reqSkill.skillName}' verified (${studentSkill.level})`);
        }
      } else {
        passedChecks.push(`Mandatory skill '${reqSkill.skillName}' verified`);
      }
    }
  }

  // 5. Work Authorization Check
  if (
    opportunity.workAuthorization &&
    opportunity.workAuthorization.trim() !== "" &&
    opportunity.workAuthorization.toLowerCase() !== "any" &&
    opportunity.workAuthorization.toLowerCase() !== "global"
  ) {
    const studentAuth = student.workAuthorization || "Pakistan";
    if (studentAuth.toLowerCase().trim() !== opportunity.workAuthorization.toLowerCase().trim()) {
      failedChecks.push({
        rule: "WORK_AUTHORIZATION",
        required: opportunity.workAuthorization,
        actual: studentAuth,
        message: `Work authorization mismatch: requires ${opportunity.workAuthorization}, student has ${studentAuth}.`,
      });
      reasons.push(`Work authorization required for ${opportunity.workAuthorization}`);
    } else {
      passedChecks.push(`Work authorization confirmed (${opportunity.workAuthorization})`);
    }
  }

  // 6. Additional Mandatory Requirements
  if (opportunity.requirements && opportunity.requirements.length > 0) {
    const mandatoryCustomReqs = opportunity.requirements.filter((r) => r.isMandatory);
    for (const req of mandatoryCustomReqs) {
      if (req.requirementType === "CERTIFICATION" && req.value) {
        const hasCert = (student.certifications || []).some((c) =>
          c.name.toLowerCase().includes(req.value!.toLowerCase())
        );
        if (!hasCert) {
          failedChecks.push({
            rule: "MANDATORY_CERTIFICATION",
            required: req.value,
            actual: "Missing",
            message: `Mandatory certification '${req.value}' is missing.`,
          });
          reasons.push(`Missing mandatory certification: ${req.value}`);
        } else {
          passedChecks.push(`Mandatory certification satisfied: ${req.value}`);
        }
      }
    }
  }

  const passed = failedChecks.length === 0;

  return {
    passed,
    status: passed ? "PASS" : "FAIL",
    reasons,
    failedChecks,
    passedChecks,
  };
}
