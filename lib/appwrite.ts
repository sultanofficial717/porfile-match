import { Client, Account, Databases, Storage, ID, Query } from "appwrite";

// ─── Appwrite Configuration ───────────────────────────────────────────────────

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
export const APPWRITE_PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6ab53d41002dc45e850e";

// Database & Collection IDs
export const DATABASE_ID = "profile-matcher";
export const COLLECTIONS = {
  PROFILES: "profiles",
  STUDENT_PROFILES: "student-profiles",
  EXPERIENCES: "experiences",
  PROJECTS: "projects",
  RECRUITER_PROFILES: "recruiter-profiles",
  ROLES: "roles",
  MATCHES: "matches",
} as const;

// Storage
export const BUCKET_ID = "uploads";

// ─── Client Setup ─────────────────────────────────────────────────────────────

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client, ID, Query };
