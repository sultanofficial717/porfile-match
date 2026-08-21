import { prisma } from "../db/prisma";

async function main() {
  console.log("Seeding MatchAI backend database...");

  // 1. Create Default Admin Profile if not exists
  const admin = await prisma.profile.upsert({
    where: { email: "admin@match.ai" },
    update: {},
    create: {
      email: "admin@match.ai",
      fullName: "System Administrator",
      role: "admin",
    },
  });
  console.log(`Admin account ready: ${admin.email}`);

  // 2. Canonical skills list
  const canonicalSkills = [
    "Python",
    "TypeScript",
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "FastAPI",
    "PostgreSQL",
    "SQLite",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "TensorFlow",
    "Data Science",
    "Natural Language Processing",
    "Docker",
    "Kubernetes",
    "AWS",
    "Git",
    "Tailwind CSS",
    "SQL",
    "Java",
    "C++",
    "Go",
    "Rust",
  ];

  for (const name of canonicalSkills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${canonicalSkills.length} canonical skills.`);

  // 3. Demo Recruiter
  const recruiterUser = await prisma.profile.upsert({
    where: { email: "recruiter@deeptech.ai" },
    update: {},
    create: {
      email: "recruiter@deeptech.ai",
      fullName: "Sarah Jenkins",
      role: "recruiter",
    },
  });

  const recruiterProfile = await prisma.recruiterProfile.upsert({
    where: { id: recruiterUser.id },
    update: {},
    create: {
      id: recruiterUser.id,
      organizationName: "DeepTech AI Labs",
      organizationWebsite: "https://deeptech.example.com",
      jobTitle: "Head of AI Talent",
      status: "approved",
      approvedBy: admin.id,
      approvedAt: new Date(),
    },
  });

  // 4. Seed 3 Verified Opportunities
  const opp1 = await prisma.opportunity.upsert({
    where: { id: "opp-ai-intern-01" },
    update: {},
    create: {
      id: "opp-ai-intern-01",
      recruiterId: recruiterProfile.id,
      title: "AI Research & Machine Learning Intern",
      type: "internship",
      organization: "DeepTech AI Labs",
      description: "Work on cutting-edge LLM alignment, embedding benchmark evaluation, and multimodal models.",
      responsibilities: "Implement PyTorch training pipelines, run semantic retrieval experiments, and optimize inference latency.",
      location: "Islamabad, Pakistan",
      isRemote: true,
      compensation: "$800 - $1,200 / month",
      applicationDeadline: new Date("2026-10-15"),
      applicationUrl: "https://deeptech.example.com/apply/ai-intern",
      status: "published",
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.opportunityRequirement.upsert({
    where: { opportunityId: opp1.id },
    update: {},
    create: {
      opportunityId: opp1.id,
      minGpa: 3.2,
      requiredDegrees: JSON.stringify(["Computer Science", "Software Engineering", "Artificial Intelligence", "Data Science"]),
      minExperienceYears: 0,
      minAcademicYear: 3,
    },
  });

  const opp2 = await prisma.opportunity.upsert({
    where: { id: "opp-fullstack-02" },
    update: {},
    create: {
      id: "opp-fullstack-02",
      recruiterId: recruiterProfile.id,
      title: "Junior Full-Stack Engineer (Next.js & TypeScript)",
      type: "job",
      organization: "DeepTech AI Labs",
      description: "Build reactive, high-performance web applications using Next.js 15, TypeScript, Tailwind, and Prisma ORM.",
      responsibilities: "Collaborate with product designers, build responsive UI components, and integrate backend REST APIs.",
      location: "Lahore, Pakistan",
      isRemote: true,
      compensation: "$1,500 - $2,200 / month",
      applicationDeadline: new Date("2026-11-01"),
      applicationUrl: "https://deeptech.example.com/apply/fullstack",
      status: "published",
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.opportunityRequirement.upsert({
    where: { opportunityId: opp2.id },
    update: {},
    create: {
      opportunityId: opp2.id,
      minGpa: 3.0,
      requiredDegrees: JSON.stringify(["Computer Science", "Software Engineering", "Information Technology"]),
      minExperienceYears: 1.0,
      minAcademicYear: 4,
    },
  });

  // 5. Seed Demo Student
  const studentUser = await prisma.profile.upsert({
    where: { email: "ali@student.edu" },
    update: {},
    create: {
      email: "ali@student.edu",
      fullName: "Ali Rehman",
      role: "student",
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { id: studentUser.id },
    update: {},
    create: {
      id: studentUser.id,
      headline: "CS Senior | PyTorch & Full-Stack AI Developer",
      bio: "Passionate computer science undergraduate focusing on applied Machine Learning, PyTorch, Next.js, and semantic embeddings.",
      location: "Islamabad",
      country: "Pakistan",
      profileCompletionPct: 85,
    },
  });

  await prisma.education.upsert({
    where: { id: "edu-ali-01" },
    update: {},
    create: {
      id: "edu-ali-01",
      studentId: studentProfile.id,
      institution: "FAST-NUCES",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      gpa: 3.65,
      gpaScale: 4.0,
      isCurrent: true,
    },
  });

  await prisma.studentPreference.upsert({
    where: { studentId: studentProfile.id },
    update: {},
    create: {
      studentId: studentProfile.id,
      opportunityTypes: JSON.stringify(["job", "internship", "fellowship"]),
      workMode: "any",
      preferredLocations: JSON.stringify(["Islamabad", "Remote"]),
      minMatchThreshold: 90,
      emailNotificationsEnabled: true,
    },
  });

  console.log("Seeded demo opportunities and demo student Ali Rehman (ali@student.edu)");
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
