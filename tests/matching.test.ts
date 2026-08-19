import { describe, it, expect } from "vitest";
import { checkHardEligibility } from "../lib/matching/eligibility";
import { computeMatchScore, calculateSkillScore, calculateExperienceScore, calculateEducationScore } from "../lib/matching/scoring";
import { cosineSimilarity, cosineSimilarityToPercentage, getEmbeddingProvider } from "../lib/ai/embeddings";
import { buildStudentMatchingDocument, buildOpportunityMatchingDocument } from "../lib/matching/document";

describe("Stage 1 — Hard Eligibility Filter", () => {
  const baseStudent = {
    gpa: 3.62,
    degree: "BS Computer Science",
    yearsExperience: 1.5,
    workAuthorization: "Pakistan",
    skills: [
      { skillName: "Python", level: "Advanced", yearsExperience: 3 },
      { skillName: "Machine Learning", level: "Intermediate", yearsExperience: 2 },
      { skillName: "PyTorch", level: "Intermediate", yearsExperience: 1.5 },
    ],
    educations: [
      { degree: "Bachelor of Science", fieldOfStudy: "Computer Science", gpa: 3.62 },
    ],
  };

  const baseOpportunity = {
    minGpa: 3.0,
    requiredDegree: "Computer Science / Software Engineering / Data Science",
    minExperienceYears: 1.0,
    workAuthorization: "Pakistan",
    skills: [
      { skillName: "Python", isMandatory: true, requiredLevel: "Intermediate" },
      { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Intermediate" },
      { skillName: "PyTorch", isMandatory: true, requiredLevel: "Beginner" },
    ],
  };

  it("PASSES when all mandatory criteria (GPA, Degree, Exp, Mandatory Skills) are met", () => {
    const result = checkHardEligibility(baseStudent, baseOpportunity);
    expect(result.passed).toBe(true);
    expect(result.status).toBe("PASS");
    expect(result.failedChecks).toHaveLength(0);
  });

  it("FAILS hard eligibility when student GPA is below required minimum (2.6 < 3.0)", () => {
    const lowGpaStudent = { ...baseStudent, gpa: 2.6 };
    const result = checkHardEligibility(lowGpaStudent, baseOpportunity);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("FAIL");
    expect(result.failedChecks.some((f) => f.rule === "MIN_GPA")).toBe(true);
    expect(result.reasons[0]).toContain("GPA 2.60 is below required minimum 3.00");
  });

  it("FAILS hard eligibility when required degree discipline does not match", () => {
    const artStudent = {
      ...baseStudent,
      degree: "BA Fine Arts",
      educations: [{ degree: "BA", fieldOfStudy: "Fine Arts", gpa: 3.8 }],
    };
    const result = checkHardEligibility(artStudent, baseOpportunity);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("FAIL");
    expect(result.failedChecks.some((f) => f.rule === "REQUIRED_DEGREE")).toBe(true);
  });

  it("FAILS hard eligibility when experience is less than required (0.5 < 1.0 years)", () => {
    const juniorStudent = { ...baseStudent, yearsExperience: 0.5 };
    const result = checkHardEligibility(juniorStudent, baseOpportunity);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("FAIL");
    expect(result.failedChecks.some((f) => f.rule === "MIN_EXPERIENCE")).toBe(true);
  });

  it("FAILS hard eligibility when mandatory skill is missing (e.g. missing PyTorch)", () => {
    const missingSkillStudent = {
      ...baseStudent,
      skills: [
        { skillName: "Python", level: "Advanced", yearsExperience: 3 },
        { skillName: "Machine Learning", level: "Intermediate", yearsExperience: 2 },
      ],
    };
    const result = checkHardEligibility(missingSkillStudent, baseOpportunity);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("FAIL");
    expect(result.failedChecks.some((f) => f.rule === "MANDATORY_SKILL")).toBe(true);
  });

  it("FAILS hard eligibility when student skill level is below required level", () => {
    const lowLevelStudent = {
      ...baseStudent,
      skills: [
        { skillName: "Python", level: "Beginner", yearsExperience: 0.5 }, // requires Intermediate
        { skillName: "Machine Learning", level: "Intermediate", yearsExperience: 2 },
        { skillName: "PyTorch", level: "Intermediate", yearsExperience: 1.5 },
      ],
    };
    const result = checkHardEligibility(lowLevelStudent, baseOpportunity);
    expect(result.passed).toBe(false);
    expect(result.status).toBe("FAIL");
    expect(result.failedChecks.some((f) => f.rule === "SKILL_LEVEL")).toBe(true);
  });
});

describe("Cosine Similarity & Semantic Vector Math", () => {
  it("computes 100% similarity for identical vectors", () => {
    const v1 = [0.5, 0.5, 0.5, 0.5];
    const v2 = [0.5, 0.5, 0.5, 0.5];
    const sim = cosineSimilarityToPercentage(v1, v2);
    expect(sim).toBe(100);
  });

  it("computes low similarity for orthogonal / opposite vectors", () => {
    const v1 = [1, 0, 0, 0];
    const v2 = [0, 1, 0, 0];
    const sim = cosineSimilarityToPercentage(v1, v2);
    expect(sim).toBe(50); // Normalized cosine [0, 1] range: 0 dot product = 50%
  });
});

describe("Multi-Factor Scoring & Threshold Trigger", () => {
  const student = {
    bio: "AI researcher focusing on PyTorch deep learning models.",
    gpa: 3.75,
    degree: "BS Computer Science",
    university: "NUST",
    yearsExperience: 1.5,
    workAuthorization: "Pakistan",
    skills: [
      { skillName: "Python", level: "Advanced", yearsExperience: 3 },
      { skillName: "Machine Learning", level: "Intermediate", yearsExperience: 2 },
      { skillName: "PyTorch", level: "Advanced", yearsExperience: 2 },
    ],
    projects: [
      { title: "MedVision", description: "ViT segmentation model", technologies: "Python, PyTorch" },
    ],
  };

  const opp = {
    title: "Machine Learning Intern",
    type: "Internship",
    company: "Example AI",
    location: "Islamabad",
    minGpa: 3.0,
    requiredDegree: "Computer Science / Data Science",
    minExperienceYears: 1.0,
    requiredSkills: "Python, Machine Learning, PyTorch",
    fullDescription: "Join as ML intern",
    skills: [
      { skillName: "Python", isMandatory: true, requiredLevel: "Intermediate" },
      { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Intermediate" },
      { skillName: "PyTorch", isMandatory: true, requiredLevel: "Beginner" },
    ],
  };

  it("yields high overall match score (>90%) for strong matching candidate and marks NOTIFICATION_TRIGGER", () => {
    const semanticSim = 95.0;
    const result = computeMatchScore(student as any, opp as any, semanticSim, undefined, 92.0);

    expect(result.hardEligibility.passed).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(92.0);
    expect(result.thresholdReached).toBe(true);
    expect(result.explanation.overallAssessment).toBe("Strong candidate");
    expect(result.explanation.strongMatches).toContain("Python (Advanced)");
  });

  it("sets overallScore to 0 and thresholdReached to false if hard eligibility fails despite 96% semantic similarity", () => {
    const failingStudent = {
      ...student,
      gpa: 2.6, // Fails min GPA 3.0
    };
    const semanticSim = 96.0;
    const result = computeMatchScore(failingStudent as any, opp as any, semanticSim, undefined, 92.0);

    expect(result.hardEligibility.passed).toBe(false);
    expect(result.overallScore).toBe(0);
    expect(result.thresholdReached).toBe(false);
    expect(result.explanation.overallAssessment).toBe("Not eligible");
  });

  it("evaluates notification threshold: 95 >= 92 triggers notification, 91 < 92 does not", () => {
    const scoreResult95 = computeMatchScore(student as any, opp as any, 98.0, undefined, 92.0);
    expect(scoreResult95.overallScore).toBeGreaterThanOrEqual(92);
    expect(scoreResult95.thresholdReached).toBe(true);

    const scoreResultLow = computeMatchScore(
      { ...student, yearsExperience: 1.0, skills: [{ skillName: "Python", level: "Beginner" }, { skillName: "Machine Learning", level: "Beginner" }, { skillName: "PyTorch", level: "Beginner" }] } as any,
      opp as any,
      60.0,
      undefined,
      92.0
    );
    expect(scoreResultLow.overallScore).toBeLessThan(92);
    expect(scoreResultLow.thresholdReached).toBe(false);
  });
});

describe("Embedding Provider System Conformity", () => {
  it("instantiates Gemini, Qwen, Ollama, and Mock providers with valid interface", async () => {
    const gemini = getEmbeddingProvider("gemini");
    const qwen = getEmbeddingProvider("qwen");
    const ollama = getEmbeddingProvider("ollama");
    const mock = getEmbeddingProvider("mock");

    const mockInfo = await mock.getModelInfo();
    expect(mockInfo.provider).toBe("mock");
    expect(mockInfo.dimension).toBe(768);

    const geminiInfo = await gemini.getModelInfo();
    expect(geminiInfo.provider).toBe("gemini");
    expect(geminiInfo.dimension).toBe(768);

    const qwenInfo = await qwen.getModelInfo();
    expect(qwenInfo.provider).toBe("qwen");
    expect(qwenInfo.dimension).toBe(1024);

    const ollamaInfo = await ollama.getModelInfo();
    expect(ollamaInfo.provider).toBe("ollama");

    // Test Mock Provider embedding generation
    const res = await mock.embedText("Computer Science student skilled in Python and PyTorch");
    expect(res.embedding).toHaveLength(768);
    expect(res.isMock).toBe(true);
    expect(res.latencyMs).toBeGreaterThanOrEqual(0);
  });
});
