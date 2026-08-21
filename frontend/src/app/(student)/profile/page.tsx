"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  FolderGit2,
  Award,
  BookOpen,
  Sliders,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Download,
  FileJson,
  ExternalLink,
  Mail,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function StudentProfileSettingsPage() {
  const [studentId, setStudentId] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Personal Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // 2. Educations
  const [educations, setEducations] = useState<any[]>([]);

  // 3. Skills Matrix
  const [skills, setSkills] = useState<any[]>([]);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("intermediate");
  const [newSkillYears, setNewSkillYears] = useState(1);

  // 4. Experiences
  const [experiences, setExperiences] = useState<any[]>([]);

  // 5. Projects
  const [projects, setProjects] = useState<any[]>([]);

  // 6. Certifications & Courses
  const [certifications, setCertifications] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // 7. Preferences (Required for Matching)
  const [preferences, setPreferences] = useState({
    opportunityTypes: ["job", "internship"],
    workMode: "any",
    preferredLocations: "Islamabad, Remote",
    minMatchThreshold: 92,
    emailNotificationsEnabled: true,
  });

  const [completionPct, setCompletionPct] = useState(0);

  useEffect(() => {
    const id = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
    if (id) {
      setStudentId(id);
      api.student.getProfile(id).then((res) => {
        if (res.student) {
          const s = res.student;
          setStudent(s);
          setFullName(s.profile?.fullName || "");
          setEmail(s.profile?.email || "");
          setPhone(s.phone || "");
          setLocation(s.location || "");
          setCountry(s.country || "");
          setHeadline(s.headline || "");
          setBio(s.bio || "");
          setEducations(s.educations || []);
          setSkills(
            (s.studentSkills || []).map((sk: any) => ({
              name: sk.skill?.name || sk.skillId,
              level: sk.level || "intermediate",
              yearsExperience: sk.yearsExperience || 1,
            }))
          );
          setExperiences(s.experiences || []);
          setProjects(s.projects || []);
          setCertifications(s.certifications || []);
          setCourses(s.courses || []);

          if (s.preferences) {
            try {
              const types = typeof s.preferences.opportunityTypes === "string"
                ? JSON.parse(s.preferences.opportunityTypes)
                : s.preferences.opportunityTypes;
              setPreferences({
                opportunityTypes: types || ["job", "internship"],
                workMode: s.preferences.workMode || "any",
                preferredLocations: s.preferences.preferredLocations || "Remote",
                minMatchThreshold: s.preferences.minMatchThreshold || 92,
                emailNotificationsEnabled: s.preferences.emailNotificationsEnabled !== false,
              });
            } catch {}
          }
          setCompletionPct(s.profileCompletionPct || 50);
        }
      }).catch((err) => {
        console.warn("Fetch student error:", err);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        yearsExperience: Number(newSkillYears) || 1,
      },
    ]);
    setNewSkillName("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const toggleOpportunityType = (type: string) => {
    const current = [...preferences.opportunityTypes];
    const index = current.indexOf(type);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      }
    } else {
      current.push(type);
    }
    setPreferences({ ...preferences, opportunityTypes: current });
  };

  const handleSaveProfile = async () => {
    if (!studentId) {
      setError("No active student session found. Please register or select a student user.");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const payload = {
        fullName,
        phone,
        location,
        country,
        headline,
        bio,
        educations: educations.filter((e) => e.institution),
        skills,
        experiences: experiences.filter((e) => e.organization && e.position),
        projects: projects.filter((p) => p.name),
        certifications: certifications.filter((c) => c.name),
        courses: courses.filter((c) => c.name),
        preferences: {
          opportunityTypes: preferences.opportunityTypes,
          workMode: preferences.workMode,
          preferredLocations: preferences.preferredLocations,
          minMatchThreshold: preferences.minMatchThreshold,
          emailNotificationsEnabled: preferences.emailNotificationsEnabled,
        },
      };

      const res = await api.student.updateProfile(studentId, payload);
      if (res.student) {
        setStudent(res.student);
        setCompletionPct(res.student.profileCompletionPct);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err: any) {
      console.error("Save profile error:", err);
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadFile = () => {
    if (!studentId) return;
    window.open(api.student.getFileExportUrl(studentId), "_blank");
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-slate-400">
        Loading student profile data from API...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* 1. Header Profile Summary Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {fullName || "Student Profile"}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold uppercase">
              Student Role
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {headline || "No headline set"} &bull; {location || "Remote"} {country ? `, ${country}` : ""}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Profile Completeness: <strong className="text-blue-600 font-mono">{completionPct}%</strong>
            </span>
            <div className="w-36 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {studentId && (
            <button
              onClick={handleDownloadFile}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-xs"
              title="Download JSON Profile File from backend disk storage"
            >
              <FileJson className="w-4 h-4 text-blue-600" />
              <span>Export JSON File</span>
              <Download className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved &amp; File Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving to DB & File..." : "Save Profile"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Personal & Contact Information */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <User className="w-4 h-4 text-blue-600" />
          <span>1. Personal &amp; Contact Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+92 300 1234567"
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City / Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Islamabad"
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Professional Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Computer Science Senior | PyTorch & Full-Stack AI Developer"
            className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Bio / Professional Summary (~300 chars)
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Brief overview of your academic focus, projects, and career aspirations..."
            className="w-full px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
        </div>
      </div>

      {/* 3. Education Records */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>2. Education History (Used for Hard Eligibility Filters)</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setEducations([
                ...educations,
                {
                  institution: "",
                  degree: "Bachelor of Science",
                  fieldOfStudy: "Computer Science",
                  gpa: 3.5,
                  gpaScale: 4.0,
                  isCurrent: true,
                },
              ])
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Degree
          </button>
        </div>

        {educations.map((edu, idx) => (
          <div key={idx} className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const next = [...educations];
                    next[idx].institution = e.target.value;
                    setEducations(next);
                  }}
                  placeholder="e.g. FAST-NUCES / NUST"
                  className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const next = [...educations];
                    next[idx].degree = e.target.value;
                    setEducations(next);
                  }}
                  placeholder="e.g. Bachelor of Science"
                  className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => {
                    const next = [...educations];
                    next[idx].fieldOfStudy = e.target.value;
                    setEducations(next);
                  }}
                  placeholder="e.g. Computer Science"
                  className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GPA / CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={edu.gpa || ""}
                    onChange={(e) => {
                      const next = [...educations];
                      next[idx].gpa = parseFloat(e.target.value);
                      setEducations(next);
                    }}
                    placeholder="3.5"
                    className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEducations(educations.filter((_, i) => i !== idx))}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl"
                  title="Remove education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Skills Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>3. Skills Matrix (Technical Skills &amp; Proficiency)</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Type skill name (e.g. PyTorch, Next.js, Docker)..."
            className="flex-1 px-3.5 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.5"
            value={newSkillYears}
            onChange={(e) => setNewSkillYears(parseFloat(e.target.value) || 1)}
            placeholder="Yrs"
            className="w-20 px-3 py-2 text-xs font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Add Skill
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
          {skills.map((sk, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs"
            >
              <div className="truncate">
                <p className="font-bold text-slate-900 dark:text-white truncate">{sk.name}</p>
                <p className="text-[10px] text-slate-500 font-medium capitalize">
                  {sk.level || "intermediate"} &bull; {sk.yearsExperience || 1} yr(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeSkill(idx)}
                className="text-slate-400 hover:text-rose-600 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Work Experience */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>4. Work Experience &amp; Internships</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setExperiences([
                ...experiences,
                { organization: "", position: "", startDate: "", endDate: "", description: "" },
              ])
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        </div>

        {experiences.map((exp, idx) => (
          <div key={idx} className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={exp.organization}
                onChange={(e) => {
                  const next = [...experiences];
                  next[idx].organization = e.target.value;
                  setExperiences(next);
                }}
                placeholder="Company / Organization"
                className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                value={exp.position}
                onChange={(e) => {
                  const next = [...experiences];
                  next[idx].position = e.target.value;
                  setExperiences(next);
                }}
                placeholder="Position / Title"
                className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
              />
            </div>
            <textarea
              rows={2}
              value={exp.description || ""}
              onChange={(e) => {
                const next = [...experiences];
                next[idx].description = e.target.value;
                setExperiences(next);
              }}
              placeholder="Responsibilities, technologies used, and achievements..."
              className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
            />
          </div>
        ))}
      </div>

      {/* 6. Featured Projects */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <FolderGit2 className="w-4 h-4 text-blue-600" />
            <span>5. Featured Projects</span>
          </div>
          <button
            type="button"
            onClick={() =>
              setProjects([
                ...projects,
                { name: "", description: "", technologies: "", projectUrl: "", githubUrl: "" },
              ])
            }
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </div>

        {projects.map((proj, idx) => (
          <div key={idx} className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={proj.name}
                onChange={(e) => {
                  const next = [...projects];
                  next[idx].name = e.target.value;
                  setProjects(next);
                }}
                placeholder="Project Name"
                className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                value={proj.technologies}
                onChange={(e) => {
                  const next = [...projects];
                  next[idx].technologies = e.target.value;
                  setProjects(next);
                }}
                placeholder="Technologies (e.g. Next.js, PyTorch, Tailwind)"
                className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
              />
            </div>
            <textarea
              rows={2}
              value={proj.description || ""}
              onChange={(e) => {
                const next = [...projects];
                next[idx].description = e.target.value;
                setProjects(next);
              }}
              placeholder="Project overview and impact..."
              className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-900"
            />
          </div>
        ))}
      </div>

      {/* 7. Matching Preferences (Load-Bearing Step) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
            Load-Bearing Filter
          </div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">
            6. Opportunity Preferences &amp; Notification Thresholds
          </h2>
          <p className="text-xs text-slate-500">
            These preferences gate the matching engine before any semantic or eligibility scoring runs.
          </p>
        </div>

        {/* Types */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Opportunity Types Wanted:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: "job", label: "Full-time Job" },
              { id: "internship", label: "Internship" },
              { id: "scholarship", label: "Scholarship" },
              { id: "fellowship", label: "Fellowship" },
            ].map((item) => {
              const isChecked = preferences.opportunityTypes.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleOpportunityType(item.id)}
                  className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                    isChecked
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>{item.label}</span>
                  {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Work Mode */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Work Mode
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "any", label: "Any" },
              { id: "remote", label: "Remote" },
              { id: "hybrid", label: "Hybrid" },
              { id: "onsite", label: "On-site" },
            ].map((mode) => (
              <button
                type="button"
                key={mode.id}
                onClick={() => setPreferences({ ...preferences, workMode: mode.id })}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  preferences.workMode === mode.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Match Threshold Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-800 dark:text-slate-200">
              Minimum Match Score Threshold to Alert:
            </label>
            <span className="font-mono font-bold text-blue-600">
              {preferences.minMatchThreshold}%
            </span>
          </div>
          <input
            type="range"
            min="85"
            max="99"
            value={preferences.minMatchThreshold}
            onChange={(e) =>
              setPreferences({ ...preferences, minMatchThreshold: parseInt(e.target.value, 10) })
            }
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>85% (Broader)</span>
            <span>92% (Default)</span>
            <span>99% (Strict)</span>
          </div>
        </div>

        {/* Email Notification Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Send Email Alerts on Strong Match (≥{preferences.minMatchThreshold}%)
            </p>
            <p className="text-[11px] text-slate-500">
              Receives immediate notification with score explanation &amp; direct apply link.
            </p>
          </div>
          <input
            type="checkbox"
            checked={preferences.emailNotificationsEnabled}
            onChange={(e) =>
              setPreferences({ ...preferences, emailNotificationsEnabled: e.target.checked })
            }
            className="w-5 h-5 rounded accent-blue-600"
          />
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-2xl border bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 transition-all"
        >
          Go to Student Match Feed →
        </Link>
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          {savedSuccess ? "Saved!" : saving ? "Saving to Database & File..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
