import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initializing system settings and cleaning all synthetic data...");

  // Clean existing tables in proper order
  await prisma.modelEvaluationFeedback.deleteMany();
  await prisma.experimentResult.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.match.deleteMany();
  await prisma.application.deleteMany();
  await prisma.opportunityRequirement.deleteMany();
  await prisma.opportunitySkill.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.leadership.deleteMany();
  await prisma.language.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.communityWork.deleteMany();
  await prisma.project.deleteMany();
  await prisma.course.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.studentSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.recruiterProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.scoringConfig.deleteMany();

  // 1. System Default Scoring Configuration
  await prisma.scoringConfig.create({
    data: {
      name: "Standard MVP Weighted Scoring",
      semanticWeight: 0.40,
      skillWeight: 0.20,
      experienceWeight: 0.15,
      educationWeight: 0.10,
      completenessWeight: 0.10,
      otherWeight: 0.05,
      notificationThreshold: 92.0,
      isActive: true,
    },
  });

  // 2. Default System Admin (Required for system verification and settings)
  await prisma.user.create({
    data: {
      email: "admin@match.ai",
      name: "System Administrator",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log("✅ System initialization completed! Database is clean and ready for real user data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
