"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  Award,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  // Form State across 7 steps
  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    country: "",
    headline: "",
    bio: "",
  });

  const [educations, setEducations] = useState<any[]>([
    {
      institution: "",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      gpa: "3.75",
      gpaScale: "4.0",
      startDate: "2022-09-01",
      graduationDate: "2026-06-01",
      isCurrent: true,
    },
  ]);

  const [skills, setSkills] = useState<any[]>([
    { name: "Python", level: "intermediate", yearsExperience: 2 },
    { name: "TypeScript", level: "intermediate", yearsExperience: 2 },
    { name: "Machine Learning", level: "beginner", yearsExperience: 1 },
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");

  const [experiences, setExperiences] = useState<any[]>([
    {
      organization: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  const [projects, setProjects] = useState<any[]>([
    {
      name: "",
      description: "",
      technologies: "",
      role: "",
      projectUrl: "",
      githubUrl: "",
    },
  ]);

  const [certifications, setCertifications] = useState<any[]>([]);

  // Step 6: Preferences (Required)
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
          setPersonal({
            fullName: s.profile?.fullName || "",
            email: s.profile?.email || "",
            phone: s.phone || "",
            location: s.location || "",
            country: s.country || "",
            headline: s.headline || "",
            bio: s.bio || "",
          });
          if (s.educations && s.educations.length > 0) setEducations(s.educations);
          if (s.studentSkills && s.studentSkills.length > 0) {
            setSkills(
              s.studentSkills.map((sk: any) => ({
                name: sk.skill?.name || sk.skillId,
                level: sk.level || "intermediate",
                yearsExperience: sk.yearsExperience || 1,
              }))
            );
          }
          if (s.experiences && s.experiences.length > 0) setExperiences(s.experiences);
          if (s.projects && s.projects.length > 0) setProjects(s.projects);
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
      }).catch(() => {});
    }
  }, []);

  const addSkill = () => {
    if (!newSkillInput.trim()) return;
    setSkills([...skills, { name: newSkillInput.trim(), level: "intermediate", yearsExperience: 1 }]);
    setNewSkillInput("");
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

  const handleSaveAndNext = async (nextStep: number) => {
    if (studentId) {
      setLoading(true);
      try {
        const payload = {
          fullName: personal.fullName,
          phone: personal.phone,
          location: personal.location,
          country: personal.country,
          headline: personal.headline,
          bio: personal.bio,
          educations: educations.filter((e) => e.institution),
          skills: skills,
          experiences: experiences.filter((e) => e.organization && e.position),
          projects: projects.filter((p) => p.name),
          certifications: certifications.filter((c) => c.name),
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
          setCompletionPct(res.student.profileCompletionPct);
        }
      } catch (err) {
        console.warn("Save draft error:", err);
      } finally {
        setLoading(false);
      }
    }
    setCurrentStep(nextStep);
  };

  const finishOnboarding = () => {
    router.push("/dashboard");
  };

  const steps = [
    { num: 1, label: "Personal Info", icon: User },
    { num: 2, label: "Education", icon: GraduationCap },
    { num: 3, label: "Skills", icon: Sparkles },
    { num: 4, label: "Experience & Projects", icon: Briefcase },
    { num: 5, label: "Certifications", icon: Award },
    { num: 6, label: "Preferences", icon: Sliders },
    { num: 7, label: "Confirmation", icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Wizard Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-blue-600 uppercase tracking-wider">
            Step {currentStep} of 7 — {steps[currentStep - 1].label}
          </span>
          <span className="font-semibold text-slate-500">
            {Math.round((currentStep / 7) * 100)}% Completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>

        {/* Step Indicator Pills */}
        <div className="hidden sm:grid grid-cols-7 gap-1 pt-1">
          {steps.map((s) => (
            <button
              key={s.num}
              onClick={() => handleSaveAndNext(s.num)}
              className={`flex items-center justify-center p-2 rounded-xl text-[11px] font-bold transition-all ${
                s.num === currentStep
                  ? "bg-blue-600 text-white shadow-xs"
                  : s.num < currentStep
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {s.num}. {s.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Wizard Form Container */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-6">
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Personal Information & Headline
            </h2>
            <p className="text-xs text-slate-500">
              Provide your core contact information and a concise professional headline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  placeholder="e.g. Ali Ahmed"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  placeholder="ali@university.edu"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={personal.location}
                  onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                  placeholder="Islamabad, Pakistan"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                value={personal.headline}
                onChange={(e) => setPersonal({ ...personal, headline: e.target.value })}
                placeholder="e.g. CS Senior | Aspiring Machine Learning Engineer"
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bio / Summary (~300 chars)
              </label>
              <textarea
                rows={3}
                value={personal.bio}
                onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
                placeholder="Brief summary of your academic background, core projects, and career interests..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Education History</h2>
                <p className="text-xs text-slate-500">Add your university degree and GPA records.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEducations([
                    ...educations,
                    {
                      institution: "",
                      degree: "Bachelor of Science",
                      fieldOfStudy: "",
                      gpa: "3.5",
                      gpaScale: "4.0",
                      isCurrent: true,
                    },
                  ])
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another Education
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
                      placeholder="e.g. NUST / FAST-NUCES"
                      className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
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
                      className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
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
                      className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        GPA / CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={edu.gpa}
                        onChange={(e) => {
                          const next = [...educations];
                          next[idx].gpa = e.target.value;
                          setEducations(next);
                        }}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Scale
                      </label>
                      <input
                        type="number"
                        value={edu.gpaScale || 4.0}
                        onChange={(e) => {
                          const next = [...educations];
                          next[idx].gpaScale = e.target.value;
                          setEducations(next);
                        }}
                        className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Skills */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Skills Matrix</h2>
            <p className="text-xs text-slate-500">
              Add technical skills, proficiency levels, and experience duration (at least 3 skills recommended).
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Type skill name (e.g. PyTorch, React, SQL)..."
                className="flex-1 px-3.5 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Add Skill
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {skills.map((sk, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border bg-slate-50 dark:bg-slate-800"
                >
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{sk.name}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={sk.level}
                      onChange={(e) => {
                        const next = [...skills];
                        next[idx].level = e.target.value;
                        setSkills(next);
                      }}
                      className="text-xs px-2 py-1 rounded-lg border bg-white dark:bg-slate-900 font-semibold"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Experience & Projects */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Experience & Projects</h2>
              <p className="text-xs text-slate-500">Add internships, part-time roles, or hands-on projects (Optional).</p>
            </div>

            {/* Experience Sub-section */}
            <div className="space-y-3 p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Work Experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={experiences[0]?.organization || ""}
                  onChange={(e) => {
                    const next = [...experiences];
                    next[0] = { ...next[0], organization: e.target.value };
                    setExperiences(next);
                  }}
                  placeholder="Company / Organization"
                  className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={experiences[0]?.position || ""}
                  onChange={(e) => {
                    const next = [...experiences];
                    next[0] = { ...next[0], position: e.target.value };
                    setExperiences(next);
                  }}
                  placeholder="Position / Title"
                  className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>
              <textarea
                rows={2}
                value={experiences[0]?.description || ""}
                onChange={(e) => {
                  const next = [...experiences];
                  next[0] = { ...next[0], description: e.target.value };
                  setExperiences(next);
                }}
                placeholder="Key responsibilities and accomplishments..."
                className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
              />
            </div>

            {/* Projects Sub-section */}
            <div className="space-y-3 p-4 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Featured Project</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={projects[0]?.name || ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[0] = { ...next[0], name: e.target.value };
                    setProjects(next);
                  }}
                  placeholder="Project Title"
                  className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  value={projects[0]?.technologies || ""}
                  onChange={(e) => {
                    const next = [...projects];
                    next[0] = { ...next[0], technologies: e.target.value };
                    setProjects(next);
                  }}
                  placeholder="Technologies (e.g. Next.js, PyTorch)"
                  className="px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
                />
              </div>
              <textarea
                rows={2}
                value={projects[0]?.description || ""}
                onChange={(e) => {
                  const next = [...projects];
                  next[0] = { ...next[0], description: e.target.value };
                  setProjects(next);
                }}
                placeholder="Brief project description..."
                className="w-full px-3 py-1.5 text-sm rounded-xl border bg-white dark:bg-slate-800"
              />
            </div>
          </div>
        )}

        {/* Step 5: Certifications */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Certifications & Courses</h2>
            <p className="text-xs text-slate-500">Add credentials, online courses, or honors (Optional).</p>

            <button
              type="button"
              onClick={() =>
                setCertifications([
                  ...certifications,
                  { name: "Deep Learning Specialization", issuer: "Coursera / DeepLearning.AI" },
                ])
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>

            {certifications.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 flex gap-2">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => {
                    const next = [...certifications];
                    next[idx].name = e.target.value;
                    setCertifications(next);
                  }}
                  placeholder="Certificate Name"
                  className="flex-1 px-3 py-1 text-sm rounded-lg border bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  value={c.issuer}
                  onChange={(e) => {
                    const next = [...certifications];
                    next[idx].issuer = e.target.value;
                    setCertifications(next);
                  }}
                  placeholder="Issuer"
                  className="w-48 px-3 py-1 text-sm rounded-lg border bg-white dark:bg-slate-900"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Preferences (Load-bearing / Required Step) */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase">
                Required Step
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Opportunity Preferences & Notification Settings
              </h2>
              <p className="text-xs text-slate-500">
                Configure exactly what opportunities you want to be matched against.
              </p>
            </div>

            {/* Opportunity Types */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                What kind of opportunities are you looking for? (Select all that apply)
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
                          : "bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      {isChecked && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>

              {/* Reserved Coming Soon Types */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 opacity-50">
                {["Competition", "Research", "Training", "Volunteer"].map((label) => (
                  <div
                    key={label}
                    className="p-3 rounded-2xl border border-dashed bg-slate-50 dark:bg-slate-800 text-xs text-slate-400 font-medium flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <span className="text-[9px] uppercase font-bold text-slate-400">Soon</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Work Mode */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Work Mode Preference
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
                  Minimum Match Score Threshold
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

            {/* Notification Email Checkbox */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Email Me When Strong Match Is Found
                </p>
                <p className="text-[11px] text-slate-500">
                  Receive immediate personalized emails with match explanation & apply link.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.emailNotificationsEnabled}
                onChange={(e) =>
                  setPreferences({ ...preferences, emailNotificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
          </div>
        )}

        {/* Step 7: Confirmation */}
        {currentStep === 7 && (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Your Profile Is Live!
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We will continuously evaluate your profile against published opportunities and email you when we find a strong match.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 max-w-sm mx-auto">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">
                Profile Completeness Score: {completionPct}%
              </p>
              <div className="w-full h-2 bg-blue-200 dark:bg-blue-900 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <button
              onClick={finishOnboarding}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Go to Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between pt-4 border-t">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => handleSaveAndNext(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSaveAndNext(currentStep + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
            >
              <span>{loading ? "Saving..." : currentStep === 6 ? "Finish Setup" : "Save & Continue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
