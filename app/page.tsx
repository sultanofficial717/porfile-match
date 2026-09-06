"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UserCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Wand2,
  Calendar,
  Zap,
  GraduationCap,
  ShieldCheck,
  Check,
  LogIn,
  UserPlus,
  Users,
  Briefcase,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { AuthModal } from "@/components/auth-modal";

export default function LandingPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [interactiveView, setInteractiveView] = useState<"candidate" | "recruiter">("candidate");
  const [appliedDemo, setAppliedDemo] = useState(false);
  const [invitedDemo, setInvitedDemo] = useState(false);

  // Auth modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "getstarted">("signin");
  const [authModalRole, setAuthModalRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">("STUDENT");

  const loadUserData = async () => {
    try {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      const url = storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session?guest=true`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.availableUsers || []);
        if (storedUserId) {
          setCurrentUser(data.currentUser);
        } else {
          setCurrentUser(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUserData();

    const handleAuthChange = () => {
      loadUserData();
    };

    window.addEventListener("auth-state-change", handleAuthChange);
    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange);
    };
  }, []);

  const openAuth = (mode: "signin" | "getstarted", role: "STUDENT" | "RECRUITER" | "ADMIN" = "STUDENT") => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const launchDemo = (user: any) => {
    localStorage.setItem("current_user_id", user.id);
    localStorage.setItem("user_authenticated", "true");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { user, action: "login" },
        })
      );
    }
    if (user.role === "ADMIN") router.push("/admin");
    else if (user.role === "RECRUITER") router.push("/recruiter");
    else router.push("/dashboard");
  };

  const studentUsers = users.filter((u) => u.role === "STUDENT");
  const recruiterUsers = users.filter((u) => u.role === "RECRUITER");
  const adminUsers = users.filter((u) => u.role === "ADMIN");

  return (
    <div className="space-y-24 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6436e9]/10 border border-[#6436e9]/20 text-[#6436e9] dark:text-[#815af3] text-xs font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-[#6436e9] dark:text-[#815af3]" />
          <span>The #1 AI Job Matchmaker for Students & Early Career Talent</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]">
          Stop Getting Ghosted. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#6436e9] via-[#815af3] to-[#00b894] bg-clip-text text-transparent">
            Start Getting Offers.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          No mass applications. No waiting weeks for replies. EasyMatch pairs you with the right opportunities and fast-tracks you directly to interviews.
        </p>

        {/* Hero CTAs: Prominent Sign In & Get Started Options */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary Get Started Button */}
          <button
            onClick={() => openAuth("getstarted", "STUDENT")}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#6436e9] hover:bg-[#5228cb] text-white font-extrabold text-sm shadow-xl shadow-[#6436e9]/30 hover:shadow-[#6436e9]/40 transition-all hover:scale-102 cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Secondary Sign In Button */}
          <button
            onClick={() => openAuth("signin")}
            className="flex items-center gap-2.5 px-7 py-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <LogIn className="w-5 h-5 text-[#6436e9]" />
            <span>Sign In to Platform</span>
          </button>

          {/* Try AI Optimizer Link */}
          <Link
            href="/resume-optimizer"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#7ef7de]/25 hover:bg-[#7ef7de]/35 text-[#006f56] dark:text-[#7ef7de] border border-[#7ef7de]/40 font-bold text-sm transition-all"
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Resume Optimizer</span>
          </Link>
        </div>

        {/* Live Social Proof Badge */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Over 500,000+ Matches Made
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 78% Average Interview Invite Rate
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free for Students
          </span>
        </div>
      </section>

      {/* 2. DEDICATED ROLE LOGIN & GET STARTED PORTAL SECTION */}
      <section id="roles" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6436e9]">
            <Users className="w-4 h-4" />
            <span>Unified Multi-Role Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Sign In or Get Started by Role
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose your role to log in or create an account. Each role provides custom tools for
            intelligent student matching, candidate sourcing, and platform tuning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ROLE 1: CANDIDATE / STUDENT */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-[#6436e9]/50 transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#6436e9] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/80 text-[#6436e9]">
                  For Students
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-[#6436e9] transition-colors">
                  Candidate & Student Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Get matched with top tech jobs & internships. Skip the ATS resume black holes with
                  explainable match scores.
                </p>
              </div>

              {/* Key Features */}
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Personalized AI Match Stream (90%+ compatibility)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Resume Optimizer with bullet scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct fast-track interview invitations</span>
                </li>
              </ul>

              {/* Instant 1-Click Demo Candidates */}
              {studentUsers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#6436e9]" />
                    Instant Demo Login:
                  </span>
                  <div className="space-y-1.5">
                    {studentUsers.slice(0, 2).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => launchDemo(u)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border hover:border-[#6436e9] text-left text-xs transition-all cursor-pointer group/btn"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.studentProfile?.degree || u.email}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#6436e9] shrink-0 opacity-80 group-hover/btn:opacity-100">
                          Log In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openAuth("signin", "STUDENT")}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-[#6436e9] hover:bg-[#5228cb] text-white shadow-md shadow-[#6436e9]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Candidate</span>
              </button>
              <button
                onClick={() => openAuth("getstarted", "STUDENT")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Student Account</span>
              </button>
            </div>
          </div>

          {/* ROLE 2: RECRUITER / EMPLOYER */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                  For Employers
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Recruiter & Hiring Hub
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Find qualified candidates by major and GPA in seconds. Send direct interview invites and host live campus hiring events.
                </p>
              </div>

              {/* Key Features */}
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Candidate Sourcing Stream across universities</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant 1-click Fast-Track Interview invitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Host virtual events with built-in student RSVPs</span>
                </li>
              </ul>

              {/* Instant 1-Click Demo Recruiters */}
              {recruiterUsers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" />
                    Instant Demo Login:
                  </span>
                  <div className="space-y-1.5">
                    {recruiterUsers.slice(0, 2).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => launchDemo(u)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border hover:border-amber-500 text-left text-xs transition-all cursor-pointer group/btn"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.recruiterProfile?.companyName || "Recruiter"}</p>
                        </div>
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 shrink-0 opacity-80 group-hover/btn:opacity-100">
                          Log In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openAuth("signin", "RECRUITER")}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Recruiter</span>
              </button>
              <button
                onClick={() => openAuth("getstarted", "RECRUITER")}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Company Profile</span>
              </button>
            </div>
          </div>

          {/* ROLE 3: PLATFORM ADMINISTRATOR */}
          <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-7 shadow-lg flex flex-col justify-between space-y-6 hover:border-purple-500/50 transition-all group">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300">
                  Operations
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  Administrator Portal
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tune matching settings, approve new job posts, and test AI models to keep match quality high.
                </p>
              </div>

              {/* Key Features */}
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Dynamic Scoring Weights (Semantic, Skills, GPA, Exp)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Multi-Model Lab (Ollama vs Gemini vs Qwen)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Opportunity verification queue & audit insights</span>
                </li>
              </ul>

              {/* Instant 1-Click Demo Admin */}
              {adminUsers.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-purple-500" />
                    Instant Demo Login:
                  </span>
                  <div className="space-y-1.5">
                    {adminUsers.slice(0, 1).map((u) => (
                      <button
                        key={u.id}
                        onClick={() => launchDemo(u)}
                        className="w-full flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border hover:border-purple-500 text-left text-xs transition-all cursor-pointer group/btn"
                      >
                        <div className="truncate">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 shrink-0 opacity-80 group-hover/btn:opacity-100">
                          Log In →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => openAuth("signin", "ADMIN")}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In as Admin</span>
              </button>
              <Link
                href="/admin"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>View Admin Panel</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE MATCHMAKER PREVIEW */}
      <section className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6436e9] mb-1">
              <Zap className="w-4 h-4" />
              <span>Interactive Match Engine Demo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              See How EasyMatch Works in Real-Time
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Switch tabs to see how students find jobs and how recruiters discover top talent.
            </p>
          </div>

          {/* View Switcher Tabs */}
          <div className="flex items-center p-1.5 bg-slate-200/80 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              onClick={() => setInteractiveView("candidate")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                interactiveView === "candidate"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Candidate Match Feed
            </button>
            <button
              onClick={() => setInteractiveView("recruiter")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                interactiveView === "recruiter"
                  ? "bg-white dark:bg-slate-900 text-[#6436e9] dark:text-[#815af3] shadow-md"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Recruiter Sourcing Feed
            </button>
          </div>
        </div>

        {/* CANDIDATE VIEW INTERACTIVE CARD */}
        {interactiveView === "candidate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Match Card Preview */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 p-2 border flex items-center justify-center">
                    <img
                      src="https://8139278.fs1.hubspotusercontent-na1.net/hubfs/8139278/ebay-1.png"
                      alt="eBay"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#7ef7de]/40 text-[#006f56] dark:bg-[#7ef7de]/20 dark:text-[#7ef7de]">
                      Internship · Summer 2025
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Software Engineering Intern - Frontend & Full Stack
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      eBay · San Jose, CA (Hybrid)
                    </p>
                  </div>
                </div>

                {/* Score Gauge */}
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-center">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    96%
                  </span>
                  <span className="text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Match Score
                  </span>
                </div>
              </div>

              {/* Why You Matched Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6436e9]" />
                  <span>Why You Matched:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Skills: React, TypeScript, REST APIs</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>GPA 3.82 exceeds 3.20 requirement</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Degree: B.S. Computer Science</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Graduation: Class of 2025/2026</span>
                  </div>
                </div>
              </div>

              {/* Compensation & Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Compensation: </span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    $52 - $58 / hour + Relocation
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAppliedDemo(!appliedDemo)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                      appliedDemo
                        ? "bg-emerald-600 text-white"
                        : "bg-[#6436e9] hover:bg-[#5228cb] text-white shadow-[#6436e9]/20"
                    }`}
                  >
                    {appliedDemo ? "✓ Fast-Track Application Sent!" : "Accept & Fast-Track Apply"}
                  </button>
                  <button
                    onClick={() => openAuth("signin", "STUDENT")}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 cursor-pointer"
                  >
                    Sign In to Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Explanation Guide */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                No More Resume Black Holes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                On traditional job boards, your resume sits in a stack of 2,000 applicants. On
                EasyMatch, employers specify hard criteria and target skills. When your profile
                matches, you are surfaced directly to the recruiter's shortlist.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Direct recruiter review (No ATS filtering rejections)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>78% of matched applicants receive interview invitations</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Transparent compatibility scoring and skill gap insights</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          /* RECRUITER VIEW INTERACTIVE CARD */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Candidate Card Preview */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border flex items-center justify-center font-bold text-slate-700 text-lg">
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                      alt="Alex Rivera"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#6436e9]/10 text-[#6436e9]">
                      Pre-Screened Qualified
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                      Alex Rivera
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      UC Berkeley · B.S. Computer Science (2025) · GPA 3.82
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 text-center">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                    98%
                  </span>
                  <span className="text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Match Rank #1
                  </span>
                </div>
              </div>

              {/* Skills and Background */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {["React (Advanced)", "TypeScript (Advanced)", "Go (Intermediate)", "REST APIs", "PostgreSQL", "Docker"].map(
                    (sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                      >
                        {sk}
                      </span>
                    )
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  "Engineered React dashboard components at Stripe. Built distributed KV store in Go with Raft consensus. Teaching assistant for Data Structures."
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Passed Hard Eligibility Rules
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInvitedDemo(!invitedDemo)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                      invitedDemo
                        ? "bg-emerald-600 text-white"
                        : "bg-[#6436e9] hover:bg-[#5228cb] text-white shadow-[#6436e9]/20"
                    }`}
                  >
                    {invitedDemo ? "✓ Interview Invite Sent!" : "Send Fast-Track Interview Invite"}
                  </button>
                  <button
                    onClick={() => openAuth("signin", "RECRUITER")}
                    className="px-3.5 py-2.5 rounded-xl border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
                  >
                    Sign In to Source
                  </button>
                </div>
              </div>
            </div>

            {/* Recruiter Value Prop */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Automated Sourcing for Early Career
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Recruiters waste hundreds of hours sifting through unqualified resumes. EasyMatch
                delivers a daily stream of pre-screened students meeting your exact GPA, major,
                graduation date, and technical skill requirements.
              </p>
              <ul className="space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>10x faster time to interview</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Source diverse candidates across 1,500+ universities</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </span>
                  <span>Host virtual events & webinars with built-in candidate RSVPs</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* 3. TRUSTED BY TOP EMPLOYERS LOGOS */}
      <section className="text-center space-y-6">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Trusted by Top Hiring Teams Across Technology, Finance & Healthcare
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center opacity-85 hover:opacity-100 transition-opacity">
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-xl text-slate-800 dark:text-white">eBay</span>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-xl text-orange-600">Reddit</span>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-sm text-slate-800 dark:text-white">Palo Alto Networks</span>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-xl text-emerald-600">MongoDB</span>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-xl text-amber-500">EY</span>
          </div>
          <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-center h-20 w-full">
            <span className="font-black text-xl text-indigo-600">Amazon</span>
          </div>
        </div>
      </section>

      {/* 4. FROM PROFILE TO INTERVIEW IN 3 STEPS */}
      <section className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            From Profile to Interview in <span className="text-[#6436e9]">3 Simple Steps</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Skip the endless search. Create your profile once and let curated opportunities come to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#6436e9]/10 text-[#6436e9] flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Build a profile that showcases who you are
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skip the resume fluff. Share your technical projects, coursework, GitHub, and job
              preferences. Our AI highlights what sets you apart in a sea of applicants.
            </p>
          </div>

          <div className="p-8 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#6436e9]/10 text-[#6436e9] flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Get matched with roles where you can shine
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              No more scrolling through hundreds of irrelevant postings. We match you with roles
              based on your skills, graduation year, and goals — giving you 20x better response rates.
            </p>
          </div>

          <div className="p-8 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all space-y-4 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-[#6436e9]/10 text-[#6436e9] flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Land interviews and direct job offers
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect directly with employers. Join live online info sessions, get invited to interviews, and land job offers with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM CORE PILLARS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#6436e9] to-[#815af3] text-white shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Wand2 className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-extrabold">AI Resume Optimizer</h3>
            <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">
              Check your resume score in seconds. Find missing skills, fix weak bullet points, and highlight real impact using proven hiring standards.
            </p>
          </div>
          <div>
            <Link
              href="/resume-optimizer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-[#6436e9] font-extrabold text-xs shadow-md hover:bg-purple-50 transition-colors"
            >
              <span>Optimize Your Resume Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col justify-between space-y-6 border border-slate-800">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#7ef7de]/20 text-[#7ef7de] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-extrabold">Virtual Career Events & AMAs</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Attend live technical info sessions, engineering deep dives, and coffee chats hosted by
              leads from eBay, Reddit, MongoDB, and Palo Alto Networks. 1-click RSVP with calendar sync.
            </p>
          </div>
          <div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#7ef7de] text-slate-900 font-extrabold text-xs shadow-md hover:bg-[#68e0c7] transition-colors"
            >
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="text-center py-16 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 space-y-6">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
          Ready to Find Your Dream Role?
        </h2>
        <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto">
          Join thousands of students and recent grads getting matched with great jobs on EasyMatch.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => openAuth("getstarted", "STUDENT")}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#6436e9] hover:bg-[#5228cb] text-white font-extrabold text-sm shadow-xl shadow-[#6436e9]/30 transition-all hover:scale-102 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Get Started for Free</span>
          </button>
          <button
            onClick={() => openAuth("signin")}
            className="flex items-center gap-2 px-7 py-4 rounded-2xl border-2 border-slate-700 hover:border-slate-500 bg-slate-800/80 text-white font-bold text-sm transition-all hover:scale-102 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      </section>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        defaultRole={authModalRole}
      />
    </div>
  );
}
