import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting EasyMatch database seed...");

  // Clean existing tables
  try {
    await prisma.eventRsvp.deleteMany();
    await prisma.event.deleteMany();
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
  } catch (e) {
    console.warn("Table cleanup notice:", e.message);
  }

  // 1. Scoring Config
  await prisma.scoringConfig.create({
    data: {
      name: "EasyMatch Hybrid AI Matchmaker v1.0",
      semanticWeight: 0.40,
      skillWeight: 0.25,
      experienceWeight: 0.15,
      educationWeight: 0.10,
      completenessWeight: 0.05,
      otherWeight: 0.05,
      notificationThreshold: 85.0,
      isActive: true,
    },
  });

  // 2. Platform Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@easymatch.com",
      name: "EasyMatch Admin",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Recruiters & Companies
  const recruiterEbay = await prisma.user.create({
    data: {
      email: "recruiting@ebay.com",
      name: "Sarah Jenkins",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "eBay",
          companyWebsite: "https://ebay.com",
          position: "University Talent Lead",
          isVerified: true,
        },
      },
    },
  });

  const recruiterReddit = await prisma.user.create({
    data: {
      email: "talent@reddit.com",
      name: "Marcus Vance",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "Reddit",
          companyWebsite: "https://reddit.com",
          position: "Technical Sourcing Manager",
          isVerified: true,
        },
      },
    },
  });

  const recruiterPAN = await prisma.user.create({
    data: {
      email: "campus@paloaltonetworks.com",
      name: "Elena Rostova",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "Palo Alto Networks",
          companyWebsite: "https://paloaltonetworks.com",
          position: "Head of Early Career Programs",
          isVerified: true,
        },
      },
    },
  });

  const recruiterMongo = await prisma.user.create({
    data: {
      email: "jobs@mongodb.com",
      name: "David Chen",
      role: "RECRUITER",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      recruiterProfile: {
        create: {
          companyName: "MongoDB",
          companyWebsite: "https://mongodb.com",
          position: "Principal Engineering Recruiter",
          isVerified: true,
        },
      },
    },
  });

  // 4. Opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      recruiterId: recruiterEbay.id,
      title: "Software Engineering Intern - Frontend & Full Stack",
      type: "Internship",
      company: "eBay",
      location: "San Jose, CA",
      country: "United States",
      workplaceType: "Hybrid",
      minGpa: 3.2,
      isGpaMandatory: true,
      requiredDegree: "Computer Science / Software Engineering / Electrical & Computer Eng",
      minExperienceYears: 0,
      requiredSkills: "React, TypeScript, JavaScript, HTML, CSS, REST APIs",
      preferredSkills: "Next.js, Node.js, GraphQL, Tailwind CSS, Jest",
      graduationYear: 2026,
      workAuthorization: "United States",
      deadline: "2025-11-30",
      salaryOrStipend: "$52 - $58 / hour + Relocation Stipend",
      verificationStatus: "Verified",
      fullDescription: "Join eBay's Buyer Experience team as a Software Engineering Intern for Summer 2025. You will build high-traffic web applications serving 130M+ global buyers using modern React, TypeScript, and micro-frontend architectures.",
      responsibilities: "Develop responsive, accessible user interfaces using React and TypeScript; Collaborate with UX designers and backend engineers; Write unit and end-to-end tests; Participate in agile sprints and code reviews.",
      preferredQualifications: "Experience with modern React hooks and state management; Familiarity with CI/CD workflows and Git; Strong computer science fundamentals.",
      benefits: "1-on-1 Executive Mentorship, Housing Subsidy, 401(k) match, Intern Hackathon, Fast-track return offer to full-time.",
      skills: {
        create: [
          { skillName: "React", isMandatory: true, requiredLevel: "Intermediate", weight: 1.5 },
          { skillName: "TypeScript", isMandatory: true, requiredLevel: "Intermediate", weight: 1.3 },
          { skillName: "JavaScript", isMandatory: true, requiredLevel: "Intermediate", weight: 1.0 },
          { skillName: "REST APIs", isMandatory: true, requiredLevel: "Beginner", weight: 1.0 },
          { skillName: "Next.js", isMandatory: false, requiredLevel: "Intermediate", weight: 0.8 },
        ],
      },
      requirements: {
        create: [
          { requirementType: "GPA", description: "Minimum GPA 3.2 on 4.0 scale", isMandatory: true, value: "3.2" },
          { requirementType: "DEGREE", description: "Enrolled in BS/MS Computer Science or related degree", isMandatory: true, value: "Computer Science" },
        ],
      },
    },
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      recruiterId: recruiterReddit.id,
      title: "Backend Infrastructure Engineer (Entry-Level)",
      type: "Job",
      company: "Reddit",
      location: "San Francisco, CA",
      country: "United States",
      workplaceType: "Remote",
      minGpa: 3.0,
      isGpaMandatory: false,
      requiredDegree: "Computer Science / Software Engineering / Computer Engineering",
      minExperienceYears: 0.5,
      requiredSkills: "Python, Go, Distributed Systems, PostgreSQL, Docker",
      preferredSkills: "Kubernetes, Redis, gRPC, Kafka, AWS",
      graduationYear: 2025,
      workAuthorization: "United States",
      deadline: "2025-10-15",
      salaryOrStipend: "$135,000 - $160,000 / year + Equity",
      verificationStatus: "Verified",
      fullDescription: "Reddit is seeking an early-career Backend Infrastructure Engineer to work on our core Feed and Subreddit Ranking services that handle billions of daily pageviews with sub-millisecond latencies.",
      responsibilities: "Design and implement scalable microservices in Python and Go; Optimize distributed database queries and caching layers; Troubleshoot high-throughput service performance; Maintain automated CI/CD pipelines.",
      preferredQualifications: "Hands-on projects with concurrent programming, Redis caching, or message brokers; Solid understanding of operating systems, networking, and algorithms.",
      benefits: "Remote-first workplace, $3,000 home office stipend, 100% covered health insurance, 401(k) matching, Unlimited PTO.",
      skills: {
        create: [
          { skillName: "Python", isMandatory: true, requiredLevel: "Intermediate", weight: 1.4 },
          { skillName: "Go", isMandatory: false, requiredLevel: "Beginner", weight: 1.2 },
          { skillName: "PostgreSQL", isMandatory: true, requiredLevel: "Intermediate", weight: 1.1 },
          { skillName: "Docker", isMandatory: true, requiredLevel: "Intermediate", weight: 1.0 },
          { skillName: "Distributed Systems", isMandatory: true, requiredLevel: "Intermediate", weight: 1.5 },
        ],
      },
      requirements: {
        create: [
          { requirementType: "DEGREE", description: "BS or MS in Computer Science or Software Engineering", isMandatory: true, value: "Computer Science" },
        ],
      },
    },
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      recruiterId: recruiterPAN.id,
      title: "Cloud Security & AI Threat Analysis Fellow",
      type: "Fellowship",
      company: "Palo Alto Networks",
      location: "Santa Clara, CA",
      country: "United States",
      workplaceType: "Hybrid",
      minGpa: 3.4,
      isGpaMandatory: true,
      requiredDegree: "Computer Science / Cybersecurity / Data Science",
      minExperienceYears: 0,
      requiredSkills: "Python, Machine Learning, Network Security, PyTorch, Linux",
      preferredSkills: "Cloud Security (AWS/GCP), Threat Modeling, Reverse Engineering",
      graduationYear: 2025,
      workAuthorization: "United States",
      deadline: "2025-12-01",
      salaryOrStipend: "$48,000 Stipend (6 Months) + Mentorship",
      verificationStatus: "Verified",
      fullDescription: "A 6-month elite research fellowship in partnership with Unit 42. Work alongside leading cybersecurity researchers using LLMs and deep learning to detect novel zero-day malware attacks.",
      responsibilities: "Train machine learning models for anomaly detection; Analyze network telemetry and threat intelligence feeds; Publish joint whitepapers on automated vulnerability mitigation.",
      preferredQualifications: "Demonstrated interest in security CTFs, machine learning coursework, or published academic research.",
      benefits: "Mentorship by Principal Threat Researchers, Access to GPU clusters, Full sponsorship for DEF CON / Black Hat conferences.",
      skills: {
        create: [
          { skillName: "Python", isMandatory: true, requiredLevel: "Advanced", weight: 1.5 },
          { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Intermediate", weight: 1.4 },
          { skillName: "PyTorch", isMandatory: false, requiredLevel: "Intermediate", weight: 1.2 },
          { skillName: "Network Security", isMandatory: true, requiredLevel: "Intermediate", weight: 1.3 },
        ],
      },
    },
  });

  const opp4 = await prisma.opportunity.create({
    data: {
      recruiterId: recruiterMongo.id,
      title: "Database Systems & Cloud Performance Intern",
      type: "Internship",
      company: "MongoDB",
      location: "New York, NY",
      country: "United States",
      workplaceType: "Hybrid",
      minGpa: 3.3,
      isGpaMandatory: true,
      requiredDegree: "Computer Science / Computer Engineering",
      minExperienceYears: 0,
      requiredSkills: "C++, Python, Data Structures, Algorithms, Git",
      preferredSkills: "Distributed Systems, Linux Kernel, Database Internals, Storage Engines",
      graduationYear: 2026,
      workAuthorization: "United States",
      deadline: "2025-11-15",
      salaryOrStipend: "$55 / hour + NYC Housing Allowance",
      verificationStatus: "Verified",
      fullDescription: "Work directly on the core MongoDB Server engine (WiredTiger storage engine, replication, or query optimization). Code in modern C++ and benchmark high-scale database clusters.",
      responsibilities: "Implement performance enhancements in C++20; Optimize query execution plans; Develop automated stress tests; Collaborate with senior distributed systems architects.",
      preferredQualifications: "Strong foundation in C++, memory management, lock-free concurrency, and operating system concepts.",
      benefits: "Housing in Manhattan provided, Free daily meals, Intern hackathon, Direct full-time return offer pipeline.",
      skills: {
        create: [
          { skillName: "C++", isMandatory: true, requiredLevel: "Intermediate", weight: 1.6 },
          { skillName: "Data Structures", isMandatory: true, requiredLevel: "Advanced", weight: 1.4 },
          { skillName: "Algorithms", isMandatory: true, requiredLevel: "Advanced", weight: 1.3 },
          { skillName: "Python", isMandatory: false, requiredLevel: "Intermediate", weight: 0.9 },
        ],
      },
    },
  });

  // 5. Featured Student Profiles
  const studentUser1 = await prisma.user.create({
    data: {
      email: "alex.rivera@berkeley.edu",
      name: "Alex Rivera",
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      studentProfile: {
        create: {
          bio: "Senior Computer Science student at UC Berkeley. Passionate about building fast, intuitive web applications and distributed backend systems. Open source contributor.",
          location: "Berkeley, CA",
          country: "United States",
          gpa: 3.82,
          graduationYear: 2025,
          university: "University of California, Berkeley",
          degree: "B.S. in Computer Science",
          yearsExperience: 1.5,
          workAuthorization: "United States",
          githubUrl: "https://github.com/alexrivera-dev",
          linkedinUrl: "https://linkedin.com/in/alexrivera-cs",
          portfolioUrl: "https://alexrivera.dev",
          profileCompleteness: 95,
          preferredOpportunityTypes: JSON.stringify(["Job", "Internship", "Fellowship"]),
          preferredWorkMode: "Any",
          minMatchScore: 85.0,
          preferredLocations: "San Francisco, CA, San Jose, CA, New York, NY, Remote",
          targetRoles: "Full Stack Engineer, Frontend Engineer, Software Engineer",
          educations: {
            create: [
              {
                institution: "UC Berkeley",
                degree: "Bachelor of Science",
                fieldOfStudy: "Computer Science",
                gpa: 3.82,
                gpaScale: 4.0,
                startYear: 2021,
                endYear: 2025,
                isCurrent: true,
                honors: "Dean's Honors List (All Semesters), Eta Kappa Nu (HKN) Honor Society",
                courses: "CS 162 Operating Systems, CS 168 Internet Architecture, CS 189 Machine Learning, CS 170 Algorithms",
              },
            ],
          },
          experiences: {
            create: [
              {
                title: "Software Engineering Intern",
                company: "Stripe",
                location: "San Francisco, CA",
                type: "Internship",
                startDate: "2024-06",
                endDate: "2024-08",
                isCurrent: false,
                years: 0.3,
                description: "Engineered React dashboard components for Stripe Billing using TypeScript and GraphQL. Improved page load time by 38% via lazy loading and memoization.",
                skillsUsed: "React, TypeScript, GraphQL, Jest, Node.js",
              },
              {
                title: "Undergraduate Teaching Assistant (CS 61B)",
                company: "UC Berkeley EECS",
                location: "Berkeley, CA",
                type: "Part-time",
                startDate: "2023-08",
                endDate: "2024-05",
                isCurrent: false,
                years: 0.8,
                description: "Led weekly discussion sections and lab demos for Data Structures and Algorithms in Java for 70+ students.",
                skillsUsed: "Java, Data Structures, Algorithms, Git",
              },
            ],
          },
          skills: {
            create: [
              { skillName: "React", level: "Advanced", yearsExperience: 3.0, category: "Technical" },
              { skillName: "TypeScript", level: "Advanced", yearsExperience: 2.5, category: "Technical" },
              { skillName: "JavaScript", level: "Advanced", yearsExperience: 4.0, category: "Technical" },
              { skillName: "Python", level: "Intermediate", yearsExperience: 2.0, category: "Technical" },
              { skillName: "Next.js", level: "Intermediate", yearsExperience: 2.0, category: "Technical" },
              { skillName: "REST APIs", level: "Advanced", yearsExperience: 3.0, category: "Technical" },
              { skillName: "PostgreSQL", level: "Intermediate", yearsExperience: 1.5, category: "Technical" },
              { skillName: "Docker", level: "Intermediate", yearsExperience: 1.0, category: "Technical" },
              { skillName: "Git", level: "Advanced", yearsExperience: 4.0, category: "Tool" },
            ],
          },
          projects: {
            create: [
              {
                title: "DevStream - Real-Time Code Collaboration",
                description: "Built a collaborative in-browser IDE with WebSockets, Monaco Editor, and WebAssembly code sandbox execution. Handles 500 concurrent sessions.",
                technologies: "React, TypeScript, WebSockets, Node.js, Docker, Tailwind CSS",
                githubUrl: "https://github.com/alexrivera-dev/devstream",
                url: "https://devstream.io",
                role: "Full Stack Lead",
              },
              {
                title: "Distributed Key-Value Store with Raft Consensus",
                description: "Implemented a fault-tolerant distributed KV store in Go using the Raft consensus algorithm with leader election and log replication.",
                technologies: "Go, Raft, gRPC, Concurrency",
                githubUrl: "https://github.com/alexrivera-dev/raft-kv",
                role: "Sole Developer",
              },
            ],
          },
        },
      },
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: "priya.patel@gatech.edu",
      name: "Priya Patel",
      role: "STUDENT",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      studentProfile: {
        create: {
          bio: "Graduate student in Computer Science & AI at Georgia Tech. Specializing in Deep Learning, Cyber Threat Intelligence, and Large Language Model fine-tuning.",
          location: "Atlanta, GA",
          country: "United States",
          gpa: 3.91,
          graduationYear: 2025,
          university: "Georgia Institute of Technology",
          degree: "M.S. in Computer Science (Machine Learning)",
          yearsExperience: 2.0,
          workAuthorization: "United States",
          githubUrl: "https://github.com/priyapatel-ai",
          linkedinUrl: "https://linkedin.com/in/priyapatel-ml",
          profileCompleteness: 92,
          preferredOpportunityTypes: JSON.stringify(["Job", "Fellowship"]),
          preferredWorkMode: "Hybrid",
          minMatchScore: 88.0,
          preferredLocations: "San Francisco, CA, Santa Clara, CA, Remote",
          targetRoles: "AI Engineer, Machine Learning Fellow, Security Researcher",
          educations: {
            create: [
              {
                institution: "Georgia Institute of Technology",
                degree: "Master of Science",
                fieldOfStudy: "Computer Science (Machine Learning)",
                gpa: 3.91,
                gpaScale: 4.0,
                startYear: 2023,
                endYear: 2025,
                isCurrent: true,
                courses: "CS 7641 Machine Learning, CS 7643 Deep Learning, CS 6262 Network Security",
              },
            ],
          },
          experiences: {
            create: [
              {
                title: "Machine Learning Research Assistant",
                company: "Georgia Tech AI Lab",
                location: "Atlanta, GA",
                type: "Part-time",
                startDate: "2023-09",
                endDate: "2024-08",
                isCurrent: true,
                years: 1.0,
                description: "Trained transformer models using PyTorch on 8x A100 GPUs for zero-shot network anomaly detection, achieving 97.4% precision on benchmark datasets.",
                skillsUsed: "Python, PyTorch, Transformers, Network Security, Linux, CUDA",
              },
            ],
          },
          skills: {
            create: [
              { skillName: "Python", level: "Advanced", yearsExperience: 4.0, category: "Technical" },
              { skillName: "PyTorch", level: "Advanced", yearsExperience: 3.0, category: "Technical" },
              { skillName: "Machine Learning", level: "Advanced", yearsExperience: 3.0, category: "Technical" },
              { skillName: "Network Security", level: "Intermediate", yearsExperience: 2.0, category: "Technical" },
              { skillName: "Docker", level: "Intermediate", yearsExperience: 2.0, category: "Technical" },
              { skillName: "Linux", level: "Advanced", yearsExperience: 3.5, category: "Technical" },
            ],
          },
          projects: {
            create: [
              {
                title: "CyberLLM - Automated Threat Intelligence Parser",
                description: "Fine-tuned Llama 3 8B model to automatically extract MITRE ATT&CK techniques and IoCs from raw security advisory text.",
                technologies: "Python, PyTorch, HuggingFace, FastAPI, Docker",
                githubUrl: "https://github.com/priyapatel-ai/cyber-llm",
                role: "Lead Researcher",
              },
            ],
          },
        },
      },
    },
  });

  // 6. Virtual Career Events & Info Sessions
  await prisma.event.create({
    data: {
      title: "eBay Early Career Tech Summit & Live Recruiter AMA",
      company: "eBay",
      companyLogo: "https://8139278.fs1.hubspotusercontent-na1.net/hubfs/8139278/ebay-1.png",
      description: "Meet the engineering leads behind eBay's 130M-buyer marketplace! Learn what recruiters look for in 2025 Summer Intern and New Grad SWE applications, view a live system design breakdown, and ask questions directly to hiring managers.",
      type: "Info Session",
      date: "Nov 12, 2025",
      time: "4:00 PM - 5:30 PM EST",
      duration: "90 mins",
      locationType: "Virtual",
      meetingUrl: "https://ebay.zoom.us/j/987654321",
      tags: "Software Engineering, Frontend, Early Career, Live Q&A",
      hostName: "Sarah Jenkins",
      hostTitle: "University Talent Lead at eBay",
      hostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      targetAudience: "Class of 2025, 2026, and 2027 studying CS, Software Engineering, or related fields",
      capacity: 500,
      recruiterId: recruiterEbay.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Reddit Tech Talk: Scaling Feeds to 100 Million Daily Users",
      company: "Reddit",
      companyLogo: "https://8139278.fs1.hubspotusercontent-na1.net/hubfs/8139278/4-Jun-29-2024-12-20-56-1392-AM.png",
      description: "Dive deep into Reddit's backend architecture. Senior Distributed Systems engineers explain how we leverage Go, Redis clusters, and machine learning to rank subreddits in real-time. Priority interview screening for attendees!",
      type: "Tech Talk",
      date: "Nov 18, 2025",
      time: "5:00 PM - 6:15 PM EST",
      duration: "75 mins",
      locationType: "Virtual",
      meetingUrl: "https://reddit.zoom.us/j/123456789",
      tags: "Backend, Distributed Systems, Go, Python, Cloud",
      hostName: "Marcus Vance",
      hostTitle: "Technical Sourcing Lead at Reddit",
      hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      targetAudience: "New Grads (2025) and Interns (2026) interested in Backend & Infrastructure",
      capacity: 600,
      recruiterId: recruiterReddit.id,
    },
  });

  await prisma.event.create({
    data: {
      title: "Palo Alto Networks: AI in Cybersecurity Fellowship Briefing",
      company: "Palo Alto Networks",
      companyLogo: "https://8139278.fs1.hubspotusercontent-na1.net/hubfs/8139278/Untitled%20(1000%20x%20400%20px)%20(4).png",
      description: "Explore the cutting-edge intersection of Deep Learning and Threat Detection with Unit 42. Get insider guidance on the application process for the 2025 AI Threat Analysis Fellowship.",
      type: "Workshop",
      date: "Nov 25, 2025",
      time: "6:00 PM - 7:00 PM EST",
      duration: "60 mins",
      locationType: "Virtual",
      meetingUrl: "https://paloaltonetworks.zoom.us/j/456789123",
      tags: "AI/ML, Cybersecurity, Fellowship, Unit 42",
      hostName: "Elena Rostova",
      hostTitle: "Director of Early Career Programs",
      hostAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      targetAudience: "BS, MS, and PhD students in Computer Science, AI, and Cybersecurity",
      capacity: 400,
      recruiterId: recruiterPAN.id,
    },
  });

  console.log("✅ Database seeded with EasyMatch employers, opportunities, candidates, and virtual career events!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
