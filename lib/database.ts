import {
  databases,
  storage,
  DATABASE_ID,
  COLLECTIONS,
  BUCKET_ID,
  ID,
  Query,
  APPWRITE_ENDPOINT,
  APPWRITE_PROJECT_ID,
} from "@/lib/appwrite";
import type {
  StudentProfile,
  RecruiterProfile,
  Experience,
  Project,
  Role,
  Match,
  Profile,
  MatchWithDetails,
} from "@/lib/types";

// ─── Profiles ─────────────────────────────────────────────────────────────────

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    return (res.documents[0] as unknown as Profile) ?? null;
  } catch {
    return null;
  }
}

// ─── Student Profiles ─────────────────────────────────────────────────────────

export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.STUDENT_PROFILES, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    return (res.documents[0] as unknown as StudentProfile) ?? null;
  } catch {
    return null;
  }
}

export async function upsertStudentProfile(
  userId: string,
  data: Partial<StudentProfile>,
  existingId?: string
): Promise<StudentProfile> {
  const payload = { ...data, userId };
  if (existingId) {
    return (await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.STUDENT_PROFILES,
      existingId,
      payload
    )) as unknown as StudentProfile;
  }
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.STUDENT_PROFILES,
    ID.unique(),
    payload,
    [
      `read("user:${userId}")`,
      `update("user:${userId}")`,
      `delete("user:${userId}")`,
      `read("any")`,
    ]
  )) as unknown as StudentProfile;
}

// ─── Experiences ──────────────────────────────────────────────────────────────

export async function getExperiences(studentProfileId: string): Promise<Experience[]> {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.EXPERIENCES, [
    Query.equal("studentProfileId", studentProfileId),
    Query.limit(50),
  ]);
  return res.documents as unknown as Experience[];
}

export async function createExperience(
  data: Omit<Experience, keyof import("appwrite").Models.Document>,
  userId: string
): Promise<Experience> {
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.EXPERIENCES,
    ID.unique(),
    data,
    [`read("any")`, `read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
  )) as unknown as Experience;
}

export async function updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
  return (await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.EXPERIENCES,
    id,
    data
  )) as unknown as Experience;
}

export async function deleteExperience(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.EXPERIENCES, id);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function getProjects(studentProfileId: string): Promise<Project[]> {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROJECTS, [
    Query.equal("studentProfileId", studentProfileId),
    Query.limit(50),
  ]);
  return res.documents as unknown as Project[];
}

export async function createProject(
  data: Omit<Project, keyof import("appwrite").Models.Document>,
  userId: string
): Promise<Project> {
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.PROJECTS,
    ID.unique(),
    data,
    [`read("any")`, `read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
  )) as unknown as Project;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  return (await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.PROJECTS,
    id,
    data
  )) as unknown as Project;
}

export async function deleteProject(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id);
}

// ─── Recruiter Profiles ───────────────────────────────────────────────────────

export async function getRecruiterProfile(userId: string): Promise<RecruiterProfile | null> {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RECRUITER_PROFILES, [
      Query.equal("userId", userId),
      Query.limit(1),
    ]);
    return (res.documents[0] as unknown as RecruiterProfile) ?? null;
  } catch {
    return null;
  }
}

export async function upsertRecruiterProfile(
  userId: string,
  data: Partial<RecruiterProfile>,
  existingId?: string
): Promise<RecruiterProfile> {
  const payload = { ...data, userId };
  if (existingId) {
    return (await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RECRUITER_PROFILES,
      existingId,
      payload
    )) as unknown as RecruiterProfile;
  }
  return (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.RECRUITER_PROFILES,
    ID.unique(),
    payload as Record<string, any>,
    [
      `read("user:${userId}")`,
      `update("user:${userId}")`,
      `delete("user:${userId}")`,
      `read("any")`,
    ]
  )) as unknown as RecruiterProfile;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export async function getRoles(recruiterProfileId?: string): Promise<Role[]> {
  const queries = [Query.limit(100), Query.orderDesc("$createdAt")];
  if (recruiterProfileId) {
    queries.push(Query.equal("recruiterProfileId", recruiterProfileId));
  }
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ROLES, queries);
  return res.documents as unknown as Role[];
}

export async function getRole(roleId: string): Promise<Role | null> {
  try {
    return (await databases.getDocument(DATABASE_ID, COLLECTIONS.ROLES, roleId)) as unknown as Role;
  } catch {
    return null;
  }
}

export async function createRole(
  data: Omit<Role, keyof import("appwrite").Models.Document>,
  userId: string
): Promise<Role> {
  const role = (await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.ROLES,
    ID.unique(),
    { ...data, isActive: true },
    [`read("any")`, `read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
  )) as unknown as Role;

  // Automatically trigger matching for this newly published role
  try {
    await generateMatchesForRole(role.$id);
  } catch (err) {
    console.error("Auto-matching failed after role creation:", err);
  }

  return role;
}

export async function updateRole(id: string, data: Partial<Role>): Promise<Role> {
  return (await databases.updateDocument(
    DATABASE_ID,
    COLLECTIONS.ROLES,
    id,
    data
  )) as unknown as Role;
}

export async function deleteRole(id: string): Promise<void> {
  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.ROLES, id);
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function getMatchesForStudent(studentProfileId: string): Promise<MatchWithDetails[]> {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MATCHES, [
    Query.equal("studentProfileId", studentProfileId),
    Query.orderDesc("matchScore"),
    Query.limit(100),
  ]);
  const matches = res.documents as unknown as Match[];

  // Hydrate with role + recruiter details
  const hydrated: MatchWithDetails[] = [];
  for (const m of matches) {
    const role = await getRole(m.roleId);
    let recruiterProfile: RecruiterProfile | null = null;
    let profile: Profile | null = null;
    if (role) {
      const rpRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RECRUITER_PROFILES, [
        Query.equal("$id", m.recruiterProfileId),
        Query.limit(1),
      ]);
      recruiterProfile = (rpRes.documents[0] as unknown as RecruiterProfile) ?? null;
      if (recruiterProfile) {
        profile = await getProfileByUserId(recruiterProfile.userId);
      }
    }
    hydrated.push({
      ...m,
      role: role ?? undefined,
      recruiterProfile: recruiterProfile ?? undefined,
      profile: profile ?? undefined,
    });
  }
  return hydrated;
}

export async function getMatchesForRole(roleId: string): Promise<MatchWithDetails[]> {
  const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MATCHES, [
    Query.equal("roleId", roleId),
    Query.orderDesc("matchScore"),
    Query.limit(100),
  ]);
  const matches = res.documents as unknown as Match[];

  const hydrated: MatchWithDetails[] = [];
  for (const m of matches) {
    let sp: StudentProfile | null = null;
    let profile: Profile | null = null;
    try {
      sp = (await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.STUDENT_PROFILES,
        m.studentProfileId
      )) as unknown as StudentProfile;
      if (sp) profile = await getProfileByUserId(sp.userId);
    } catch {
      /* skip */
    }
    hydrated.push({ ...m, studentProfile: sp ?? undefined, profile: profile ?? undefined });
  }
  return hydrated;
}

export async function updateMatchStatus(matchId: string, status: Match["status"]): Promise<void> {
  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.MATCHES, matchId, { status });
  } catch (clientErr) {
    console.warn("Client SDK update failed, falling back to server route:", clientErr);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw clientErr;
    }
  }
}

export async function applyToRole(
  studentProfileId: string,
  roleId: string,
  applicationData: {
    coverNote: string;
    relevantExperience: string;
    earliestStartDate: string;
    workAuthorization: string;
    preferredWorkMode: string;
    portfolioOrGithub: string;
    phoneNumber: string;
    additionalComments?: string;
  }
): Promise<void> {
  const role = await getRole(roleId);
  if (!role) throw new Error("Role not found");

  const studentProfile = (await databases.getDocument(
    DATABASE_ID,
    COLLECTIONS.STUDENT_PROFILES,
    studentProfileId
  )) as unknown as StudentProfile;
  if (!studentProfile) throw new Error("Student profile not found");

  const existingRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MATCHES, [
    Query.equal("studentProfileId", studentProfileId),
    Query.equal("roleId", roleId),
    Query.limit(1),
  ]);

  const scoreResult = computeMatchScore(
    studentProfile.skills || [],
    role.requiredSkills || [],
    studentProfile,
    role
  );

  const applicationPayload = "APPLICATION_DATA:" + JSON.stringify(applicationData);
  const appliedMarker = "APPLIED_ON:" + new Date().toISOString();

  if (existingRes.documents.length > 0) {
    const existing = existingRes.documents[0] as unknown as Match;
    const existingReasons = (existing.matchReasons || []).filter(
      (r) => !r.startsWith("APPLICATION_DATA:") && !r.startsWith("APPLIED_ON:")
    );
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.MATCHES, existing.$id, {
      status: "viewed",
      matchReasons: [appliedMarker, applicationPayload, ...existingReasons],
    });
  } else {
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.MATCHES,
      ID.unique(),
      {
        studentProfileId,
        roleId,
        recruiterProfileId: role.recruiterProfileId,
        matchScore: scoreResult.score,
        skillOverlap: scoreResult.skillOverlap,
        matchReasons: [appliedMarker, applicationPayload, ...scoreResult.reasons],
        status: "viewed",
      },
      [
        `read("any")`,
        `read("users")`,
        `update("users")`,
        `delete("users")`,
      ]
    );
  }
}

export function getApplicationDataFromMatch(match: Match): {
  isApplied: boolean;
  appliedDate?: string;
  applicationDetails?: {
    coverNote: string;
    relevantExperience: string;
    earliestStartDate: string;
    workAuthorization: string;
    preferredWorkMode: string;
    portfolioOrGithub: string;
    phoneNumber: string;
    additionalComments?: string;
  };
} {
  const reasons = match.matchReasons || [];
  const appliedMarker = reasons.find((r) => r.startsWith("APPLIED_ON:"));
  const appDataMarker = reasons.find((r) => r.startsWith("APPLICATION_DATA:"));

  if (!appliedMarker && !appDataMarker) {
    return { isApplied: false };
  }

  let applicationDetails = undefined;
  if (appDataMarker) {
    try {
      applicationDetails = JSON.parse(appDataMarker.replace("APPLICATION_DATA:", ""));
    } catch {
      /* ignore */
    }
  }

  return {
    isApplied: true,
    appliedDate: appliedMarker ? appliedMarker.replace("APPLIED_ON:", "") : undefined,
    applicationDetails,
  };
}

// ─── File Upload ──────────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<string> {
  const result = await storage.createFile(BUCKET_ID, ID.unique(), file);
  return result.$id;
}

export function getFilePreviewUrl(fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

// ─── Matching Algorithm ───────────────────────────────────────────────────────

export function computeMatchScore(
  studentSkills: string[],
  roleRequiredSkills: string[],
  studentProfile: StudentProfile,
  role: Role
): { score: number; skillOverlap: string[]; reasons: string[] } {
  const normalizedStudentSkills = studentSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequiredSkills = roleRequiredSkills.map((s) => s.toLowerCase().trim());

  // Skills overlap (40% weight)
  const overlap = normalizedStudentSkills.filter((s) => normalizedRequiredSkills.includes(s));
  const skillScore =
    normalizedRequiredSkills.length > 0
      ? (overlap.length / normalizedRequiredSkills.length) * 100
      : 50;

  // Education relevance (20% weight)
  let educationScore = 50;
  if (studentProfile.degree && role.description) {
    const degreeWords = studentProfile.degree.toLowerCase().split(/\s+/);
    const descWords = role.description.toLowerCase().split(/\s+/);
    const eduOverlap = degreeWords.filter((w) => descWords.includes(w));
    educationScore = Math.min(100, 50 + eduOverlap.length * 15);
  }

  // Location match (15% weight)
  let locationScore = 50;
  if (studentProfile.workMode === "any" || !studentProfile.workMode) {
    locationScore = 80;
  } else if (role.workMode === studentProfile.workMode) {
    locationScore = 100;
  } else if (role.workMode === "remote" || studentProfile.workMode === "remote") {
    locationScore = 70;
  }

  // Experience level (15% weight)
  let experienceScore = 60;
  if (role.experienceLevel === "entry" || role.experienceLevel === "any") {
    experienceScore = 90;
  }

  // Industry preference (10% weight)
  let industryScore = 50;
  if (studentProfile.preferredIndustry && role.description) {
    if (role.description.toLowerCase().includes(studentProfile.preferredIndustry.toLowerCase())) {
      industryScore = 90;
    }
  }

  const finalScore = Math.round(
    skillScore * 0.4 +
      educationScore * 0.2 +
      locationScore * 0.15 +
      experienceScore * 0.15 +
      industryScore * 0.1
  );

  const reasons: string[] = [];
  if (overlap.length > 0)
    reasons.push(`${overlap.length}/${normalizedRequiredSkills.length} skills matched`);
  if (educationScore > 60) reasons.push("Education aligns with role");
  if (locationScore > 70) reasons.push("Location/work mode compatible");
  if (experienceScore > 70) reasons.push("Experience level fits");

  return {
    score: Math.min(100, finalScore),
    skillOverlap: overlap,
    reasons,
  };
}

// ─── Automated Matching Generation Functions ──────────────────────────────────

/**
 * Evaluates a single student against all active roles and creates/updates matches in Appwrite.
 */
export async function generateMatchesForStudent(studentProfileId: string): Promise<number> {
  try {
    const studentProfile = (await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.STUDENT_PROFILES,
      studentProfileId
    )) as unknown as StudentProfile;
    if (!studentProfile) return 0;

    const rolesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ROLES, [
      Query.equal("isActive", true),
      Query.limit(100),
    ]);
    const roles = rolesRes.documents as unknown as Role[];

    const existingMatchesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MATCHES, [
      Query.equal("studentProfileId", studentProfileId),
      Query.limit(100),
    ]);
    const existingMatches = existingMatchesRes.documents as unknown as Match[];

    let createdOrUpdated = 0;
    for (const role of roles) {
      const matchResult = computeMatchScore(
        studentProfile.skills || [],
        role.requiredSkills || [],
        studentProfile,
        role
      );

      const existing = existingMatches.find((m) => m.roleId === role.$id);
      if (existing) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.MATCHES, existing.$id, {
          matchScore: matchResult.score,
          skillOverlap: matchResult.skillOverlap,
          matchReasons: matchResult.reasons,
        });
        createdOrUpdated++;
      } else if (matchResult.score >= 35) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.MATCHES,
          ID.unique(),
          {
            studentProfileId: studentProfile.$id,
            roleId: role.$id,
            recruiterProfileId: role.recruiterProfileId,
            matchScore: matchResult.score,
            skillOverlap: matchResult.skillOverlap,
            matchReasons: matchResult.reasons,
            status: "new",
          },
          [
            `read("any")`,
            `read("users")`,
            `update("users")`,
            `delete("users")`,
          ]
        );
        createdOrUpdated++;
      }
    }
    return createdOrUpdated;
  } catch (err) {
    console.error("Error generating matches for student:", err);
    return 0;
  }
}

/**
 * Evaluates all student profiles against a single role and creates/updates matches in Appwrite.
 */
export async function generateMatchesForRole(roleId: string): Promise<number> {
  try {
    const role = (await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.ROLES,
      roleId
    )) as unknown as Role;
    if (!role) return 0;

    const studentsRes = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.STUDENT_PROFILES,
      [Query.limit(100)]
    );
    const students = studentsRes.documents as unknown as StudentProfile[];

    const existingMatchesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MATCHES, [
      Query.equal("roleId", roleId),
      Query.limit(100),
    ]);
    const existingMatches = existingMatchesRes.documents as unknown as Match[];

    let createdOrUpdated = 0;
    for (const student of students) {
      const matchResult = computeMatchScore(
        student.skills || [],
        role.requiredSkills || [],
        student,
        role
      );

      const existing = existingMatches.find((m) => m.studentProfileId === student.$id);
      if (existing) {
        await databases.updateDocument(DATABASE_ID, COLLECTIONS.MATCHES, existing.$id, {
          matchScore: matchResult.score,
          skillOverlap: matchResult.skillOverlap,
          matchReasons: matchResult.reasons,
        });
        createdOrUpdated++;
      } else if (matchResult.score >= 35) {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.MATCHES,
          ID.unique(),
          {
            studentProfileId: student.$id,
            roleId: role.$id,
            recruiterProfileId: role.recruiterProfileId,
            matchScore: matchResult.score,
            skillOverlap: matchResult.skillOverlap,
            matchReasons: matchResult.reasons,
            status: "new",
          },
          [
            `read("any")`,
            `read("users")`,
            `update("users")`,
            `delete("users")`,
          ]
        );
        createdOrUpdated++;
      }
    }
    return createdOrUpdated;
  } catch (err) {
    console.error("Error generating matches for role:", err);
    return 0;
  }
}

/**
 * Runs matching across all active roles and students platform-wide.
 */
export async function runAllMatches(): Promise<number> {
  try {
    const rolesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ROLES, [
      Query.equal("isActive", true),
      Query.limit(100),
    ]);
    const roles = rolesRes.documents as unknown as Role[];
    let total = 0;
    for (const r of roles) {
      total += await generateMatchesForRole(r.$id);
    }
    return total;
  } catch (err) {
    console.error("Error running all matches:", err);
    return 0;
  }
}
