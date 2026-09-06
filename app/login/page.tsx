"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  UserCheck,
  Building2,
  ShieldCheck,
  ArrowRight,
  Mail,
  User,
  Building,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Zap,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = searchParams.get("mode") === "register" || searchParams.get("mode") === "getstarted" ? "getstarted" : "signin";
  const initialRoleParam = (searchParams.get("role") || "").toUpperCase();
  const initialRole: "STUDENT" | "RECRUITER" | "ADMIN" =
    initialRoleParam === "RECRUITER" || initialRoleParam === "ADMIN" ? initialRoleParam : "STUDENT";

  const [mode, setMode] = useState<"signin" | "getstarted">(initialMode);
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">(initialRole);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/auth/session?guest=true");
        if (res.ok) {
          const data = await res.json();
          setAvailableUsers(data.availableUsers || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSuccessfulAuth = (user: any) => {
    localStorage.setItem("current_user_id", user.id);
    localStorage.setItem("user_authenticated", "true");

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { user, action: "login" },
        })
      );
    }

    setSuccessMsg(`Welcome, ${user.name}! Redirecting to your portal...`);

    setTimeout(() => {
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "RECRUITER") {
        router.push("/recruiter");
      } else {
        router.push("/dashboard");
      }
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    if (mode === "getstarted" && !name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        email: email.trim(),
        role: selectedRole,
      };

      if (mode === "getstarted") {
        payload.name = name.trim();
        if (selectedRole === "RECRUITER") {
          payload.companyName = companyName.trim() || "Company";
          payload.position = position.trim() || "Talent Acquisition";
        } else if (selectedRole === "STUDENT") {
          payload.university = university.trim() || "University";
          payload.degree = degree.trim() || "Computer Science";
        }
      }

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Authentication failed. Please check your credentials.");
      }

      if (data.user) {
        handleSuccessfulAuth(data.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleFilteredUsers = availableUsers.filter((u) => u.role === selectedRole);

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6436e9] via-[#815af3] to-[#7ef7de]" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6436e9]/10 text-[#6436e9] dark:text-[#815af3] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Role AI Match Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {mode === "signin" ? "Sign In to EasyMatch" : "Create Your Account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              {mode === "signin"
                ? "Choose your role to access Candidate matching, Recruiter sourcing, or Admin controls."
                : "Join thousands of students and hiring teams on the AI opportunity matching network."}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-md mx-auto">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("getstarted");
                setErrorMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === "getstarted"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started Free</span>
            </button>
          </div>

          {/* Step 1: Role Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Choose Your Portal Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Candidate */}
              <button
                type="button"
                onClick={() => setSelectedRole("STUDENT")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  selectedRole === "STUDENT"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900/50"
                }`}
              >
                {selectedRole === "STUDENT" && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#6436e9]" />
                )}
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-[#6436e9] dark:text-[#815af3] flex items-center justify-center mb-2.5">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Candidate</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Jobs, internships & AI resume optimization
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-[#6436e9] dark:text-[#815af3]">
                  → Candidate Feed
                </div>
              </button>

              {/* Recruiter */}
              <button
                type="button"
                onClick={() => setSelectedRole("RECRUITER")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  selectedRole === "RECRUITER"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900/50"
                }`}
              >
                {selectedRole === "RECRUITER" && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#6436e9]" />
                )}
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2.5">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recruiter</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  AI sourcing, candidate matches & job posting
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                  → Recruiter Hub
                </div>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative cursor-pointer ${
                  selectedRole === "ADMIN"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900/50"
                }`}
              >
                {selectedRole === "ADMIN" && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#6436e9]" />
                )}
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mb-2.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Administrator</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Manage model weights, audits & verification
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-purple-600 dark:text-purple-400">
                  → Admin Panel
                </div>
              </button>
            </div>
          </div>

          {/* Quick Demo 1-Click Login Section */}
          {roleFilteredUsers.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/40 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#6436e9]" />
                  Instant 1-Click Demo Login ({selectedRole}):
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Zero setup
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roleFilteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSuccessfulAuth(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6436e9] dark:hover:border-[#815af3] hover:shadow-xs transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0)
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {selectedRole === "RECRUITER"
                            ? u.recruiterProfile?.companyName || "Employer"
                            : selectedRole === "STUDENT"
                            ? u.studentProfile?.degree || u.email
                            : "Platform Admin"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#6436e9] dark:text-[#815af3] opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                      Login →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "signin" ? "Or sign in with email" : "Or create custom profile"}
            </span>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "getstarted" && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "STUDENT"
                      ? "student@berkeley.edu"
                      : selectedRole === "RECRUITER"
                      ? "recruiter@company.com"
                      : "admin@easymatch.com"
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {mode === "getstarted" && selectedRole === "RECRUITER" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Stripe"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hiring Position
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="e.g. Talent Acquisition"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            {mode === "getstarted" && selectedRole === "STUDENT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University / College
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. UC Berkeley"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Major / Degree
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#6436e9] hover:bg-[#5228cb] text-white font-extrabold text-sm shadow-lg shadow-[#6436e9]/30 transition-all hover:scale-[1.01] disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : mode === "signin" ? (
                <>
                  <span>Sign In as {selectedRole === "STUDENT" ? "Candidate" : selectedRole === "RECRUITER" ? "Recruiter" : "Admin"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create {selectedRole === "STUDENT" ? "Candidate" : selectedRole === "RECRUITER" ? "Recruiter" : "Admin"} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link href="/" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium mr-4">
              ← Return to Home
            </Link>
            {mode === "signin" ? (
              <span>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("getstarted")}
                  className="font-bold text-[#6436e9] dark:text-[#815af3] hover:underline cursor-pointer"
                >
                  Create free account
                </button>
              </span>
            ) : (
              <span>
                Existing user?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-bold text-[#6436e9] dark:text-[#815af3] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Loading portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}
