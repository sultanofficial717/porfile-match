import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Keywords dictionary per role category
const ROLE_KEYWORDS: Record<string, string[]> = {
  "Software Engineer": [
    "TypeScript", "React", "Node.js", "Python", "Docker", "CI/CD",
    "REST APIs", "PostgreSQL", "Unit Testing", "Git", "System Design", "AWS"
  ],
  "Frontend Engineer": [
    "React", "TypeScript", "Next.js", "Tailwind CSS", "Redux", "GraphQL",
    "Accessibility (a11y)", "Performance Optimization", "Webpack/Vite", "Jest", "Responsive Design"
  ],
  "Backend / Systems Engineer": [
    "Python", "Go", "Distributed Systems", "PostgreSQL", "Redis", "Kafka",
    "gRPC", "Docker", "Kubernetes", "Microservices", "Concurrency", "Linux"
  ],
  "AI / Machine Learning Engineer": [
    "Python", "PyTorch", "TensorFlow", "Transformers", "LLMs", "Scikit-Learn",
    "Data Pipelines", "CUDA", "FastAPI", "Model Fine-Tuning", "Vector Databases", "MLOps"
  ],
  "Data Scientist / Analyst": [
    "Python", "SQL", "Pandas", "NumPy", "Tableau", "A/B Testing",
    "Statistical Modeling", "Data Visualization", "ETL Pipelines", "BigQuery", "Snowflake"
  ],
};

const WEAK_VERBS = [
  "worked on", "helped", "assisted", "responsible for", "handled",
  "did", "tried to", "participated in", "was involved in", "looked at"
];

const STRONG_VERBS = [
  "Architected", "Engineered", "Spearheaded", "Optimized", "Implemented",
  "Designed", "Developed", "Deployed", "Streamlined", "Accelerated",
  "Automated", "Scaled", "Reduced", "Increased", "Constructed"
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      targetRole = "Software Engineer",
      bulletPoints = "",
      studentProfileId,
      applyToProfile = false,
    } = body;

    if (!bulletPoints || bulletPoints.trim().length === 0) {
      return NextResponse.json({ error: "Please provide resume content or bullet points to optimize." }, { status: 400 });
    }

    const lines = bulletPoints
      .split("\n")
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0 && !l.startsWith("#"));

    const keywords = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS["Software Engineer"];

    // 1. Check keyword presence
    const contentLower = bulletPoints.toLowerCase();
    const presentKeywords = keywords.filter((kw) => contentLower.includes(kw.toLowerCase()));
    const missingKeywords = keywords.filter((kw) => !contentLower.includes(kw.toLowerCase()));

    // 2. Analyze weak vs strong verbs
    let weakVerbCount = 0;
    let strongVerbCount = 0;
    WEAK_VERBS.forEach((wv) => {
      if (contentLower.includes(wv)) weakVerbCount++;
    });
    STRONG_VERBS.forEach((sv) => {
      if (contentLower.includes(sv.toLowerCase())) strongVerbCount++;
    });

    // 3. Detect quantified metrics (e.g. 40%, $10k, 2x, 500ms, 100k users)
    const metricRegex = /\b(\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?|\d+x|\d+\s*(?:ms|seconds|minutes|hours|days|users|requests|rps|tps|mb|gb|tb))\b/gi;
    const metricMatches = bulletPoints.match(metricRegex) || [];
    const hasMetrics = metricMatches.length > 0;

    // 4. Calculate Scores
    // ATS Score (Keyword coverage + structure)
    const keywordScore = Math.min(100, Math.round((presentKeywords.length / Math.max(keywords.length, 1)) * 100));
    const verbScore = Math.min(100, Math.round((strongVerbCount / (strongVerbCount + weakVerbCount + 1)) * 100 + (strongVerbCount > 0 ? 30 : 0)));
    const impactScore = Math.min(100, Math.round((metricMatches.length / Math.max(lines.length, 1)) * 80 + (hasMetrics ? 20 : 0)));

    const overallAtsScore = Math.min(
      98,
      Math.max(35, Math.round(keywordScore * 0.45 + verbScore * 0.30 + impactScore * 0.25))
    );

    // 5. Generate AI Rewritten Bullet Points
    const optimizedBullets = lines.map((originalLine: string, idx: number) => {
      let cleaned = originalLine.replace(/^[-*•]\s*/, "");
      
      // Select appropriate strong verb
      const randomVerb = STRONG_VERBS[idx % STRONG_VERBS.length];
      
      // Determine if line has a weak verb and replace it
      let rewritten = cleaned;
      for (const wv of WEAK_VERBS) {
        const regex = new RegExp(`\\b${wv}\\b`, "i");
        if (regex.test(rewritten)) {
          rewritten = rewritten.replace(regex, randomVerb.toLowerCase());
          break;
        }
      }

      // If does not start with strong verb, prepend
      const startsWithStrong = STRONG_VERBS.some((sv) => rewritten.toLowerCase().startsWith(sv.toLowerCase()));
      if (!startsWithStrong) {
        rewritten = `${randomVerb} ${rewritten.charAt(0).toLowerCase() + rewritten.slice(1)}`;
      }

      // Add quantified impact hint if missing
      if (!metricRegex.test(rewritten)) {
        const impactSamples = [
          "improving page responsiveness and reducing API latency by 35%",
          "boosting system throughput by 2.4x under peak traffic",
          "achieving 99.8% test coverage across core application workflows",
          "reducing deployment build times by 42% through automated CI/CD caching",
          "supporting 50,000+ active user sessions with sub-100ms response times",
        ];
        const sampleImpact = impactSamples[idx % impactSamples.length];
        rewritten = `${rewritten.replace(/\.$/, "")}, ${sampleImpact}.`;
      } else if (!rewritten.endsWith(".")) {
        rewritten += ".";
      }

      return {
        id: `bullet-${idx + 1}`,
        original: originalLine,
        optimized: rewritten,
        highlight: "Enhanced with action verb & measurable outcome formula",
      };
    });

    // 6. If requested, apply directly to the student profile
    if (applyToProfile && studentProfileId) {
      try {
        const student = await prisma.studentProfile.findUnique({
          where: { id: studentProfileId },
          include: { experiences: true, projects: true },
        });

        if (student && student.experiences.length > 0) {
          const firstExp = student.experiences[0];
          const newDesc = optimizedBullets.map((b) => `• ${b.optimized}`).join("\n");
          await prisma.experience.update({
            where: { id: firstExp.id },
            data: { description: newDesc },
          });
        }
      } catch (err) {
        console.warn("Could not auto-sync to student profile:", err);
      }
    }

    return NextResponse.json({
      targetRole,
      overallAtsScore,
      keywordScore,
      verbScore,
      impactScore,
      presentKeywords,
      missingKeywords,
      metricCount: metricMatches.length,
      weakVerbCount,
      strongVerbCount,
      optimizedBullets,
      recommendations: [
        missingKeywords.length > 0
          ? `Incorporate key technical skills: ${missingKeywords.slice(0, 4).join(", ")}`
          : "Great technical keyword coverage!",
        metricMatches.length < lines.length
          ? "Quantify impact using metrics (e.g. '% improved', 'latency reduced', 'number of users served')."
          : "Excellent use of measurable numbers and business impact.",
        weakVerbCount > 0
          ? `Replace passive phrases (${WEAK_VERBS.slice(0, 3).join(", ")}) with dynamic action verbs.`
          : "Strong action-driven vocabulary detected throughout.",
      ],
    });
  } catch (error: any) {
    console.error("Resume optimizer error:", error);
    return NextResponse.json({ error: "Failed to optimize resume" }, { status: 500 });
  }
}
