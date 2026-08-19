export interface StudentProfileForDoc {
  bio?: string | null;
  location?: string | null;
  gpa?: number | null;
  university?: string | null;
  degree?: string | null;
  yearsExperience?: number | null;
  workAuthorization?: string | null;
  educations?: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: number | null;
    courses?: string | null;
    honors?: string | null;
  }>;
  skills?: Array<{
    skillName: string;
    level: string;
    yearsExperience?: number;
  }>;
  experiences?: Array<{
    title: string;
    company: string;
    type?: string;
    description?: string | null;
    years?: number;
    months?: number;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
  }>;
  courses?: Array<{
    title: string;
    institution: string;
    skillsLearned?: string | null;
  }>;
  communityWork?: Array<{
    title: string;
    organization: string;
    description?: string | null;
  }>;
  achievements?: Array<{
    title: string;
    type: string;
    description?: string | null;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

export interface OpportunityForDoc {
  title: string;
  type: string;
  company: string;
  location: string;
  workplaceType?: string;
  minGpa?: number | null;
  requiredDegree?: string | null;
  minExperienceYears?: number;
  requiredSkills: string;
  preferredSkills?: string | null;
  certificationsRequired?: string | null;
  fullDescription: string;
  responsibilities?: string | null;
  preferredQualifications?: string | null;
  benefits?: string | null;
  skills?: Array<{
    skillName: string;
    isMandatory: boolean;
    requiredLevel: string;
  }>;
}

/**
 * Builds a structured, normalized matching document text for a Student Profile.
 */
export function buildStudentMatchingDocument(profile: StudentProfileForDoc): string {
  const parts: string[] = [];

  // Summary / Bio
  if (profile.bio) {
    parts.push(`Career Bio & Objective:\n${profile.bio}`);
  }

  // Education
  const eduParts: string[] = [];
  if (profile.degree || profile.university) {
    eduParts.push(
      `Primary Degree: ${profile.degree || "N/A"} from ${profile.university || "N/A"}${
        profile.gpa ? ` (GPA: ${profile.gpa.toFixed(2)})` : ""
      }`
    );
  }
  if (profile.educations && profile.educations.length > 0) {
    for (const edu of profile.educations) {
      eduParts.push(
        `- ${edu.degree} in ${edu.fieldOfStudy} at ${edu.institution}${
          edu.gpa ? ` (GPA: ${edu.gpa.toFixed(2)})` : ""
        }${edu.courses ? ` | Courses: ${edu.courses}` : ""}${
          edu.honors ? ` | Honors: ${edu.honors}` : ""
        }`
      );
    }
  }
  if (eduParts.length > 0) {
    parts.push(`Education:\n${eduParts.join("\n")}`);
  }

  // Skills with proficiency
  if (profile.skills && profile.skills.length > 0) {
    const skillList = profile.skills.map(
      (s) => `- ${s.skillName}: ${s.level}${s.yearsExperience ? ` (${s.yearsExperience} yrs)` : ""}`
    );
    parts.push(`Technical & Professional Skills:\n${skillList.join("\n")}`);
  }

  // Work & Internship Experience
  const expParts: string[] = [];
  if (profile.yearsExperience !== undefined && profile.yearsExperience !== null) {
    expParts.push(`Total Experience: ${profile.yearsExperience} years`);
  }
  if (profile.experiences && profile.experiences.length > 0) {
    for (const exp of profile.experiences) {
      expParts.push(
        `- ${exp.title} at ${exp.company} (${exp.type || "Full-time"})${
          exp.description ? `: ${exp.description}` : ""
        }`
      );
    }
  }
  if (expParts.length > 0) {
    parts.push(`Work Experience & Internships:\n${expParts.join("\n")}`);
  }

  // Projects
  if (profile.projects && profile.projects.length > 0) {
    const projList = profile.projects.map(
      (p) => `- ${p.title} [Tech: ${p.technologies}]: ${p.description}`
    );
    parts.push(`Key Projects:\n${projList.join("\n")}`);
  }

  // Certifications
  if (profile.certifications && profile.certifications.length > 0) {
    const certList = profile.certifications.map((c) => `- ${c.name} by ${c.issuer}`);
    parts.push(`Certifications:\n${certList.join("\n")}`);
  }

  // Courses
  if (profile.courses && profile.courses.length > 0) {
    const courseList = profile.courses.map(
      (c) => `- ${c.title} (${c.institution})${c.skillsLearned ? ` - ${c.skillsLearned}` : ""}`
    );
    parts.push(`Completed Courses:\n${courseList.join("\n")}`);
  }

  // Community, Leadership & Achievements
  const extraParts: string[] = [];
  if (profile.communityWork && profile.communityWork.length > 0) {
    extraParts.push(
      ...profile.communityWork.map(
        (w) => `Volunteer: ${w.title} at ${w.organization}${w.description ? ` - ${w.description}` : ""}`
      )
    );
  }
  if (profile.achievements && profile.achievements.length > 0) {
    extraParts.push(
      ...profile.achievements.map(
        (a) => `${a.type}: ${a.title}${a.description ? ` - ${a.description}` : ""}`
      )
    );
  }
  if (extraParts.length > 0) {
    parts.push(`Leadership, Community & Honors:\n${extraParts.join("\n")}`);
  }

  // Languages & Location
  if (profile.languages && profile.languages.length > 0) {
    parts.push(
      `Languages: ${profile.languages.map((l) => `${l.language} (${l.proficiency})`).join(", ")}`
    );
  }
  if (profile.location) {
    parts.push(`Location: ${profile.location}`);
  }

  return parts.join("\n\n");
}

/**
 * Builds a structured, normalized matching document text for an Opportunity.
 */
export function buildOpportunityMatchingDocument(opportunity: OpportunityForDoc): string {
  const parts: string[] = [];

  parts.push(
    `Opportunity: ${opportunity.title}\nType: ${opportunity.type}\nOrganization: ${opportunity.company}\nLocation: ${opportunity.location} (${opportunity.workplaceType || "On-site"})`
  );

  // Requirements
  const reqParts: string[] = [];
  if (opportunity.minGpa) {
    reqParts.push(`Minimum GPA: ${opportunity.minGpa.toFixed(2)}`);
  }
  if (opportunity.requiredDegree) {
    reqParts.push(`Required Degree/Discipline: ${opportunity.requiredDegree}`);
  }
  if (opportunity.minExperienceYears !== undefined && opportunity.minExperienceYears > 0) {
    reqParts.push(`Minimum Experience: ${opportunity.minExperienceYears}+ years`);
  }
  if (reqParts.length > 0) {
    parts.push(`Eligibility Requirements:\n${reqParts.join("\n")}`);
  }

  // Skills
  const skillParts: string[] = [];
  if (opportunity.skills && opportunity.skills.length > 0) {
    for (const sk of opportunity.skills) {
      skillParts.push(
        `- ${sk.skillName} (${sk.isMandatory ? "Mandatory" : "Preferred"}, Level: ${sk.requiredLevel})`
      );
    }
  } else {
    if (opportunity.requiredSkills) {
      skillParts.push(`Required Skills: ${opportunity.requiredSkills}`);
    }
    if (opportunity.preferredSkills) {
      skillParts.push(`Preferred Skills: ${opportunity.preferredSkills}`);
    }
  }
  if (skillParts.length > 0) {
    parts.push(`Skills Matrix:\n${skillParts.join("\n")}`);
  }

  if (opportunity.certificationsRequired) {
    parts.push(`Certifications: ${opportunity.certificationsRequired}`);
  }

  // Description & Responsibilities
  if (opportunity.fullDescription) {
    parts.push(`Description:\n${opportunity.fullDescription}`);
  }
  if (opportunity.responsibilities) {
    parts.push(`Key Responsibilities:\n${opportunity.responsibilities}`);
  }
  if (opportunity.preferredQualifications) {
    parts.push(`Preferred Qualifications:\n${opportunity.preferredQualifications}`);
  }
  if (opportunity.benefits) {
    parts.push(`Benefits & Compensation:\n${opportunity.benefits}`);
  }

  return parts.join("\n\n");
}
