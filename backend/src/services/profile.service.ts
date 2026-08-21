export class ProfileService {
  calculateCompletionPercentage(student: any): number {
    let score = 0;

    // 1. Personal / Basic info (up to 20 pts)
    let personalPoints = 0;
    if (student.profile?.fullName) personalPoints += 4;
    if (student.phone) personalPoints += 4;
    if (student.location || student.country) personalPoints += 4;
    if (student.headline) personalPoints += 4;
    if (student.bio && student.bio.length > 20) personalPoints += 4;
    score += Math.min(20, personalPoints);

    // 2. Education (20 pts)
    if (student.educations && student.educations.length > 0) {
      score += 20;
    }

    // 3. Skills (20 pts - at least 3 skills)
    if (student.studentSkills && student.studentSkills.length >= 3) {
      score += 20;
    } else if (student.studentSkills && student.studentSkills.length > 0) {
      score += student.studentSkills.length * 6;
    }

    // 4. Experiences / Projects / Certifications (20 pts)
    const hasExp = student.experiences && student.experiences.length > 0;
    const hasProj = student.projects && student.projects.length > 0;
    const hasCert = (student.certifications && student.certifications.length > 0) || (student.courses && student.courses.length > 0);

    let expPoints = 0;
    if (hasExp) expPoints += 10;
    if (hasProj) expPoints += 6;
    if (hasCert) expPoints += 4;
    score += Math.min(20, expPoints);

    // 5. Preferences (20 pts - required for matching activation)
    if (student.preferences) {
      try {
        const types = typeof student.preferences.opportunityTypes === "string"
          ? JSON.parse(student.preferences.opportunityTypes)
          : student.preferences.opportunityTypes;
        if (Array.isArray(types) && types.length > 0) {
          score += 20;
        }
      } catch {
        // invalid json
      }
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  buildStudentEmbeddingText(student: any): string {
    const parts: string[] = [];

    const name = student.profile?.fullName || "Candidate";
    const headline = student.headline ? `Headline: ${student.headline}` : "";
    const bio = student.bio ? `Summary: ${student.bio}` : "";
    const location = student.location ? `Location: ${student.location}, ${student.country || ""}` : "";

    parts.push(`Profile for ${name}. ${headline} ${bio} ${location}`);

    if (student.educations && student.educations.length > 0) {
      const edus = student.educations
        .map(
          (e: any) =>
            `${e.degree || ""} in ${e.fieldOfStudy || ""} from ${e.institution || ""} (GPA: ${e.gpa || "N/A"}/${e.gpaScale || 4.0})`
        )
        .join("; ");
      parts.push(`Education: ${edus}`);
    }

    if (student.studentSkills && student.studentSkills.length > 0) {
      const sks = student.studentSkills
        .map((s: any) => `${s.skill?.name || s.skillId || ""} (${s.level || "Intermediate"}, ${s.yearsExperience || 1} yrs)`)
        .join(", ");
      parts.push(`Skills: ${sks}`);
    }

    if (student.experiences && student.experiences.length > 0) {
      const exps = student.experiences
        .map((e: any) => `${e.position} at ${e.organization}: ${e.description || ""}`)
        .join("; ");
      parts.push(`Work Experience: ${exps}`);
    }

    if (student.projects && student.projects.length > 0) {
      const projs = student.projects
        .map((p: any) => `${p.name}: ${p.description || ""} (Tech: ${p.technologies || ""})`)
        .join("; ");
      parts.push(`Projects: ${projs}`);
    }

    if (student.certifications && student.certifications.length > 0) {
      const certs = student.certifications.map((c: any) => `${c.name} by ${c.issuer || ""}`).join(", ");
      parts.push(`Certifications: ${certs}`);
    }

    return parts.join("\n\n").trim();
  }

  buildOpportunityEmbeddingText(opp: any): string {
    const parts: string[] = [];

    parts.push(`Opportunity: ${opp.title} (${opp.type}) at ${opp.organization}`);
    if (opp.location) {
      parts.push(`Location: ${opp.location} ${opp.isRemote ? "(Remote Available)" : ""}`);
    }
    if (opp.description) {
      parts.push(`Overview: ${opp.description}`);
    }
    if (opp.responsibilities) {
      parts.push(`Responsibilities: ${opp.responsibilities}`);
    }

    if (opp.requirements) {
      const r = opp.requirements;
      const reqList: string[] = [];
      if (r.minGpa) reqList.push(`Min GPA: ${r.minGpa}/${r.minGpaScale || 4.0}`);
      if (r.requiredDegrees) reqList.push(`Required Degrees: ${r.requiredDegrees}`);
      if (r.minExperienceYears) reqList.push(`Min Experience: ${r.minExperienceYears} years`);
      if (reqList.length > 0) {
        parts.push(`Eligibility Requirements: ${reqList.join(", ")}`);
      }
    }

    if (opp.skills && opp.skills.length > 0) {
      const reqSkills = opp.skills
        .filter((s: any) => s.requirementType === "required")
        .map((s: any) => s.skill?.name || s.skillId);
      const prefSkills = opp.skills
        .filter((s: any) => s.requirementType === "preferred")
        .map((s: any) => s.skill?.name || s.skillId);

      if (reqSkills.length > 0) parts.push(`Required Skills: ${reqSkills.join(", ")}`);
      if (prefSkills.length > 0) parts.push(`Preferred Skills: ${prefSkills.join(", ")}`);
    }

    return parts.join("\n\n").trim();
  }
}

export const profileService = new ProfileService();
