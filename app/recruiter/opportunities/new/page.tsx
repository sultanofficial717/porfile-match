"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Sparkles,
  Shield,
  Layers,
  Building2,
  MapPin,
  Calendar,
} from "lucide-react";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Internship",
    company: "Example AI Labs",
    location: "Islamabad",
    workplaceType: "Hybrid",
    minGpa: 3.0,
    requiredDegree: "Computer Science / Software Engineering / Data Science",
    minExperienceYears: 1.0,
    requiredSkills: "Python, Machine Learning, PyTorch",
    preferredSkills: "TensorFlow, SQL",
    certificationsRequired: "Preferred, not mandatory",
    workAuthorization: "Pakistan",
    deadline: "2026-10-30",
    salaryOrStipend: "PKR 75,000 / month",
    applicationUrl: "https://exampleai.com/apply",
    contactInfo: "careers@exampleai.com",
    fullDescription: "Join our core AI research and engineering team to develop and deploy cutting-edge deep learning models and computer vision pipelines.",
    responsibilities: "Train transformer and CNN models in PyTorch, implement evaluation pipelines, and optimize real-time inference latency.",
    preferredQualifications: "Hands-on experience with PyTorch, OpenCV, and FastAPI.",
    benefits: "Mentorship from PhD researchers, hybrid flexibility, stipend, learning budget.",
  });

  const [skills, setSkills] = useState([
    { skillName: "Python", isMandatory: true, requiredLevel: "Intermediate" },
    { skillName: "Machine Learning", isMandatory: true, requiredLevel: "Intermediate" },
    { skillName: "PyTorch", isMandatory: true, requiredLevel: "Beginner" },
    { skillName: "TensorFlow", isMandatory: false, requiredLevel: "Beginner" },
    { skillName: "SQL", isMandatory: false, requiredLevel: "Beginner" },
  ]);

  const addSkillRow = () => {
    setSkills([...skills, { skillName: "", isMandatory: true, requiredLevel: "Intermediate" }]);
  };

  const removeSkillRow = (idx: number) => {
    const next = [...skills];
    next.splice(idx, 1);
    setSkills(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          skills,
          verificationStatus: "Verified",
        }),
      });

      if (res.ok) {
        router.push("/recruiter");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create opportunity");
      }
    } catch (e) {
      console.error(e);
      alert("Error creating opportunity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/recruiter"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Recruiter Hub</span>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Structured Opportunity Builder</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Create Structured Opportunity
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define mandatory Stage 1 eligibility rules, required skills matrix with proficiency levels,
            and role description for hybrid matching.
          </p>
        </div>

        {/* Section 1: Basic Information */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Basic Opportunity Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Machine Learning Intern"
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opportunity Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Training">Training / Course</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization *
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Example AI Labs"
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location & Workplace Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Islamabad"
                  className="px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs"
                />
                <select
                  value={formData.workplaceType}
                  onChange={(e) => setFormData({ ...formData, workplaceType: e.target.value })}
                  className="px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                >
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Stage 1 Mandatory Hard Eligibility Criteria */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs border-l-4 border-l-blue-600">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Stage 1 Mandatory Eligibility Criteria</span>
            </h2>
            <p className="text-xs text-slate-500">
              Students who fail any of these conditions are strictly marked NOT ELIGIBLE regardless of semantic similarity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minimum GPA (0.00 - 4.00)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.minGpa}
                onChange={(e) =>
                  setFormData({ ...formData, minGpa: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Minimum Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.minExperienceYears}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minExperienceYears: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Work Authorization
              </label>
              <input
                type="text"
                value={formData.workAuthorization}
                onChange={(e) =>
                  setFormData({ ...formData, workAuthorization: e.target.value })
                }
                placeholder="e.g. Pakistan, Global"
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-blue-600"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Allowed Degree / Discipline Patterns
              </label>
              <input
                type="text"
                value={formData.requiredDegree}
                onChange={(e) =>
                  setFormData({ ...formData, requiredDegree: e.target.value })
                }
                placeholder="e.g. Computer Science / Software Engineering / Data Science"
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skills Matrix & Levels */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Skills Requirements Matrix</span>
              </h2>
              <p className="text-xs text-slate-500">
                Mark mandatory skills and minimum expected proficiency levels.
              </p>
            </div>
            <button
              type="button"
              onClick={addSkillRow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {skills.map((sk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
              >
                <input
                  type="text"
                  value={sk.skillName}
                  onChange={(e) => {
                    const next = [...skills];
                    next[idx].skillName = e.target.value;
                    setSkills(next);
                  }}
                  placeholder="Skill Name (e.g. Python, PyTorch)"
                  className="w-1/3 px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 font-bold"
                />

                <select
                  value={sk.requiredLevel}
                  onChange={(e) => {
                    const next = [...skills];
                    next[idx].requiredLevel = e.target.value;
                    setSkills(next);
                  }}
                  className="px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="Beginner">Level: Beginner</option>
                  <option value="Intermediate">Level: Intermediate</option>
                  <option value="Advanced">Level: Advanced</option>
                  <option value="Expert">Level: Expert</option>
                </select>

                <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={sk.isMandatory}
                    onChange={(e) => {
                      const next = [...skills];
                      next[idx].isMandatory = e.target.checked;
                      setSkills(next);
                    }}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Mandatory</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeSkillRow(idx)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Descriptions & Logistics */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Full Description, Responsibilities & Compensation
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                className="w-full p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Key Responsibilities
              </label>
              <textarea
                rows={3}
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                className="w-full p-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Salary / Stipend
                </label>
                <input
                  type="text"
                  value={formData.salaryOrStipend}
                  onChange={(e) => setFormData({ ...formData, salaryOrStipend: e.target.value })}
                  placeholder="e.g. PKR 75,000 / month"
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Opportunity..." : "Publish Verified Opportunity"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
