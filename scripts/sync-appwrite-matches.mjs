import { Client, Databases, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6ab53d41002dc45e850e")
  .setKey("standard_5a175dff8abcc380a8d7613a2cd41125375e83c569fdd8274983a7e089703f4b11cb90eaa888e00260331160b6beeea28c41ebc176e62fe74db06ed5056c94ce1c4f51a368189463033ca16e2ed6337bd5b30e4abe113af52ff77f07d72381b0b6349ebf7168aae412839af646ce13fd47d8ae093610e2db7260fc1e98b05a32");

const db = new Databases(client);
const DATABASE_ID = "profile-matcher";

function computeMatchScore(studentSkills, roleSkills, student, role) {
  const normStudent = (studentSkills || []).map(s => s.toLowerCase().trim());
  const normRole = (roleSkills || []).map(s => s.toLowerCase().trim());

  const overlap = normStudent.filter(s => normRole.includes(s));
  const skillScore = normRole.length > 0 ? (overlap.length / normRole.length) * 100 : 50;

  let educationScore = 50;
  if (student.degree && role.description) {
    const degWords = student.degree.toLowerCase().split(/\s+/);
    const descWords = role.description.toLowerCase().split(/\s+/);
    const eduOverlap = degWords.filter(w => descWords.includes(w));
    educationScore = Math.min(100, 50 + eduOverlap.length * 15);
  }

  let locationScore = 50;
  if (student.workMode === "any" || !student.workMode) locationScore = 80;
  else if (role.workMode === student.workMode) locationScore = 100;
  else if (role.workMode === "remote" || student.workMode === "remote") locationScore = 70;

  let experienceScore = (role.experienceLevel === "entry" || role.experienceLevel === "any") ? 90 : 60;

  let industryScore = 50;
  if (student.preferredIndustry && role.description && role.description.toLowerCase().includes(student.preferredIndustry.toLowerCase())) {
    industryScore = 90;
  }

  const finalScore = Math.round(
    skillScore * 0.4 +
    educationScore * 0.2 +
    locationScore * 0.15 +
    experienceScore * 0.15 +
    industryScore * 0.1
  );

  const reasons = [];
  if (overlap.length > 0) reasons.push(`${overlap.length}/${normRole.length} skills matched`);
  if (educationScore > 60) reasons.push("Education aligns with role");
  if (locationScore > 70) reasons.push("Location/work mode compatible");
  if (experienceScore > 70) reasons.push("Experience level fits");

  return { score: Math.min(100, finalScore), skillOverlap: overlap, reasons };
}

async function run() {
  console.log("🔄 Fetching students and roles from Appwrite...");
  const studentsRes = await db.listDocuments(DATABASE_ID, "student-profiles", [Query.limit(100)]);
  const rolesRes = await db.listDocuments(DATABASE_ID, "roles", [Query.limit(100)]);
  const existingMatchesRes = await db.listDocuments(DATABASE_ID, "matches", [Query.limit(100)]);

  console.log(`Found ${studentsRes.documents.length} students, ${rolesRes.documents.length} roles, ${existingMatchesRes.documents.length} existing matches.`);

  let created = 0;
  let updated = 0;

  for (const student of studentsRes.documents) {
    for (const role of rolesRes.documents) {
      const match = computeMatchScore(student.skills, role.requiredSkills, student, role);
      console.log(`Match score between [Student: ${student.userId}] and [Role: ${role.title}]: ${match.score}%`);

      const existing = existingMatchesRes.documents.find(
        m => m.studentProfileId === student.$id && m.roleId === role.$id
      );

      if (existing) {
        await db.updateDocument(DATABASE_ID, "matches", existing.$id, {
          matchScore: match.score,
          skillOverlap: match.skillOverlap,
          matchReasons: match.reasons,
        });
        updated++;
      } else {
        await db.createDocument(
          DATABASE_ID,
          "matches",
          ID.unique(),
          {
            studentProfileId: student.$id,
            roleId: role.$id,
            recruiterProfileId: role.recruiterProfileId,
            matchScore: match.score,
            skillOverlap: match.skillOverlap,
            matchReasons: match.reasons,
            status: "new",
          },
          [
            `read("any")`,
            `read("users")`,
            `update("users")`,
            `delete("users")`,
          ]
        );
        created++;
      }
    }
  }

  console.log(`\n🎉 Matching complete! Created ${created} matches, updated ${updated} matches.`);
}

run().catch(console.error);
