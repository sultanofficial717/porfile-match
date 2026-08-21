"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UserCheck,
  Building2,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Mail,
  Sliders,
  Cpu,
  Database,
  FileJson,
  TrendingUp,
  Award,
  Zap,
  Target,
  FileText,
  UserPlus,
} from "lucide-react";
import { api } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [opportunitiesCount, setOpportunitiesCount] = useState<number>(0);

  useEffect(() => {
    // 1. Fetch available users
    api.auth.getSession().then((res) => {
      setUsers(res.availableUsers || []);
    }).catch(() => {});

    // 2. Fetch platform metrics
    api.admin.getMetrics().then((res) => {
      setMetrics(res.metrics || null);
      setHealth(res.ollamaHealth || null);
    }).catch(() => {});

    // 3. Fetch opportunities count
    api.opportunities.list().then((res) => {
      setOpportunitiesCount(res.opportunities?.length || 0);
    }).catch(() => {});
  }, []);

  const launchRole = (targetRole: "student" | "recruiter" | "admin") => {
    const found = users.find((u) => u.role === targetRole);
    if (found) {
      localStorage.setItem("current_user_id", found.id);
    }
    if (targetRole === "admin") router.push("/admin");
    else if (targetRole === "recruiter") router.push("/recruiter/dashboard");
    else router.push("/dashboard");
  };

  return (
    <div className="space-y-20 py-6">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Next-Generation Hybrid Matching Platform (Decoupled Architecture)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          AI Opportunity Discovery &amp; <span className="text-blue-600">Hybrid Matching</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Say goodbye to raw cosine similarity mistakes. Match students to jobs, internships, scholarships, and fellowships through hard eligibility gates, normalized embeddings, and transparent scoring.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href="/register"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:scale-102 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register as Student</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <button
            onClick={() => launchRole("student")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs hover:scale-102 transition-all"
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Demo Student Feed</span>
          </button>

          <button
            onClick={() => launchRole("recruiter")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs hover:scale-102 transition-all"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Recruiter Portal</span>
          </button>

          <button
            onClick={() => launchRole("admin")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-xs hover:scale-102 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Admin Hub</span>
          </button>
        </div>
      </section>

      {/* 2. Real-Time Platform Stats Bar (Fetched from Backend API) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Opportunities</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {opportunitiesCount || metrics?.totalOpportunities || 2}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1">Verified Postings</span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Profiles</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.totalStudents || users.filter((u) => u.role === "student").length || 1}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1">Structured Profiles</span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Embedding Engine</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-2 font-mono truncate">
            {health?.model || "nomic-embed-text"}
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-1">
            {health?.isConnected ? "Ollama Connected" : "Deterministic Engine"}
          </span>
        </div>

        <div className="p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Match Threshold</span>
            <Sliders className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            ≥ 92%
          </p>
          <span className="text-[11px] text-purple-600 font-semibold mt-1">Zero Spam Guarantee</span>
        </div>
      </section>

      {/* 3. Deep Dive: The 3-Stage Hybrid Matching Pipeline */}
      <section className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-8 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
            <Layers className="w-4 h-4" />
            <span>Matching Philosophy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Why Hybrid Matching Beats Raw Cosine Similarity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            In standard semantic search, a student with a 2.1 GPA might score 95% similarity on an AI internship posting simply because their essay mentions "Machine Learning". MatchAI enforces strict multi-stage verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Stage 1 */}
          <div className="p-6 rounded-2xl border bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  1
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gatekeeper</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Stage 1: Hard Eligibility Check
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Evaluates mandatory criteria: Minimum GPA, Required Degrees, Experience Years, Academic Year, and Student Preferences. If any fails, the candidate is marked <strong className="text-rose-600">NOT ELIGIBLE</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Passes all rules</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between text-rose-600 font-bold">
                <span>Fails GPA or Degree</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded font-bold">0% DISQUALIFIED</span>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-2xl border bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  2
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semantic AI</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Stage 2: Multi-Model Embeddings
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Normalized candidate documents and structured opportunities are vectorized using pluggable providers: local <strong>Ollama</strong> (<code className="text-indigo-600 font-mono">nomic-embed-text</code>), <strong>Gemini</strong>, or <strong>Qwen</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-xl bg-white dark:bg-slate-900 border text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>Semantic Cosine Vector:</span>
                <span className="font-mono text-indigo-600 font-bold">Dot-product</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 font-medium">
                <span>Dual Persistence:</span>
                <span className="font-mono text-emerald-600 font-bold">SQLite + JSON Files</span>
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-2xl border bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  3
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scoring &amp; Alert</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Stage 3: Weighted Multi-Factor Score
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Scores combine 40% Semantic + 20% Skill Overlap + 15% Experience + 10% Education + 10% Profile Completeness + 5% Leadership. High scores (≥92%) trigger alerts.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Threshold Alert</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">≥ 92% Match Score</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Real-time Alert
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Three Dedicated Role Experiences */}
      <section className="space-y-8 max-w-6xl mx-auto">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Built for Every Stakeholder
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tailored workflows for students, recruiters, and platform administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: Student */}
          <div className="p-7 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col justify-between shadow-md space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 font-bold shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">1. Students</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build full structured profiles, set opportunity preferences & thresholds, and receive personalized matches with transparent score explanations.
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register as Student</span>
              </Link>
              <Link
                href="/dashboard"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all"
              >
                <span>Open Student Dashboard →</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Recruiter */}
          <div className="p-7 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col justify-between shadow-md space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 font-bold shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">2. Recruiters</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Post structured job, internship, scholarship, and fellowship postings with strict GPA, degree, and required skill criteria.
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/recruiter/opportunities/new"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post New Opportunity</span>
              </Link>
              <Link
                href="/recruiter/dashboard"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all"
              >
                <span>Recruiter Dashboard →</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Admin */}
          <div className="p-7 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col justify-between shadow-md space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 font-bold shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">3. Administrators</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Approve recruiter accounts, review and publish submitted opportunities, inspect Ollama engine health, and inspect global metrics.
              </p>
            </div>
            <div className="pt-4 border-t space-y-2">
              <Link
                href="/admin"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Admin Hub</span>
              </Link>
              <Link
                href="/admin/metrics"
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all"
              >
                <span>System Metrics →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Decoupled Architecture & File Storage Highlight */}
      <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white space-y-6 max-w-6xl mx-auto shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold">
              <Database className="w-3.5 h-3.5" />
              <span>Decoupled Full-Stack Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">
              Independent Backend API &amp; Automated Profile File Persistence
            </h2>
            <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed font-normal">
              The platform separates the Next.js frontend (Port 3000) from the Express REST API (Port 5000) and SQLite database. Whenever a student registers or modifies their profile, data is synchronized with Prisma ORM and automatically exported as a dedicated disk JSON file (<code className="font-mono text-blue-300">backend/data/profiles/&lt;id&gt;.json</code>).
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="px-6 py-3 rounded-2xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-md"
              >
                Get Started as Student →
              </Link>
              <Link
                href="/profile"
                className="px-6 py-3 rounded-2xl bg-blue-700/50 hover:bg-blue-700/80 border border-blue-400/30 text-white font-bold text-xs transition-all"
              >
                Inspect Profile &amp; File Export
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/10 font-mono text-xs text-blue-300 space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-white/10 pb-2 text-[11px]">
              <span>REST API Endpoints Mounted</span>
              <span className="text-emerald-400">● Port 5000 Active</span>
            </div>
            <p className="text-emerald-400">POST /api/auth/signup</p>
            <p className="text-blue-400">GET /api/students/:id</p>
            <p className="text-yellow-400">PUT /api/students/:id (Updates DB + writes JSON file)</p>
            <p className="text-purple-400">GET /api/students/:id/file (Exports JSON storage)</p>
            <p className="text-blue-400">GET /api/matches/student/:id (Runs 3-stage pipeline)</p>
            <p className="text-indigo-400">GET /api/system/health</p>
          </div>
        </div>
      </section>
    </div>
  );
}
