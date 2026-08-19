import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database with realistic students, opportunities, and default scoring weights...");

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

  // 1. Scoring Config
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

  // 2. Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@match.ai",
      name: "Dr. Arshad Khan (Admin)",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Recruiter Users
  const recruiter1 = await prisma.user.create({
    data: {
      email: "recruiter@exampleai.com",
      name: "Sarah Jenkins",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "Example AI Labs",
          companyWebsite: "https://exampleai.com",
          position: "Lead Technical Recruiter",
          isVerified: true,
        },
      },
    },
  });

  const recruiter2 = await prisma.user.create({
    data: {
      email: "talent@datatech.io",
      name: "Tariq Malik",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "DataTech Global",
          companyWebsite: "https://datatech.io",
          position: "Head of Talent Acquisition",
          isVerified: true,
        },
      },
    },
  });

  const recruiter3 = await prisma.user.create({
    data: {
      email: "fellowships@highered.org",
      name: "Elena Rostova",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "Global Frontier Fellowships",
          companyWebsite: "https://highered.org",
          position: "Scholarship & Fellowship Director",
          isVerified: true,
        },
      },
    },
  });

  // 4. Students Data
  const studentsData = [
    {
      name: "Ali Rehman",
      email: "ali@student.edu",
      bio: "Final year CS student focusing on Deep Learning, NLP, and Computer Vision. Passionate about building production-grade ML pipelines.",
      location: "Islamabad",
      gpa: 3.62,
      university: "NUST Islamabad",
      degree: "BS Computer Science",
      graduationYear: 2025,
      yearsExperience: 1.5,
      workAuthorization: "Pakistan",
      githubUrl: "https://github.com/alirehman",
      linkedinUrl: "https://linkedin.com/in/alirehman",
      portfolioUrl: "https://alirehman.dev",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      skills: [
        { skillName: "Python", level: "Advanced", yearsExperience: 3 },
        { skillName: "Machine Learning", level: "Intermediate", yearsExperience: 2 },
        { skillName: "PyTorch", level: "Intermediate", yearsExperience: 1.5 },
        { skillName: "TensorFlow", level: "Intermediate", yearsExperience: 1.5 },
        { skillName: "SQL", level: "Intermediate", yearsExperience: 2 },
        { skillName: "FastAPI", level: "Intermediate", yearsExperience: 1 },
        { skillName: "Docker", level: "Beginner", yearsExperience: 0.5 },
      ],
      educations: [
        {
          institution: "National University of Sciences & Technology (NUST)",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          gpa: 3.62,
          startYear: 2021,
          endYear: 2025,
          isCurrent: true,
          courses: "Machine Learning, Deep Learning, NLP, Distributed Systems, Data Structures & Algorithms",
          honors: "Dean's Honor List (Fall 2022, Spring 2023)",
        },
      ],
      experiences: [
        {
          title: "AI Engineering Intern",
          company: "NeuralCraft Solutions",
          location: "Islamabad",
          type: "Internship",
          startDate: "2024-06",
          endDate: "2024-09",
          isCurrent: false,
          description: "Developed transformer-based sequence models and fine-tuned LLMs for document intelligence, reducing extraction error by 23%.",
          years: 0.3,
          months: 3,
        },
        {
          title: "Undergraduate Research Assistant",
          company: "TUKL-NUST R&D Lab",
          location: "Islamabad",
          type: "Part-time",
          startDate: "2023-10",
          endDate: "2024-05",
          isCurrent: false,
          description: "Researched multi-modal contrastive learning models for biomedical image segmentation.",
          years: 0.7,
          months: 8,
        },
      ],
      projects: [
        {
          title: "MedVision: Pneumonia Detection via ViT",
          description: "Vision Transformer fine-tuned on chest X-rays with 94.8% F1-score and FastAPI REST backend.",
          technologies: "Python, PyTorch, FastAPI, Docker, OpenCV",
        },
        {
          title: "Enterprise Semantic Document Search",
          description: "RAG pipeline using hybrid dense-sparse vector indexing and LangChain.",
          technologies: "Python, Qwen Embeddings, ChromaDB, Next.js",
        },
      ],
      certifications: [
        { name: "Deep Learning Specialization", issuer: "DeepLearning.AI / Coursera" },
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services" },
      ],
      communityWork: [
        { title: "Lead AI Workshop Instructor", organization: "Google Developer Student Clubs (GDSC)", description: "Organized 4 hands-on workshops on PyTorch for 120+ undergraduates." },
      ],
      achievements: [
        { title: "1st Place - National AI Hackathon 2024", type: "Hackathon", issuer: "Ministry of IT", date: "2024-03" },
      ],
      languages: [
        { language: "English", proficiency: "Fluent" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
    {
      name: "Sara Qureshi",
      email: "sara@student.edu",
      bio: "Full-stack engineer with strong React, Next.js, and TypeScript fundamentals. 2 years of freelance and startup software engineering experience.",
      location: "Lahore",
      gpa: 3.85,
      university: "FAST-NUCES Lahore",
      degree: "BS Software Engineering",
      graduationYear: 2024,
      yearsExperience: 2.0,
      workAuthorization: "Pakistan",
      githubUrl: "https://github.com/saraqureshi",
      linkedinUrl: "https://linkedin.com/in/saraqureshi",
      portfolioUrl: "https://saraq.dev",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      skills: [
        { skillName: "TypeScript", level: "Expert", yearsExperience: 2.5 },
        { skillName: "React", level: "Expert", yearsExperience: 3 },
        { skillName: "Next.js", level: "Advanced", yearsExperience: 2 },
        { skillName: "Node.js", level: "Advanced", yearsExperience: 2 },
        { skillName: "PostgreSQL", level: "Intermediate", yearsExperience: 2 },
        { skillName: "Tailwind CSS", level: "Expert", yearsExperience: 3 },
        { skillName: "GraphQL", level: "Intermediate", yearsExperience: 1 },
      ],
      educations: [
        {
          institution: "FAST-NUCES Lahore",
          degree: "Bachelor of Science",
          fieldOfStudy: "Software Engineering",
          gpa: 3.85,
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          courses: "Software Architecture, Web Technologies, Database Systems, Cloud Computing",
          honors: "Gold Medalist (Batch of 2024)",
        },
      ],
      experiences: [
        {
          title: "Frontend Engineer",
          company: "SaaSify Inc.",
          location: "Lahore / Remote",
          type: "Full-time",
          startDate: "2024-01",
          endDate: "2024-11",
          isCurrent: false,
          description: "Architected modern Next.js 14 design system used by 50,000+ monthly active users, improving Core Web Vitals score to 98.",
          years: 0.9,
          months: 11,
        },
      ],
      projects: [
        {
          title: "TaskFlow: Realtime Collaborative Workspace",
          description: "Realtime Kanban & Notion-style editor with WebSockets, optimistic UI updates, and PostgreSQL.",
          technologies: "Next.js, TypeScript, Tailwind, Prisma, Socket.io",
        },
      ],
      certifications: [
        { name: "Meta Certified Front-End Developer", issuer: "Meta" },
      ],
      communityWork: [
        { title: "Mentor", organization: "Women in Tech Pakistan", description: "Mentored 15 junior female developers in web development." },
      ],
      achievements: [
        { title: "Vice Chancellor's Academic Excellence Award", type: "Award", issuer: "FAST-NUCES", date: "2024-06" },
      ],
      languages: [
        { language: "English", proficiency: "Fluent" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
    {
      name: "Ahmed Hassan",
      email: "ahmed@student.edu",
      bio: "Data Analyst & Junior Data Scientist adept in SQL, Python data stack (Pandas, Scikit-Learn), and BI dashboards.",
      location: "Karachi",
      gpa: 3.15,
      university: "Karachi University",
      degree: "BS Data Science",
      graduationYear: 2025,
      yearsExperience: 0.8,
      workAuthorization: "Pakistan",
      skills: [
        { skillName: "Python", level: "Intermediate", yearsExperience: 1.5 },
        { skillName: "SQL", level: "Advanced", yearsExperience: 2 },
        { skillName: "Pandas", level: "Intermediate", yearsExperience: 1.5 },
        { skillName: "Tableau", level: "Intermediate", yearsExperience: 1 },
        { skillName: "Power BI", level: "Intermediate", yearsExperience: 1 },
        { skillName: "Statistics", level: "Intermediate", yearsExperience: 2 },
      ],
      educations: [
        {
          institution: "University of Karachi (UBIT)",
          degree: "Bachelor of Science",
          fieldOfStudy: "Data Science",
          gpa: 3.15,
          startYear: 2021,
          endYear: 2025,
          isCurrent: true,
          courses: "Applied Statistics, Predictive Modeling, Big Data, SQL Databases",
        },
      ],
      experiences: [
        {
          title: "Data Analytics Intern",
          company: "FinMetrics Global",
          location: "Karachi",
          type: "Internship",
          startDate: "2024-06",
          endDate: "2024-09",
          isCurrent: false,
          description: "Built automated customer churn dashboards in Power BI and SQL data extraction scripts.",
          years: 0.3,
          months: 3,
        },
      ],
      projects: [
        {
          title: "E-Commerce Customer Segmentation",
          description: "RFM analysis and K-Means clustering on 500k transaction records with interactive Streamlit visualization.",
          technologies: "Python, Scikit-Learn, Streamlit, Pandas",
        },
      ],
      certifications: [
        { name: "Google Data Analytics Professional Certificate", issuer: "Google" },
      ],
      languages: [
        { language: "English", proficiency: "Professional" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
    {
      name: "Zainab Tariq",
      email: "zainab@student.edu",
      bio: "Cybersecurity enthusiast, Certified Ethical Hacker in training. Experience in penetration testing, network security, and vulnerability assessment.",
      location: "Islamabad",
      gpa: 3.45,
      university: "Air University Islamabad",
      degree: "BS Cyber Security",
      graduationYear: 2025,
      yearsExperience: 1.0,
      workAuthorization: "Pakistan",
      skills: [
        { skillName: "Cybersecurity", level: "Advanced", yearsExperience: 2 },
        { skillName: "Penetration Testing", level: "Intermediate", yearsExperience: 1.5 },
        { skillName: "Linux", level: "Advanced", yearsExperience: 2.5 },
        { skillName: "Python", level: "Intermediate", yearsExperience: 2 },
        { skillName: "Wireshark", level: "Advanced", yearsExperience: 2 },
        { skillName: "Burp Suite", level: "Intermediate", yearsExperience: 1.5 },
      ],
      educations: [
        {
          institution: "Air University",
          degree: "Bachelor of Science",
          fieldOfStudy: "Cyber Security",
          gpa: 3.45,
          startYear: 2021,
          endYear: 2025,
          isCurrent: true,
          courses: "Network Security, Cryptography, Digital Forensics, Ethical Hacking",
        },
      ],
      experiences: [
        {
          title: "SOC Analyst Intern",
          company: "CyberGuard Tech",
          location: "Islamabad",
          type: "Internship",
          startDate: "2024-05",
          endDate: "2024-08",
          isCurrent: false,
          description: "Monitored SIEM alert pipelines, performed triage on 400+ security alerts, and drafted incident reports.",
          years: 0.3,
          months: 3,
        },
      ],
      projects: [
        {
          title: "Automated Web Vulnerability Scanner",
          description: "Python CLI tool performing OWASP Top 10 checks against test environments.",
          technologies: "Python, BeautifulSoup, Requests, Docker",
        },
      ],
      certifications: [
        { name: "CompTIA Security+", issuer: "CompTIA" },
      ],
      languages: [
        { language: "English", proficiency: "Fluent" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
    {
      name: "Bilal Chaudhry",
      email: "bilal@student.edu",
      bio: "Junior developer passionate about AI and mobile apps. Currently building foundational programming skills.",
      location: "Rawalpindi",
      gpa: 2.55, // Low GPA candidate to test Hard Eligibility GPA rejection!
      university: "COMSATS Islamabad",
      degree: "BS Computer Science",
      graduationYear: 2026,
      yearsExperience: 0.2,
      workAuthorization: "Pakistan",
      skills: [
        { skillName: "Python", level: "Intermediate", yearsExperience: 1 },
        { skillName: "Machine Learning", level: "Beginner", yearsExperience: 0.5 },
        { skillName: "PyTorch", level: "Beginner", yearsExperience: 0.3 },
        { skillName: "JavaScript", level: "Beginner", yearsExperience: 0.5 },
      ],
      educations: [
        {
          institution: "COMSATS University Islamabad",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          gpa: 2.55,
          startYear: 2022,
          endYear: 2026,
          isCurrent: true,
        },
      ],
      experiences: [],
      projects: [
        {
          title: "Basic Handwritten Digit Classifier",
          description: "MNIST classifier built using PyTorch CNN.",
          technologies: "Python, PyTorch",
        },
      ],
      certifications: [],
      languages: [
        { language: "English", proficiency: "Intermediate" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
    {
      name: "Fatima Noor",
      email: "fatima@student.edu",
      bio: "Graduate research student in Computer Vision and Robotics. Published author with strong algorithmic and mathematics foundation.",
      location: "Lahore",
      gpa: 3.92,
      university: "LUMS Lahore",
      degree: "MS Computer Science",
      graduationYear: 2024,
      yearsExperience: 2.5,
      workAuthorization: "Pakistan",
      skills: [
        { skillName: "Python", level: "Expert", yearsExperience: 4 },
        { skillName: "Machine Learning", level: "Expert", yearsExperience: 3 },
        { skillName: "PyTorch", level: "Expert", yearsExperience: 3 },
        { skillName: "Computer Vision", level: "Expert", yearsExperience: 2.5 },
        { skillName: "C++", level: "Advanced", yearsExperience: 3 },
        { skillName: "OpenCV", level: "Advanced", yearsExperience: 2.5 },
      ],
      educations: [
        {
          institution: "Lahore University of Management Sciences (LUMS)",
          degree: "Master of Science",
          fieldOfStudy: "Computer Science",
          gpa: 3.92,
          startYear: 2022,
          endYear: 2024,
          isCurrent: false,
          courses: "Advanced Computer Vision, Deep Generative Models, Statistical Learning",
          honors: "Dean's Honor Roll, Graduate Research Fellowship Award",
        },
      ],
      experiences: [
        {
          title: "Graduate Research Assistant",
          company: "LUMS CV Lab",
          location: "Lahore",
          type: "Full-time",
          startDate: "2022-09",
          endDate: "2024-06",
          isCurrent: false,
          description: "Lead researcher on autonomous drone obstacle avoidance using lightweight neural networks.",
          years: 1.8,
          months: 20,
        },
      ],
      projects: [
        {
          title: "Realtime 3D Object Reconstruction",
          description: "NeRF-based neural radiance fields reconstruction pipeline running on embedded GPUs.",
          technologies: "Python, PyTorch, CUDA, C++",
        },
      ],
      certifications: [
        { name: "NVIDIA Certified Deep Learning Specialist", issuer: "NVIDIA" },
      ],
      communityWork: [
        { title: "Co-organizer", organization: "AI Research Circle Pakistan", description: "Hosted monthly paper reading groups." },
      ],
      achievements: [
        { title: "Best Paper Award - CVPR Workshop", type: "Award", issuer: "CVPR", date: "2024-06" },
      ],
      languages: [
        { language: "English", proficiency: "Fluent" },
        { language: "Urdu", proficiency: "Native" },
      ],
    },
  ];

  // Insert students
  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        role: "STUDENT",
        avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
      },
    });

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        bio: s.bio,
        location: s.location,
        gpa: s.gpa,
        university: s.university,
        degree: s.degree,
        graduationYear: s.graduationYear,
        yearsExperience: s.yearsExperience,
        workAuthorization: s.workAuthorization,
        githubUrl: s.githubUrl,
        linkedinUrl: s.linkedinUrl,
        portfolioUrl: s.portfolioUrl,
        profileCompleteness: 85,
      },
    });

    // Add skills
    for (const sk of s.skills) {
      await prisma.studentSkill.create({
        data: {
          studentProfileId: studentProfile.id,
          skillName: sk.skillName,
          level: sk.level,
          yearsExperience: sk.yearsExperience || 1.0,
        },
      });
    }

    // Add educations
    for (const edu of s.educations) {
      await prisma.education.create({
        data: {
          studentProfileId: studentProfile.id,
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy,
          gpa: edu.gpa,
          startYear: edu.startYear,
          endYear: edu.endYear,
          isCurrent: edu.isCurrent || false,
          courses: edu.courses,
          honors: edu.honors,
        },
      });
    }

    // Add experiences
    for (const exp of s.experiences) {
      await prisma.experience.create({
        data: {
          studentProfileId: studentProfile.id,
          title: exp.title,
          company: exp.company,
          location: exp.location,
          type: exp.type,
          startDate: exp.startDate,
          endDate: exp.endDate,
          isCurrent: exp.isCurrent,
          description: exp.description,
          years: exp.years,
          months: exp.months,
        },
      });
    }

    // Add projects
    for (const p of s.projects) {
      await prisma.project.create({
        data: {
          studentProfileId: studentProfile.id,
          title: p.title,
          description: p.description,
          technologies: p.technologies,
        },
      });
    }

    // Add certifications
    for (const c of s.certifications) {
      await prisma.certification.create({
        data: {
          studentProfileId: studentProfile.id,
          name: c.name,
          issuer: c.issuer,
        },
      });
    }

    // Add community work
    if (s.communityWork) {
      for (const cw of s.communityWork) {
        await prisma.communityWork.create({
          data: {
            studentProfileId: studentProfile.id,
            title: cw.title,
            organization: cw.organization,
            description: cw.description,
          },
        });
      }
    }

    // Add achievements
    if (s.achievements) {
      for (const a of s.achievements) {
        await prisma.achievement.create({
          data: {
            studentProfileId: studentProfile.id,
            title: a.title,
            type: a.type,
            issuer: a.issuer,
            date: a.date,
          },
        });
      }
    }

    // Add languages
    if (s.languages) {
      for (const l of s.languages) {
        await prisma.language.create({
          data: {
            studentProfileId: studentProfile.id,
            language: l.language,
            proficiency: l.proficiency,
          },
        });
      }
    }
  }

  // 5. Opportunities Data
  const oppsData = [
    {
      title: "Machine Learning Intern",
      type: "Internship",
      company: "Example AI Labs",
      location: "Islamabad",
      workplaceType: "Hybrid",
      minGpa: 3.0,
      requiredDegree: "Computer Science / Software Engineering / Data Science",
      minExperienceYears: 1.0,
      requiredSkills: "Python, Machine Learning, PyTorch",
      preferredSkills: "TensorFlow, SQL, Docker",
      certificationsRequired: "Preferred, not mandatory",
      workAuthorization: "Pakistan",
      deadline: "2026-10-30",
      salaryOrStipend: "PKR 75,000 / month",
      applicationUrl: "https://exampleai.com/careers/ml-intern",
      contactInfo: "careers@exampleai.com",
      verificationStatus: "Verified",
      fullDescription: "Join Example AI Labs as a Machine Learning Intern to assist in training, evaluating, and fine-tuning neural network models. You will collaborate with senior AI research engineers on cutting-edge computer vision and natural language processing tasks.",
      responsibilities: "Develop data preprocessing pipelines, train deep learning models in PyTorch, implement evaluation metrics, and optimize inference latency.",
      preferredQualifications: "Hands-on projects with PyTorch, familiarity with Hugging Face transformers, solid understanding of linear algebra and probability.",
      benefits: "Flexible hours, hybrid setup, learning stipend, mentorship from PhD researchers.",
      recruiterId: recruiter1.id,
      skills: [
        { skillName: "Python", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "PyTorch", isMandatory: true, requiredLevel: "Beginner" },
        { skillName: "TensorFlow", isMandatory: false, requiredLevel: "Beginner" },
        { skillName: "SQL", isMandatory: false, requiredLevel: "Beginner" },
      ],
      requirements: [
        { requirementType: "GPA", description: "Minimum GPA 3.0 required", isMandatory: true, value: "3.0" },
        { requirementType: "DEGREE", description: "Degree in CS, SE, or Data Science", isMandatory: true, value: "Computer Science / Software Engineering / Data Science" },
        { requirementType: "EXPERIENCE", description: "At least 1 year academic/practical experience", isMandatory: true, value: "1.0" },
        { requirementType: "WORK_AUTH", description: "Work authorization in Pakistan", isMandatory: true, value: "Pakistan" },
      ],
    },
    {
      title: "Senior Full Stack Engineer (Next.js & TypeScript)",
      type: "Job",
      company: "DataTech Global",
      location: "Lahore",
      workplaceType: "Hybrid",
      minGpa: 3.0,
      requiredDegree: "Software Engineering / Computer Science",
      minExperienceYears: 2.0,
      requiredSkills: "TypeScript, React, Next.js, Node.js",
      preferredSkills: "PostgreSQL, GraphQL, Tailwind CSS, Docker",
      workAuthorization: "Pakistan",
      deadline: "2026-11-15",
      salaryOrStipend: "PKR 250,000 - 350,000 / month",
      applicationUrl: "https://datatech.io/jobs/senior-fullstack",
      contactInfo: "talent@datatech.io",
      verificationStatus: "Verified",
      fullDescription: "Looking for an exceptional Full Stack Engineer to lead web frontend and backend microservices using Next.js App Router, TypeScript, and high-performance APIs.",
      responsibilities: "Architect scalable Next.js applications, integrate complex REST/GraphQL APIs, manage state management, and write unit tests.",
      recruiterId: recruiter2.id,
      skills: [
        { skillName: "TypeScript", isMandatory: true, requiredLevel: "Advanced" },
        { skillName: "React", isMandatory: true, requiredLevel: "Advanced" },
        { skillName: "Next.js", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "Node.js", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "PostgreSQL", isMandatory: false, requiredLevel: "Intermediate" },
      ],
      requirements: [
        { requirementType: "DEGREE", description: "BS in Software Engineering or Computer Science", isMandatory: true, value: "Software Engineering / Computer Science" },
        { requirementType: "EXPERIENCE", description: "Minimum 2 years production experience", isMandatory: true, value: "2.0" },
      ],
    },
    {
      title: "AI Research Fellowship 2026",
      type: "Fellowship",
      company: "Global Frontier Fellowships",
      location: "Islamabad",
      workplaceType: "Remote",
      minGpa: 3.5,
      requiredDegree: "Computer Science / Artificial Intelligence / Data Science",
      minExperienceYears: 1.5,
      requiredSkills: "Python, PyTorch, Machine Learning, Computer Vision",
      preferredSkills: "C++, CUDA, Deep Learning",
      workAuthorization: "Pakistan",
      deadline: "2026-12-01",
      salaryOrStipend: "$1,500 / month grant",
      applicationUrl: "https://highered.org/fellowships/ai-2026",
      contactInfo: "fellowships@highered.org",
      verificationStatus: "Verified",
      fullDescription: "A prestigious 9-month research fellowship funding high-potential graduate students and early researchers working on breakthrough generative models and vision transformers.",
      responsibilities: "Conduct independent AI research, author peer-reviewed conference submissions, collaborate with international research labs.",
      recruiterId: recruiter3.id,
      skills: [
        { skillName: "Python", isMandatory: true, requiredLevel: "Advanced" },
        { skillName: "PyTorch", isMandatory: true, requiredLevel: "Advanced" },
        { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Advanced" },
        { skillName: "Computer Vision", isMandatory: false, requiredLevel: "Intermediate" },
      ],
      requirements: [
        { requirementType: "GPA", description: "Minimum GPA 3.5 for fellowship qualification", isMandatory: true, value: "3.5" },
        { requirementType: "EXPERIENCE", description: "1.5+ years research or practical engineering experience", isMandatory: true, value: "1.5" },
      ],
    },
    {
      title: "Junior Data Analyst",
      type: "Job",
      company: "DataTech Global",
      location: "Karachi",
      workplaceType: "On-site",
      minGpa: 2.8,
      requiredDegree: "Data Science / Computer Science / Statistics / Business",
      minExperienceYears: 0.5,
      requiredSkills: "SQL, Python, Pandas, Tableau",
      preferredSkills: "Power BI, Statistics, Excel",
      workAuthorization: "Pakistan",
      deadline: "2026-09-30",
      salaryOrStipend: "PKR 90,000 / month",
      applicationUrl: "https://datatech.io/jobs/junior-analyst",
      contactInfo: "talent@datatech.io",
      verificationStatus: "Verified",
      fullDescription: "Exciting entry-level position for analytical minds to transform raw transactional data into actionable business intelligence dashboards.",
      responsibilities: "Write complex SQL queries, build dashboards, automate reporting.",
      recruiterId: recruiter2.id,
      skills: [
        { skillName: "SQL", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "Python", isMandatory: true, requiredLevel: "Beginner" },
        { skillName: "Pandas", isMandatory: false, requiredLevel: "Beginner" },
      ],
      requirements: [
        { requirementType: "GPA", description: "Minimum GPA 2.8", isMandatory: true, value: "2.8" },
      ],
    },
    {
      title: "Cybersecurity Analyst & Penetration Tester",
      type: "Job",
      company: "CyberGuard Tech",
      location: "Islamabad",
      workplaceType: "Hybrid",
      minGpa: 3.0,
      requiredDegree: "Cyber Security / Computer Science / Information Technology",
      minExperienceYears: 1.0,
      requiredSkills: "Cybersecurity, Penetration Testing, Linux",
      preferredSkills: "Python, Wireshark, Burp Suite",
      workAuthorization: "Pakistan",
      deadline: "2026-11-30",
      salaryOrStipend: "PKR 150,000 / month",
      applicationUrl: "https://cyberguard.io/careers/soc-analyst",
      contactInfo: "security@cyberguard.io",
      verificationStatus: "Verified",
      fullDescription: "Join our red-team operations performing vulnerability assessments, ethical penetration tests, and security audits for financial sector clients.",
      responsibilities: "Perform vulnerability scans, conduct web and network penetration tests, prepare technical remediation reports.",
      recruiterId: recruiter1.id,
      skills: [
        { skillName: "Cybersecurity", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "Penetration Testing", isMandatory: true, requiredLevel: "Intermediate" },
        { skillName: "Linux", isMandatory: true, requiredLevel: "Intermediate" },
      ],
      requirements: [
        { requirementType: "GPA", description: "Minimum GPA 3.0", isMandatory: true, value: "3.0" },
        { requirementType: "EXPERIENCE", description: "1+ year hands-on security experience", isMandatory: true, value: "1.0" },
      ],
    },
    {
      title: "Community Tech Education Volunteer",
      type: "Volunteer",
      company: "CodeForPakistan",
      location: "Islamabad",
      workplaceType: "Remote",
      minGpa: null,
      requiredDegree: null,
      minExperienceYears: 0,
      requiredSkills: "Python, JavaScript",
      preferredSkills: "Teaching, Community Work",
      workAuthorization: "Pakistan",
      deadline: "2026-12-31",
      salaryOrStipend: "Volunteer (Certificate & Mentorship Provided)",
      applicationUrl: "https://codeforpakistan.org/volunteer",
      contactInfo: "volunteer@codeforpakistan.org",
      verificationStatus: "Verified",
      fullDescription: "Volunteer to teach coding fundamentals and mentorship to high school and early college students from underprivileged backgrounds.",
      responsibilities: "Conduct weekly online tutoring sessions, guide coding exercises.",
      recruiterId: recruiter3.id,
      skills: [
        { skillName: "Python", isMandatory: false, requiredLevel: "Beginner" },
      ],
      requirements: [],
    },
  ];

  for (const opp of oppsData) {
    const createdOpp = await prisma.opportunity.create({
      data: {
        title: opp.title,
        type: opp.type,
        company: opp.company,
        location: opp.location,
        workplaceType: opp.workplaceType,
        minGpa: opp.minGpa,
        requiredDegree: opp.requiredDegree,
        minExperienceYears: opp.minExperienceYears,
        requiredSkills: opp.requiredSkills,
        preferredSkills: opp.preferredSkills,
        certificationsRequired: opp.certificationsRequired,
        workAuthorization: opp.workAuthorization,
        deadline: opp.deadline,
        salaryOrStipend: opp.salaryOrStipend,
        applicationUrl: opp.applicationUrl,
        contactInfo: opp.contactInfo,
        verificationStatus: opp.verificationStatus,
        fullDescription: opp.fullDescription,
        responsibilities: opp.responsibilities,
        preferredQualifications: opp.preferredQualifications,
        benefits: opp.benefits,
        recruiterId: opp.recruiterId,
        verifiedAt: new Date(),
        verifiedBy: adminUser.id,
      },
    });

    if (opp.skills) {
      for (const sk of opp.skills) {
        await prisma.opportunitySkill.create({
          data: {
            opportunityId: createdOpp.id,
            skillName: sk.skillName,
            isMandatory: sk.isMandatory,
            requiredLevel: sk.requiredLevel,
          },
        });
      }
    }

    if (opp.requirements) {
      for (const req of opp.requirements) {
        await prisma.opportunityRequirement.create({
          data: {
            opportunityId: createdOpp.id,
            requirementType: req.requirementType,
            description: req.description,
            isMandatory: req.isMandatory,
            value: req.value,
          },
        });
      }
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
