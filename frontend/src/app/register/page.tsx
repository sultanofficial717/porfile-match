"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Sparkles,
  GraduationCap,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileJson,
} from "lucide-react";
import { api } from "@/lib/api";

export default function StudentRegisterPage() {
  const router = useRouter();

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("Bachelor of Science");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [opportunityTypes, setOpportunityTypes] = useState<string[]>(["job", "internship"]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleType = (type: string) => {
    if (opportunityTypes.includes(type)) {
      if (opportunityTypes.length > 1) {
        setOpportunityTypes(opportunityTypes.filter((t) => t !== type));
      }
    } else {
      setOpportunityTypes([...opportunityTypes, type]);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // 1. Create account via backend auth endpoint
      const signupRes = await api.auth.signup({
        email: email.trim(),
        fullName: fullName.trim(),
        role: "student",
      });

      if (!signupRes.user) {
        throw new Error("Failed to create student account.");
      }

      const user = signupRes.user;

      // 2. Set active user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("current_user_id", user.id);
      }

      // 3. Initialize full profile and preferences in backend DB + file storage
      const initialProfilePayload = {
        fullName: fullName.trim(),
        headline: headline.trim() || `${degree} in ${fieldOfStudy} at ${institution || "University"}`,
        location: location.trim() || "Islamabad",
        country: country.trim() || "Pakistan",
        educations: institution.trim()
          ? [
              {
                institution: institution.trim(),
                degree: degree.trim(),
                fieldOfStudy: fieldOfStudy.trim(),
                gpa: 3.5,
                gpaScale: 4.0,
                isCurrent: true,
              },
            ]
          : [],
        skills: [
          { name: "Python", level: "intermediate", yearsExperience: 2 },
          { name: "TypeScript", level: "intermediate", yearsExperience: 1 },
          { name: "Machine Learning", level: "beginner", yearsExperience: 1 },
        ],
        preferences: {
          opportunityTypes,
          workMode: "any",
          preferredLocations: location.trim() || "Remote",
          minMatchThreshold: 92,
          emailNotificationsEnabled: true,
        },
      };

      await api.student.updateProfile(user.id, initialProfilePayload);

      setSuccessMsg("Account registered successfully! Redirecting to your Profile Onboarding Wizard...");
      
      // 4. Redirect to onboarding wizard to refine details
      setTimeout(() => {
        router.push("/onboarding");
      }, 1200);
    } catch (err: any) {
      console.error("Student registration failed:", err);
      setError(err.message || "Registration failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Student & Early Career Opportunity Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Create Your Student Profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-normal">
          Join MatchAI to discover verified jobs, internships, scholarships, and fellowships. Get matched based on hard eligibility and semantic AI scoring.
        </p>
      </div>

      {/* Main Registration Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Registration Form */}
        <div className="lg:col-span-8 p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Section 1: Account Credentials */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <UserCheck className="w-4 h-4" />
                <span>1. Personal & Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ali@university.edu"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline / Target Role
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior CS Undergrad | Aspiring AI & Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Islamabad"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Pakistan"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Education Initial Info */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <GraduationCap className="w-4 h-4" />
                <span>2. Current Academic Record</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. FAST-NUCES / NUST"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Science"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Field of Study
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Opportunity Preferences */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <Briefcase className="w-4 h-4" />
                <span>3. What Opportunities Do You Want?</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "job", label: "Full-time Job" },
                  { id: "internship", label: "Internship" },
                  { id: "scholarship", label: "Scholarship" },
                  { id: "fellowship", label: "Fellowship" },
                ].map((item) => {
                  const isChecked = opportunityTypes.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleType(item.id)}
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

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Registering Profile in Database...</span>
                ) : (
                  <>
                    <span>Complete Registration & Open Profile Wizard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Information & Value Props */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-4">
            <h3 className="text-base font-bold text-blue-900 dark:text-blue-200">
              Why Register on MatchAI?
            </h3>

            <div className="space-y-3 text-xs text-blue-800 dark:text-blue-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Hard Eligibility Filter:</strong> You only get matched with postings where you meet required GPA, degree, and prerequisite criteria.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Multi-Model AI Semantic Match:</strong> Match against candidate embeddings computed via Ollama / Gemini / Qwen.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Automatic File Storage Backup:</strong> Your structured profile is stored in the database and automatically exported to disk JSON.</span>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Zero Spam:</strong> Notifications are only triggered when match scores exceed your configurable threshold (≥92%).</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl border bg-white dark:bg-slate-900 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <FileJson className="w-4 h-4 text-blue-600" />
              <span>Decoupled API Architecture</span>
            </div>
            <p className="text-slate-500">
              This frontend connects to the backend Express server running at <code className="font-mono text-blue-600">http://localhost:5000/api</code>.
            </p>
            <div className="pt-2 border-t flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Already registered?</span>
              <Link href="/dashboard" className="font-bold text-blue-600 hover:underline">
                View Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
