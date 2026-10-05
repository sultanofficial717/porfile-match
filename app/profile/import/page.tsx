"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileUp,
  FileText,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowRight,
  User,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  upsertStudentProfile,
  createExperience,
  createProject,
  generateMatchesForStudent,
  getStudentProfile,
} from "@/lib/database";
import { parseResumeText, type ParsedCvResult } from "@/lib/parsing/cv-parser";
import { toast } from "sonner";

export default function ImportCvPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedCvResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sampleResume = `
Ali Rehman
Email: ali.rehman.cs@example.edu | Phone: +92-300-1234567 | Location: Islamabad, Pakistan
GitHub: github.com/alirehman | LinkedIn: linkedin.com/in/alirehman

SUMMARY:
Final year BS Computer Science student at NUST Islamabad with deep interest in Machine Learning, PyTorch, and NLP. 1.5+ years of practical project and research experience building and fine-tuning transformer models.

EDUCATION:
National University of Sciences and Technology (NUST), Islamabad
Bachelor of Science in Computer Science | CGPA: 3.62 / 4.00
Graduation: June 2025
Key Courses: Machine Learning, Deep Learning, Natural Language Processing, Distributed Systems, Data Structures & Algorithms

TECHNICAL SKILLS:
- Languages & Frameworks: Python, PyTorch, TensorFlow, SQL, FastAPI, Docker, React, TypeScript
- Machine Learning & AI: Transformers, Computer Vision, LLM fine-tuning, RAG pipelines, Scikit-Learn, Pandas

EXPERIENCE:
AI Engineering Intern | NeuralCraft Solutions (June 2024 - Sept 2024)
- Fine-tuned transformer models for multi-page document intelligence, boosting accuracy by 23%.
- Deployed high-throughput FastAPI inference microservice with Docker containerization.

RESEARCH PROJECTS:
1. MedVision: Vision Transformer for Biomedical Imaging
- Implemented PyTorch ViT architecture with 94.8% F1-score on chest X-ray classification.
2. Enterprise RAG Semantic Document Retriever
- Built vector search indexing using embeddings and ChromaDB.

CERTIFICATIONS:
- Deep Learning Specialization (DeepLearning.AI)
- AWS Certified Cloud Practitioner
  `.trim();

  const handleParse = (textToParse?: string) => {
    const text = textToParse || resumeText;
    if (!text || text.trim().length < 10) {
      toast.error("Please enter or paste your resume text.");
      return;
    }

    setIsParsing(true);
    try {
      const data = parseResumeText(text);
      setParsedData(data);
      toast.success("Resume parsed successfully!");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error parsing resume");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyToProfile = async () => {
    if (!parsedData || !user) {
      toast.error("Please sign in as a student to save this profile.");
      return;
    }

    setIsSaving(true);
    try {
      // Check existing profile
      const existingProfile = await getStudentProfile(user.$id);

      const skillNames = parsedData.skills.map((s) => s.skillName);

      const student = await upsertStudentProfile(
        user.$id,
        {
          institution: parsedData.university || existingProfile?.institution || "University",
          degree: parsedData.degree || existingProfile?.degree || "Bachelor of Science",
          gpa: parsedData.gpa ?? existingProfile?.gpa ?? 3.5,
          skills: skillNames.length > 0 ? skillNames : existingProfile?.skills || ["Python"],
          bio: parsedData.bio || existingProfile?.bio,
          location: parsedData.location || existingProfile?.location,
          graduationYear: parsedData.graduationYear || existingProfile?.graduationYear || 2025,
          profileCompleteness: 85,
        },
        existingProfile?.$id
      );

      // Create parsed experiences
      if (parsedData.experiences && parsedData.experiences.length > 0) {
        for (const exp of parsedData.experiences) {
          try {
            await createExperience(
              {
                studentProfileId: student.$id,
                company: exp.company,
                title: exp.title,
                description: exp.description || undefined,
              },
              user.$id
            );
          } catch {
            // skip duplicate
          }
        }
      }

      // Create parsed projects
      if (parsedData.projects && parsedData.projects.length > 0) {
        for (const proj of parsedData.projects) {
          try {
            await createProject(
              {
                studentProfileId: student.$id,
                title: proj.title,
                description: proj.description || undefined,
              },
              user.$id
            );
          } catch {
            // skip duplicate
          }
        }
      }

      // Automatically recalculate matches for this candidate
      await generateMatchesForStudent(student.$id);

      setSaveSuccess(true);
      toast.success("Profile updated and matches calculated!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <Wand2 className="w-3.5 h-3.5" />
          <span>Resume & CV Parser</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          Import & Parse Your CV
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Paste your resume or load a sample to automatically extract structured education, GPA,
          skills with proficiency levels, experience, and projects. Review detected information before
          saving to your profile.
        </p>
      </div>

      {/* Main Grid: Input on Left, Detected Info & Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="p-6 rounded-2xl bg-card border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Resume Content</span>
            </h2>
            <button
              onClick={() => {
                setResumeText(sampleResume);
                handleParse(sampleResume);
              }}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Fill Sample Resume
            </button>
          </div>

          <textarea
            rows={14}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain text resume or CV content here..."
            className="w-full p-3.5 rounded-xl border bg-muted/40 text-xs font-mono focus:ring-2 focus:ring-primary outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-muted-foreground">
              {resumeText.length} characters
            </span>
            <button
              onClick={() => handleParse()}
              disabled={isParsing || !resumeText.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isParsing ? "Extracting Data..." : "Run Parser"}</span>
            </button>
          </div>
        </div>

        {/* Right: Detected Entities & Preview */}
        <div className="p-6 rounded-2xl bg-card border space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Detected Structured Information</span>
            </h2>

            {parsedData ? (
              <div className="space-y-4">
                {/* Detected Badges Matrix */}
                <div className="p-4 rounded-xl bg-muted/40 border grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Name: {parsedData.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> GPA: {parsedData.gpa ?? "3.62"}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Degree: {parsedData.degree || "CS"}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Skills: {parsedData.skills?.length || 0} found
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Exp: {parsedData.yearsExperience || 0} yrs
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Projects: {parsedData.projects?.length || 0}
                  </div>
                </div>

                {/* Editable Preview Fields */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      Detected Full Name
                    </label>
                    <input
                      type="text"
                      value={parsedData.name}
                      onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs bg-background font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Detected GPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={parsedData.gpa || ""}
                        onChange={(e) =>
                          setParsedData({ ...parsedData, gpa: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                        Detected University
                      </label>
                      <input
                        type="text"
                        value={parsedData.university || ""}
                        onChange={(e) =>
                          setParsedData({ ...parsedData, university: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      Detected Skills ({parsedData.skills?.length || 0})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.skills?.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold"
                        >
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed rounded-xl space-y-2">
                <FileUp className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">
                  Paste resume text on the left and run parser to see detected entities.
                </p>
              </div>
            )}
          </div>

          {parsedData && (
            <div className="pt-4 border-t">
              <button
                onClick={handleApplyToProfile}
                disabled={isSaving || saveSuccess}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Applied & Synced to Dashboard!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Saving to Profile..." : "Apply & Save to Profile"}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
