"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Send,
  Save,
} from "lucide-react";
import { api } from "@/lib/api";

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basics
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"job" | "internship" | "scholarship" | "fellowship">("internship");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [isRemote, setIsRemote] = useState(false);
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  // Structured Requirements
  const [minGpa, setMinGpa] = useState("");
  const [minExperienceYears, setMinExperienceYears] = useState("0");
  const [minAcademicYear, setMinAcademicYear] = useState("");
  const [requiredDegrees, setRequiredDegrees] = useState("Computer Science, Data Science, AI");

  // Skills
  const [requiredSkills, setRequiredSkills] = useState<string[]>(["Python", "Machine Learning"]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(["PyTorch", "FastAPI"]);
  const [newReqSkill, setNewReqSkill] = useState("");
  const [newPrefSkill, setNewPrefSkill] = useState("");

  // Logistics
  const [compensation, setCompensation] = useState("$1,500/month stipend");
  const [applicationDeadline, setApplicationDeadline] = useState("2026-10-31");
  const [applicationUrl, setApplicationUrl] = useState("https://company.careers/apply");
  const [applyInPlatform, setApplyInPlatform] = useState(false);

  const addRequiredSkill = () => {
    if (newReqSkill.trim() && !requiredSkills.includes(newReqSkill.trim())) {
      setRequiredSkills([...requiredSkills, newReqSkill.trim()]);
      setNewReqSkill("");
    }
  };

  const addPreferredSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill("");
    }
  };

  const handleSubmit = async (submitForReview: boolean) => {
    setError(null);
    if (!title || !applicationDeadline) {
      setError("Please fill out Title and Application Deadline.");
      return;
    }

    setLoading(true);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      if (!storedId) {
        throw new Error("No active user session. Please sign in as a recruiter.");
      }

      const degreesArray = requiredDegrees
        .split(",")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      const payload = {
        title,
        type,
        organization,
        location,
        isRemote,
        description,
        responsibilities,
        compensation,
        applicationDeadline,
        applicationUrl,
        applyInPlatform,
        submitForReview,
        requirements: {
          minGpa: minGpa ? parseFloat(minGpa) : null,
          minGpaScale: 4.0,
          requiredDegrees: degreesArray,
          minExperienceYears: minExperienceYears ? parseFloat(minExperienceYears) : 0,
          minAcademicYear: minAcademicYear ? parseInt(minAcademicYear, 10) : null,
        },
        requiredSkills,
        preferredSkills,
      };

      await api.recruiter.createOpportunity(storedId, payload);
      router.push("/recruiter/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create opportunity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit for Admin Review</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Form Container */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-8">
        {/* Section 1: Basics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              1. Basic Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI Research Intern"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Opportunity Type *
                </label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 font-semibold"
                >
                  <option value="internship">Internship</option>
                  <option value="job">Full-time Job</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="fellowship">Fellowship</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Company
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Defaults to your registered organization"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Location (City, Country)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Islamabad / Lahore"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="remoteCheck"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded"
                />
                <label htmlFor="remoteCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Remote Work Available
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Overview
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of the position, team, and projects..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Requirements (Used directly for matching) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Structured Eligibility Criteria (Matching Engine)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimum GPA (Optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={minGpa}
                onChange={(e) => setMinGpa(e.target.value)}
                placeholder="e.g. 3.2"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Academic Year
              </label>
              <select
                value={minAcademicYear}
                onChange={(e) => setMinAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 font-semibold"
              >
                <option value="">No restriction</option>
                <option value="2">2nd Year +</option>
                <option value="3">3rd Year +</option>
                <option value="4">Final Year / Graduate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Degree / Fields (Comma separated)
            </label>
            <input
              type="text"
              value={requiredDegrees}
              onChange={(e) => setRequiredDegrees(e.target.value)}
              placeholder="e.g. Computer Science, Artificial Intelligence, Data Science"
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>

          {/* Required Skills (Hard filter) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Required Mandatory Skills (Must have)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newReqSkill}
                onChange={(e) => setNewReqSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequiredSkill())}
                placeholder="Add required skill (e.g. Python, SQL)..."
                className="flex-1 px-3.5 py-1.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={addRequiredSkill}
                className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {requiredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Preferred Skills (Boosts semantic match score)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrefSkill}
                onChange={(e) => setNewPrefSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreferredSkill())}
                placeholder="Add preferred skill (e.g. Docker, PyTorch)..."
                className="flex-1 px-3.5 py-1.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={addPreferredSkill}
                className="px-4 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {preferredSkills.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => setPreferredSkills(preferredSkills.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Logistics & Deadline */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              3. Logistics & Application Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Compensation / Stipend Range
              </label>
              <input
                type="text"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="e.g. $1,500/mo or Unpaid"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Application Deadline *
              </label>
              <input
                type="date"
                required
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                External Application URL
              </label>
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                placeholder="https://company.com/jobs/apply"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
