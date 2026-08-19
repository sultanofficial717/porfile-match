"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Award,
  HeartHandshake,
  Languages as LanguagesIcon,
  Shield,
  FileUp,
  Sparkles,
  Layers,
} from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem("current_user_id");
        const sessRes = await fetch(
          storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session`
        );
        const sessData = await sessRes.json();
        const curUser = sessData.currentUser;

        if (curUser && curUser.studentProfile) {
          const res = await fetch(`/api/students/${curUser.studentProfile.id}`);
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch(`/api/students/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.user?.name,
          bio: profile.bio,
          location: profile.location,
          gpa: profile.gpa,
          university: profile.university,
          degree: profile.degree,
          graduationYear: profile.graduationYear,
          yearsExperience: profile.yearsExperience,
          workAuthorization: profile.workAuthorization,
          portfolioUrl: profile.portfolioUrl,
          githubUrl: profile.githubUrl,
          linkedinUrl: profile.linkedinUrl,
          skills: profile.skills || [],
          educations: profile.educations || [],
          experiences: profile.experiences || [],
          projects: profile.projects || [],
          certifications: profile.certifications || [],
          communityWork: profile.communityWork || [],
          achievements: profile.achievements || [],
          languages: profile.languages || [],
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  // Helper mutation functions
  const addSkill = () => {
    const newSkill = { skillName: "", level: "Intermediate", yearsExperience: 1.0 };
    setProfile({ ...profile, skills: [...(profile.skills || []), newSkill] });
  };
  const removeSkill = (index: number) => {
    const updated = [...(profile.skills || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, skills: updated });
  };

  const addEducation = () => {
    const newEdu = {
      institution: "",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      gpa: 3.5,
      startYear: 2021,
      endYear: 2025,
      isCurrent: true,
      courses: "",
    };
    setProfile({ ...profile, educations: [...(profile.educations || []), newEdu] });
  };
  const removeEducation = (index: number) => {
    const updated = [...(profile.educations || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, educations: updated });
  };

  const addExperience = () => {
    const newExp = {
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      startDate: "2023-01",
      endDate: "",
      isCurrent: true,
      description: "",
      years: 1.0,
      months: 0,
    };
    setProfile({ ...profile, experiences: [...(profile.experiences || []), newExp] });
  };
  const removeExperience = (index: number) => {
    const updated = [...(profile.experiences || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, experiences: updated });
  };

  const addProject = () => {
    const newProj = { title: "", description: "", technologies: "" };
    setProfile({ ...profile, projects: [...(profile.projects || []), newProj] });
  };
  const removeProject = (index: number) => {
    const updated = [...(profile.projects || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, projects: updated });
  };

  const addCertification = () => {
    const newCert = { name: "", issuer: "" };
    setProfile({ ...profile, certifications: [...(profile.certifications || []), newCert] });
  };
  const removeCertification = (index: number) => {
    const updated = [...(profile.certifications || [])];
    updated.splice(index, 1);
    setProfile({ ...profile, certifications: updated });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-12">No student profile active.</div>;
  }

  const tabs = [
    { id: "about", label: "About & Basic", icon: User },
    { id: "education", label: "Education & GPA", icon: GraduationCap },
    { id: "skills", label: "Skills Matrix", icon: Layers },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: BookOpen },
    { id: "certifications", label: "Certifications & Honors", icon: Award },
    { id: "community", label: "Community & Languages", icon: HeartHandshake },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white text-2xl font-bold">
              {profile.user?.avatar ? (
                <img
                  src={profile.user.avatar}
                  alt={profile.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.user?.name?.charAt(0) || "U"
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {profile.user?.name || "Student Name"}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {profile.degree || "Major"} · {profile.university || "University"}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900">
                  GPA: {profile.gpa ? profile.gpa.toFixed(2) : "N/A"}
                </span>
                <span>{profile.location || "Pakistan"}</span>
                <span>•</span>
                <span>{profile.yearsExperience || 0} yrs experience</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href="/profile/import"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <FileUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Import CV / Resume</span>
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : "Save Profile"}</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profile updated successfully and profile completeness score recalculated!
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: About & Basic Info */}
      {activeTab === "about" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Personal & Career Summary
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profile.user?.name || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    user: { ...profile.user, name: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Professional Bio / Career Objective
              </label>
              <textarea
                rows={4}
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Describe your background, technical interests, and goals..."
                className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g. Islamabad, Pakistan"
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Authorization
                </label>
                <input
                  type="text"
                  value={profile.workAuthorization || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, workAuthorization: e.target.value })
                  }
                  placeholder="e.g. Pakistan, Remote"
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="text"
                  value={profile.githubUrl || ""}
                  onChange={(e) => setProfile({ ...profile, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="text"
                  value={profile.linkedinUrl || ""}
                  onChange={(e) => setProfile({ ...profile, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Portfolio / Website
                </label>
                <input
                  type="text"
                  value={profile.portfolioUrl || ""}
                  onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border bg-slate-50/50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Education & GPA */}
      {activeTab === "education" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Education & Academic Records
              </h3>
              <p className="text-xs text-slate-500">
                GPA and degree disciplines are strictly validated during Stage 1 Hard Eligibility checks.
              </p>
            </div>
            <button
              onClick={addEducation}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Degree
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Cumulative GPA (0.00 - 4.00)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={profile.gpa || ""}
                onChange={(e) => setProfile({ ...profile, gpa: parseFloat(e.target.value) || null })}
                className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Degree Title
              </label>
              <input
                type="text"
                value={profile.degree || ""}
                onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                placeholder="e.g. BS Computer Science"
                className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                University / Institution
              </label>
              <input
                type="text"
                value={profile.university || ""}
                onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                placeholder="e.g. NUST Islamabad"
                className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {profile.educations?.map((edu: any, index: number) => (
              <div key={index} className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Degree Record #{index + 1}
                  </span>
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[index].institution = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                    placeholder="Institution / University"
                    className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => {
                      const updated = [...profile.educations];
                      updated[index].fieldOfStudy = e.target.value;
                      setProfile({ ...profile, educations: updated });
                    }}
                    placeholder="Field of Study (e.g. Computer Science)"
                    className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  />
                </div>

                <input
                  type="text"
                  value={edu.courses || ""}
                  onChange={(e) => {
                    const updated = [...profile.educations];
                    updated[index].courses = e.target.value;
                    setProfile({ ...profile, educations: updated });
                  }}
                  placeholder="Key relevant coursework (e.g. Deep Learning, Data Structures, Algorithms)"
                  className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Skills Matrix */}
      {activeTab === "skills" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Technical & Professional Skills
              </h3>
              <p className="text-xs text-slate-500">
                Specify proficiency levels (Beginner, Intermediate, Advanced, Expert) for accurate match rank.
              </p>
            </div>
            <button
              onClick={addSkill}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {profile.skills?.map((sk: any, index: number) => (
              <div
                key={index}
                className="p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={sk.skillName}
                    onChange={(e) => {
                      const updated = [...profile.skills];
                      updated[index].skillName = e.target.value;
                      setProfile({ ...profile, skills: updated });
                    }}
                    placeholder="e.g. Python, PyTorch"
                    className="w-full px-2.5 py-1 rounded-lg border text-xs font-bold bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={() => removeSkill(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sk.level}
                    onChange={(e) => {
                      const updated = [...profile.skills];
                      updated[index].level = e.target.value;
                      setProfile({ ...profile, skills: updated });
                    }}
                    className="w-full px-2 py-1 rounded-lg border text-xs bg-white dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>

                  <input
                    type="number"
                    step="0.5"
                    value={sk.yearsExperience || 1}
                    onChange={(e) => {
                      const updated = [...profile.skills];
                      updated[index].yearsExperience = parseFloat(e.target.value) || 1;
                      setProfile({ ...profile, skills: updated });
                    }}
                    title="Years of experience"
                    className="w-16 px-2 py-1 rounded-lg border text-xs text-center bg-white dark:bg-slate-800"
                  />
                  <span className="text-[10px] text-slate-400">yrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Experience */}
      {activeTab === "experience" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Work & Internship Experience
              </h3>
              <p className="text-xs text-slate-500">
                Total professional experience is compared against opportunity requirements.
              </p>
            </div>
            <button
              onClick={addExperience}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience
            </button>
          </div>

          <div className="space-y-4">
            {profile.experiences?.map((exp: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Experience #{index + 1}
                  </span>
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[index].title = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                    placeholder="Job Title (e.g. AI Engineering Intern)"
                    className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800 font-bold"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[index].company = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                    placeholder="Company / Organization"
                    className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={exp.type || "Full-time"}
                    onChange={(e) => {
                      const updated = [...profile.experiences];
                      updated[index].type = e.target.value;
                      setProfile({ ...profile, experiences: updated });
                    }}
                    placeholder="Type (Internship, Full-time)"
                    className="px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                  />
                </div>

                <textarea
                  rows={2}
                  value={exp.description || ""}
                  onChange={(e) => {
                    const updated = [...profile.experiences];
                    updated[index].description = e.target.value;
                    setProfile({ ...profile, experiences: updated });
                  }}
                  placeholder="Key contributions and achievements..."
                  className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Projects */}
      {activeTab === "projects" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Technical Projects & Portfolio
              </h3>
              <p className="text-xs text-slate-500">
                Projects enrich the normalized semantic embedding document.
              </p>
            </div>
            <button
              onClick={addProject}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          <div className="space-y-4">
            {profile.projects?.map((p: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={p.title}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[index].title = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                    placeholder="Project Title"
                    className="w-full sm:w-1/2 px-3 py-1.5 rounded-xl border text-xs font-bold bg-white dark:bg-slate-800"
                  />
                  <button
                    onClick={() => removeProject(index)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={p.technologies}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[index].technologies = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  placeholder="Technologies used (e.g. Python, PyTorch, FastAPI, Next.js)"
                  className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />

                <textarea
                  rows={2}
                  value={p.description}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[index].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  placeholder="Project architecture and results achieved..."
                  className="w-full px-3 py-1.5 rounded-xl border text-xs bg-white dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Certifications & Honors */}
      {activeTab === "certifications" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Certifications & Badges
            </h3>
            <button
              onClick={addCertification}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.certifications?.map((c: any, index: number) => (
              <div
                key={index}
                className="p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...profile.certifications];
                      updated[index].name = e.target.value;
                      setProfile({ ...profile, certifications: updated });
                    }}
                    placeholder="Certification Name"
                    className="w-full px-2.5 py-1 rounded-lg border text-xs font-bold bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={c.issuer}
                    onChange={(e) => {
                      const updated = [...profile.certifications];
                      updated[index].issuer = e.target.value;
                      setProfile({ ...profile, certifications: updated });
                    }}
                    placeholder="Issuer (e.g. DeepLearning.AI, AWS)"
                    className="w-full px-2.5 py-1 rounded-lg border text-xs bg-white dark:bg-slate-800"
                  />
                </div>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-rose-500 hover:text-rose-700 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Community & Languages */}
      {activeTab === "community" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Community, Volunteer Work & Languages
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Volunteer & Community Activities
              </label>
              <textarea
                rows={3}
                value={
                  profile.communityWork?.[0]?.description ||
                  "Lead AI Workshop Instructor for GDSC, mentoring 100+ undergraduates."
                }
                onChange={(e) => {
                  const updated = [...(profile.communityWork || [])];
                  if (updated.length === 0) {
                    updated.push({
                      title: "Lead Instructor",
                      organization: "GDSC",
                      description: e.target.value,
                    });
                  } else {
                    updated[0].description = e.target.value;
                  }
                  setProfile({ ...profile, communityWork: updated });
                }}
                className="w-full px-3.5 py-2 rounded-xl border text-xs bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Privacy & Recruiter Visibility
                </p>
                <p className="text-[11px] text-slate-500">
                  Allow verified recruiters to discover your profile and match with opportunities.
                </p>
              </div>
              <input
                type="checkbox"
                checked={profile.allowRecruiterView !== false}
                onChange={(e) =>
                  setProfile({ ...profile, allowRecruiterView: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
