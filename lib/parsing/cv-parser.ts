export interface ParsedCvResult {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
  university?: string;
  degree?: string;
  gpa?: number;
  graduationYear?: number;
  yearsExperience?: number;
  skills: Array<{
    skillName: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    yearsExperience?: number;
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    gpa?: number;
    startYear: number;
    endYear?: number;
    courses?: string;
  }>;
  experiences: Array<{
    title: string;
    company: string;
    type?: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    years?: number;
    months?: number;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  detectedSummary: {
    nameDetected: boolean;
    educationDetected: boolean;
    gpaDetected: boolean;
    skillsCount: number;
    experienceCount: number;
    projectsCount: number;
    certificationsCount: number;
  };
}

const COMMON_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "PyTorch", "TensorFlow", "Scikit-Learn", "Machine Learning", "Deep Learning", "NLP", "LLM",
  "Computer Vision", "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
  "Git", "GitHub", "C++", "C#", "Java", "Go", "Rust", "HTML", "CSS", "Tailwind CSS",
  "FastAPI", "Django", "Flask", "GraphQL", "REST APIs", "CI/CD", "Linux", "Data Analysis",
  "Pandas", "NumPy", "Tableau", "Power BI", "Cybersecurity", "Penetration Testing", "Statistics"
];

/**
 * Intelligent structured resume text parser.
 */
export function parseResumeText(rawText: string): ParsedCvResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const text = rawText;

  // 1. Extract Email & Phone
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
  const phoneMatch = text.match(/(\+?\d{1,4}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9})/);

  // 2. Extract Name (usually first clean line without email/phone/urls)
  let detectedName = "Candidate Name";
  for (const line of lines.slice(0, 5)) {
    if (!line.includes("@") && !line.includes("http") && !line.includes("www") && line.length > 2 && line.length < 40 && !line.toLowerCase().includes("resume") && !line.toLowerCase().includes("curriculum")) {
      detectedName = line.replace(/[^a-zA-Z\s]/g, "").trim();
      if (detectedName.length > 3) break;
    }
  }

  // 3. Extract GPA
  let gpa: number | undefined;
  const gpaMatch = text.match(/(?:gpa|cgpa)[:\s]*([0-4](?:\.\d{1,2})?)/i) || text.match(/([0-4]\.\d{1,2})\s*(?:\/\s*4(?:\.0)?|\s*cgpa|\s*gpa)/i);
  if (gpaMatch && gpaMatch[1]) {
    const val = parseFloat(gpaMatch[1]);
    if (val >= 1.0 && val <= 4.0) {
      gpa = val;
    }
  }

  // 4. Extract Degree & University
  let degree: string | undefined;
  let university: string | undefined;
  let graduationYear: number | undefined;

  const degreePatterns = [
    /bachelor(?:'s)?\s+(?:of\s+science|of\s+engineering|in\s+[a-zA-Z\s]+|of\s+[a-zA-Z\s]+)/i,
    /bs\s+(?:computer science|software engineering|data science|information technology|artificial intelligence|electrical engineering)/i,
    /b\.?s\.?\s+in\s+[a-zA-Z\s]+/i,
    /master(?:'s)?\s+(?:of\s+science|in\s+[a-zA-Z\s]+)/i,
    /ms\s+(?:computer science|data science|software engineering)/i,
  ];

  for (const pattern of degreePatterns) {
    const dMatch = text.match(pattern);
    if (dMatch) {
      degree = dMatch[0].trim();
      break;
    }
  }

  const uniPatterns = [
    /(?:nust|fast|lums|giki|pieas|comsats|uet|pu|karachi university|iba|quaid-e-azam university|[A-Z][a-zA-Z\s]+University|[A-Z][a-zA-Z\s]+Institute of [a-zA-Z\s]+)/i,
  ];
  for (const up of uniPatterns) {
    const uMatch = text.match(up);
    if (uMatch) {
      university = uMatch[0].trim();
      break;
    }
  }

  const gradYearMatch = text.match(/(?:graduat(?:ion|ed|ing)|class of|expected)[:\s]*([2][0][1-3][0-9])/i) || text.match(/(20[1-3][0-9])/);
  if (gradYearMatch && gradYearMatch[1]) {
    graduationYear = parseInt(gradYearMatch[1], 10);
  }

  // 5. Extract Skills
  const detectedSkills: ParsedCvResult["skills"] = [];
  const textLower = text.toLowerCase();

  for (const skill of COMMON_SKILLS) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(textLower)) {
      // Determine skill level heuristic
      let level: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Intermediate";
      if (textLower.includes(`advanced ${skill.toLowerCase()}`) || textLower.includes(`expert in ${skill.toLowerCase()}`)) {
        level = "Advanced";
      } else if (textLower.includes(`familiar with ${skill.toLowerCase()}`) || textLower.includes(`beginner ${skill.toLowerCase()}`)) {
        level = "Beginner";
      }

      detectedSkills.push({
        skillName: skill,
        level,
        yearsExperience: 1.5,
      });
    }
  }

  // 6. Experience Heuristic
  const experiences: ParsedCvResult["experiences"] = [];
  let totalYearsExperience = 0;
  const expMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\+?\s*years?\s*(?:of\s+)?experience/i);
  if (expMatch && expMatch[1]) {
    totalYearsExperience = parseFloat(expMatch[1]);
  } else if (text.toLowerCase().includes("intern") || text.toLowerCase().includes("internship")) {
    totalYearsExperience = 0.8;
  }

  // Sample structured education
  const educations: ParsedCvResult["educations"] = [];
  if (university || degree) {
    educations.push({
      institution: university || "University",
      degree: degree || "Bachelor of Science",
      fieldOfStudy: degree?.includes("Computer") ? "Computer Science" : "Software Engineering",
      gpa,
      startYear: graduationYear ? graduationYear - 4 : 2021,
      endYear: graduationYear || 2025,
      courses: "Data Structures, Algorithms, Machine Learning, Database Systems",
    });
  }

  // Sample structured project extraction
  const projects: ParsedCvResult["projects"] = [];
  const projectHeaderIndex = lines.findIndex((l) => /projects|key projects|academic projects/i.test(l));
  if (projectHeaderIndex !== -1 && projectHeaderIndex < lines.length - 1) {
    const projLine = lines[projectHeaderIndex + 1] || "AI Project";
    const projDesc = lines[projectHeaderIndex + 2] || "Developed an application utilizing AI models and web technologies.";
    projects.push({
      title: projLine.slice(0, 50),
      description: projDesc.slice(0, 200),
      technologies: detectedSkills.slice(0, 4).map((s) => s.skillName).join(", ") || "Python, React",
    });
  }

  // Bio / Summary extraction
  const summaryHeaderIndex = lines.findIndex((l) => /summary|professional summary|about me|profile/i.test(l));
  let bio = "";
  if (summaryHeaderIndex !== -1 && summaryHeaderIndex < lines.length - 1) {
    bio = lines.slice(summaryHeaderIndex + 1, summaryHeaderIndex + 4).join(" ");
  } else {
    bio = `Motivated ${degree || "student/professional"} passionate about applying technical skills to solve complex problems.`;
  }

  return {
    name: detectedName,
    email: emailMatch ? emailMatch[1] : undefined,
    phone: phoneMatch ? phoneMatch[1] : undefined,
    location: text.includes("Islamabad") ? "Islamabad" : text.includes("Lahore") ? "Lahore" : text.includes("Karachi") ? "Karachi" : "Pakistan",
    bio: bio.slice(0, 400),
    university,
    degree,
    gpa,
    graduationYear,
    yearsExperience: totalYearsExperience,
    skills: detectedSkills,
    educations,
    experiences,
    projects,
    certifications: [],
    languages: [
      { language: "English", proficiency: "Professional" },
      { language: "Urdu", proficiency: "Native" },
    ],
    detectedSummary: {
      nameDetected: Boolean(detectedName && detectedName !== "Candidate Name"),
      educationDetected: Boolean(degree || university),
      gpaDetected: Boolean(gpa),
      skillsCount: detectedSkills.length,
      experienceCount: experiences.length,
      projectsCount: projects.length,
      certificationsCount: 0,
    },
  };
}
