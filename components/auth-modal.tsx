"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cancel01Icon as X,
  Building04Icon as Building2,
  ArrowRight01Icon as ArrowRight,
  Mail01Icon as Mail,
  UserIcon as User,
  Building03Icon as Building,
  Mortarboard01Icon as GraduationCap,
  Tick02Icon as CheckCircle2,
  Alert01Icon as AlertCircle,
  Login01Icon as LogIn,
  UserAdd01Icon as UserPlus,
  FlashIcon as Zap,
} from "hugeicons-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "getstarted";
  defaultRole?: "STUDENT" | "RECRUITER";
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
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "RECRUITER">(defaultRole);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { user, action: "login" },
        })
      );
    }

    if (onSuccess) onSuccess(user);

    setSuccessMsg(`Welcome, ${user.name}! Redirecting...`);

    setTimeout(() => {
      onClose();
      if (user.role === "RECRUITER") {
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

    if (!email.trim()) { setErrorMsg("Email is required."); return; }
    if (mode === "getstarted" && !name.trim()) { setErrorMsg("Name is required."); return; }

    setIsSubmitting(true);
    try {
      const payload: any = { email: email.trim(), role: selectedRole };
      if (mode === "getstarted") {
        payload.name = name.trim();
        if (selectedRole === "RECRUITER") {
          payload.companyName = companyName.trim() || "Company";
          payload.position = position.trim() || "Talent Acquisition";
        } else {
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
      if (!res.ok || data.error) throw new Error(data.error || "Authentication failed.");
      if (data.user) handleSuccessfulAuth(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleFilteredUsers = availableUsers.filter((u) => u.role === selectedRole);

  const inputClasses = "w-full px-4 py-3 rounded-xl border border-border-dark bg-surface-dark-alt text-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-surface/40";
  const inputWithIconClasses = "w-full pl-11 pr-4 py-3 rounded-xl border border-border-dark bg-surface-dark-alt text-surface text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-surface/40";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full max-w-xl bg-surface-dark rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-8 py-8 shrink-0">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-ink rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">
                  {selectedRole === "STUDENT" ? "For Students" : "For Employers"}
                </div>
                <h2 className="text-3xl font-display font-semibold text-surface">
                  {mode === "signin" ? (selectedRole === "STUDENT" ? "Candidate Portal" : "Recruiter Hub") : "Create Account"}
                </h2>
                <p className="text-sm text-surface/70 mt-2 font-mono max-w-sm">
                  {mode === "signin" 
                    ? "Get matched with jobs & internships. Transparent scores explain exactly why you're a fit." 
                    : "Create your profile in 30 seconds."}
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-dark-alt text-surface/70 hover:text-surface transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-8 shrink-0">
              <div className="flex p-1 bg-surface-dark-alt rounded-xl border border-border-dark">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setErrorMsg(""); setSuccessMsg(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "signin" ? "bg-surface text-ink" : "text-surface/70 hover:text-surface"
                    }`}
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("getstarted"); setErrorMsg(""); setSuccessMsg(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "getstarted" ? "bg-surface text-ink" : "text-surface/70 hover:text-surface"
                    }`}
                >
                  <UserPlus className="w-4 h-4" /> Get Started
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto">
              {/* Role Selection (Only in Get Started to keep it clean) */}
              <div className="flex justify-center gap-4 border-b border-border-dark pb-6">
                <button
                  type="button"
                  onClick={() => setSelectedRole("STUDENT")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRole === "STUDENT" ? "bg-primary/20 text-primary border border-primary/50" : "bg-transparent text-surface/50 hover:text-surface"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" /> Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("RECRUITER")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedRole === "RECRUITER" ? "bg-primary/20 text-primary border border-primary/50" : "bg-transparent text-surface/50 hover:text-surface"
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Recruiter
                </button>
              </div>

              {/* Quick Demo Login */}
              {roleFilteredUsers.length > 0 && (
                <div className="p-5 rounded-2xl bg-surface-dark-alt border border-border-dark space-y-4">
                  <span className="text-xs font-semibold text-primary flex items-center gap-2 uppercase tracking-wider">
                    <Zap className="w-4 h-4" /> Quick Demo Login
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {roleFilteredUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u)}
                        className="flex items-center justify-between p-3 rounded-xl border border-border-dark hover:border-primary/50 hover:bg-surface/5 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-medium text-sm text-surface truncate group-hover:text-primary transition-colors">{u.name}</p>
                            <p className="text-[10px] text-surface/50 truncate">
                              {selectedRole === "RECRUITER" ? u.recruiterProfile?.companyName || "Employer" : u.studentProfile?.degree || u.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <AnimatePresence mode="popLayout">
                {errorMsg && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 text-success text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "getstarted" && (
                  <div>
                    <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="w-5 h-5 text-surface/40 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                      <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        placeholder={selectedRole === "STUDENT" ? "Alex Rivera" : "Sarah Jenkins"}
                        className={inputWithIconClasses} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="w-5 h-5 text-surface/40 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === "STUDENT" ? "student@university.edu" : "recruiter@company.com"}
                      className={inputWithIconClasses} />
                  </div>
                </div>

                {mode === "getstarted" && selectedRole === "RECRUITER" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">Company</label>
                      <div className="relative group">
                        <Building className="w-5 h-5 text-surface/40 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Google" className={inputWithIconClasses} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">Position</label>
                      <input type="text" value={position} onChange={(e) => setPosition(e.target.value)}
                        placeholder="Talent Lead" className={inputClasses} />
                    </div>
                  </div>
                )}

                {mode === "getstarted" && selectedRole === "STUDENT" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">University</label>
                      <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)}
                        placeholder="UC Berkeley" className={inputClasses} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-surface/70 mb-1.5 ml-1">Degree</label>
                      <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)}
                        placeholder="B.S. CS" className={inputClasses} />
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary hover:bg-primary-hover text-ink font-bold text-sm transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Authenticating..." : (
                      <>
                        <span>{mode === "signin" ? `Sign In as ${selectedRole === "STUDENT" ? "Candidate" : "Recruiter"}` : `Create Account`}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
