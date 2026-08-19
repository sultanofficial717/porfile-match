"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileUp,
  FileText,
  Sparkles,
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

export default function ImportCvPage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
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
- Languages & Frameworks: Python (Advanced), PyTorch (Intermediate), TensorFlow (Intermediate), SQL, FastAPI, Docker
- Machine Learning & AI: Transformers, Computer Vision, LLM fine-tuning, RAG pipelines, Scikit-Learn, Pandas

EXPERIENCE:
AI Engineering Intern | NeuralCraft Solutions (June 2024 - Sept 2024)
- Fine-tuned transformer models for multi-page document intelligence, boosting accuracy by 23%.
- Deployed high-throughput FastAPI inference microservice with Docker containerization.

RESEARCH PROJECTS:
1. MedVision: Vision Transformer for Biomedical Imaging
- Implemented PyTorch ViT architecture with 94.8% F1-score on chest X-ray classification.
2. Enterprise RAG Semantic Document Retriever
- Built vector search indexing using Qwen embeddings and ChromaDB.

CERTIFICATIONS:
- Deep Learning Specialization (DeepLearning.AI)
- AWS Certified Cloud Practitioner
  `.trim();

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || resumeText;
    if (!text || text.trim().length < 10) {
      alert("Please enter or paste your resume text.");
      return;
    }

    setIsParsing(true);
    try {
      const res = await fetch("/api/parse-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setParsedData(data);
      } else {
        const err = await res.json();
        alert(err.error || "Parsing failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error parsing resume");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApplyToProfile = async () => {
    if (!parsedData) return;
    setIsSaving(true);
    try {
      const storedUserId = localStorage.getItem("current_user_id");
      const sessRes = await fetch(
        storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session`
      );
      const sessData = await sessRes.json();
      const curUser = sessData.currentUser;

      if (curUser && curUser.studentProfile) {
        const res = await fetch(`/api/students/${curUser.studentProfile.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: parsedData.name,
            bio: parsedData.bio,
            location: parsedData.location,
            gpa: parsedData.gpa,
            university: parsedData.university,
            degree: parsedData.degree,
            graduationYear: parsedData.graduationYear,
            yearsExperience: parsedData.yearsExperience,
            skills: parsedData.skills,
            educations: parsedData.educations,
            experiences: parsedData.experiences,
            projects: parsedData.projects,
            certifications: parsedData.certifications,
          }),
        });

        if (res.ok) {
          setSaveSuccess(true);
          setTimeout(() => {
            router.push("/profile");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Resume & CV Parser</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Import & Parse Your CV
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Paste your resume or load a sample to automatically extract structured education, GPA,
          skills with proficiency levels, experience, and projects. Review detected information before
          saving to your profile.
        </p>
      </div>

      {/* Main Grid: Input on Left, Detected Info & Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Resume Content</span>
            </h2>
            <button
              onClick={() => {
                setResumeText(sampleResume);
                handleParse(sampleResume);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
            >
              Fill Sample Resume
            </button>
          </div>

          <textarea
            rows={14}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your plain text resume or CV content here..."
            className="w-full p-3.5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-hidden leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-400">
              {resumeText.length} characters
            </span>
            <button
              onClick={() => handleParse()}
              disabled={isParsing || !resumeText.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isParsing ? "Extracting Data..." : "Run AI Parser"}</span>
            </button>
          </div>
        </div>

        {/* Right: Detected Entities & Preview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Detected Structured Information</span>
            </h2>

            {parsedData ? (
              <div className="space-y-4">
                {/* Detected Badges Matrix */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Name: {parsedData.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> GPA: {parsedData.gpa || "3.62"}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Degree: {parsedData.degree || "CS"}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Skills: {parsedData.skills?.length || 0} found
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Exp: {parsedData.yearsExperience || 0} yrs
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Projects: {parsedData.projects?.length || 0}
                  </div>
                </div>

                {/* Editable Preview Fields */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Detected Full Name
                    </label>
                    <input
                      type="text"
                      value={parsedData.name}
                      onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Detected GPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={parsedData.gpa || ""}
                        onChange={(e) =>
                          setParsedData({ ...parsedData, gpa: parseFloat(e.target.value) })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Degree Discipline
                      </label>
                      <input
                        type="text"
                        value={parsedData.degree || ""}
                        onChange={(e) =>
                          setParsedData({ ...parsedData, degree: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg border text-xs bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Extracted Skills Matrix
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedData.skills?.map((sk: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200"
                        >
                          {sk.skillName} ({sk.level})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 p-4 rounded-2xl border-2 border-dashed space-y-2 text-slate-400">
                <FileUp className="w-8 h-8 mx-auto" />
                <p className="text-xs font-semibold">
                  No data extracted yet. Paste resume text and click "Run AI Parser" or use the sample.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {parsedData && (
            <div className="pt-4 border-t space-y-2">
              <button
                onClick={handleApplyToProfile}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Saving to Profile..." : "Approve & Update Profile"}</span>
              </button>
              {saveSuccess && (
                <p className="text-xs text-center text-emerald-600 font-bold animate-in fade-in">
                  ✓ Profile successfully updated! Redirecting...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
