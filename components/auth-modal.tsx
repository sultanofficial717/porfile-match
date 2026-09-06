"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
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
  ChevronRight,
  Zap,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "getstarted";
  defaultRole?: "STUDENT" | "RECRUITER" | "ADMIN";
  onSuccess?: (user: any) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultMode = "signin",
  defaultRole = "STUDENT",
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "getstarted">(defaultMode);
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">(defaultRole);
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

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setSelectedRole(defaultRole);
      setErrorMsg("");
      setSuccessMsg("");
      fetchAvailableUsers();
    }
  }, [isOpen, defaultMode, defaultRole]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/auth/session?guest=true");
      if (res.ok) {
        const data = await res.json();
        setAvailableUsers(data.availableUsers || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSuccessfulAuth = (user: any) => {
    localStorage.setItem("current_user_id", user.id);
    localStorage.setItem("user_authenticated", "true");

    // Notify other components like Navbar reactively
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { user, action: "login" },
        })
      );
    }

    if (onSuccess) {
      onSuccess(user);
    }

    setSuccessMsg(`Welcome, ${user.name}! Redirecting...`);

    setTimeout(() => {
      onClose();
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "RECRUITER") {
        router.push("/recruiter");
      } else {
        router.push("/dashboard");
      }
    }, 700);
  };

  const handleQuickLogin = (user: any) => {
    handleSuccessfulAuth(user);
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

  if (!isOpen) return null;

  // Filter available demo users for the currently selected role
  const roleFilteredUsers = availableUsers.filter((u) => u.role === selectedRole);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Ribbon */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6436e9] via-[#815af3] to-[#7ef7de]" />

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6436e9] to-[#815af3] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-[#6436e9] dark:text-[#815af3]">
                EasyMatch AI Gateway
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {mode === "signin" ? "Sign In to Your Account" : "Get Started on EasyMatch"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === "signin"
                ? "Select your role to access your personalized match dashboard."
                : "Create your profile in 30 seconds and start receiving AI matches."}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Sign In vs Get Started) */}
        <div className="px-6 pt-4">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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
                setSuccessMsg("");
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === "getstarted"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Get Started Free</span>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Role Selection Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Choose Your Portal Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Candidate / Student */}
              <button
                type="button"
                onClick={() => setSelectedRole("STUDENT")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  selectedRole === "STUDENT"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
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
                  Students & early talent seeking jobs & internships
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-[#6436e9] dark:text-[#815af3]">
                  → Candidate Match Feed
                </div>
              </button>

              {/* Recruiter / Employer */}
              <button
                type="button"
                onClick={() => setSelectedRole("RECRUITER")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  selectedRole === "RECRUITER"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
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
                  Hiring teams & campus sourcers
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-amber-600 dark:text-amber-400">
                  → AI Sourcing Hub
                </div>
              </button>

              {/* Platform Admin */}
              <button
                type="button"
                onClick={() => setSelectedRole("ADMIN")}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  selectedRole === "ADMIN"
                    ? "border-[#6436e9] bg-[#6436e9]/5 dark:bg-[#6436e9]/10 shadow-sm"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
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
                  AI match engine & scoring control
                </p>
                <div className="mt-2 text-[10px] font-extrabold text-purple-600 dark:text-purple-400">
                  → Admin Operations
                </div>
              </button>
            </div>
          </div>

          {/* Quick Demo 1-Click Login (Preloaded profiles for selected role) */}
          {roleFilteredUsers.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/40 dark:to-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#6436e9]" />
                  Instant 1-Click Demo Profiles ({selectedRole}):
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
                    onClick={() => handleQuickLogin(u)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6436e9] dark:hover:border-[#815af3] hover:shadow-xs transition-all text-left group"
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

          {/* Form Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            <span className="absolute px-3 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {mode === "signin" ? "Or sign in with email" : "Or create custom profile"}
            </span>
          </div>

          {/* Error & Success Messages */}
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
            {/* Name Field (Only in Get Started / Register mode) */}
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
                    placeholder={
                      selectedRole === "STUDENT"
                        ? "e.g. Alex Rivera"
                        : selectedRole === "RECRUITER"
                        ? "e.g. Sarah Jenkins"
                        : "e.g. Admin Supervisor"
                    }
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
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
                      ? "e.g. student@berkeley.edu"
                      : selectedRole === "RECRUITER"
                      ? "e.g. recruiter@company.com"
                      : "e.g. admin@easymatch.com"
                  }
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Extra fields for Recruiter */}
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
                      placeholder="e.g. Stripe, eBay, Google"
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
                    placeholder="e.g. Campus Talent Lead"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            {/* Extra fields for Student */}
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
                    placeholder="e.g. UC Berkeley, NUST, FAST"
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

            {/* Submit CTA Button */}
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

          {/* Switch mode helper text at bottom */}
          <div className="text-center text-xs text-slate-500 pt-1">
            {mode === "signin" ? (
              <span>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => setMode("getstarted")}
                  className="font-bold text-[#6436e9] dark:text-[#815af3] hover:underline cursor-pointer"
                >
                  Get started free
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-bold text-[#6436e9] dark:text-[#815af3] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
