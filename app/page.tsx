"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UserCheck,
  Building2,
  FlaskConical,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sliders,
  Cpu,
  Mail,
  Zap,
} from "lucide-react";
import { MatchScoreBadge } from "@/components/match-score-badge";

export default function LandingPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setUsers(data.availableUsers || []))
      .catch(() => {});
  }, []);

  const launchDemo = (role: "STUDENT" | "RECRUITER" | "ADMIN") => {
    const target = users.find((u) => u.role === role);
    if (target) {
      localStorage.setItem("current_user_id", target.id);
    }
    if (role === "ADMIN") router.push("/admin");
    else if (role === "RECRUITER") router.push("/recruiter");
    else router.push("/dashboard");
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Next-Generation Hybrid Matching MVP</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          AI Opportunity Matching Platform
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal">
          Build structured profiles. Match opportunities through hard eligibility filters,
          normalized multi-model embeddings, and transparent scoring.
        </p>

        {/* 3 Main Demo Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => launchDemo("STUDENT")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all hover:scale-102"
          >
            <UserCheck className="w-4 h-4" />
            <span>Try Student Demo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => launchDemo("RECRUITER")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-sm shadow-md transition-all hover:scale-102"
          >
            <Building2 className="w-4 h-4" />
            <span>Try Recruiter Demo</span>
          </button>

          <button
            onClick={() => launchDemo("ADMIN")}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-sm transition-all hover:scale-102"
          >
            <FlaskConical className="w-4 h-4 text-indigo-600" />
            <span>Open Admin & Experiments</span>
          </button>
        </div>
      </section>

      {/* Live Interactive Matching Pipeline Demonstration */}
      <section className="p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Layers className="w-4 h-4" />
            <span>Under The Hood</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hybrid Matching: Hard Eligibility + Ollama Semantic AI
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Never equate pure cosine similarity with candidate qualification. We enforce strict multi-stage verification.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Stage 1 Hard Eligibility */}
          <div className="p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-400">Step 1</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stage 1 — Hard Eligibility
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mandatory criteria (GPA, Degree, Experience, Required Skills, Work Auth) are evaluated first. If any fails, candidate is marked NOT ELIGIBLE.
              </p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span>Eligible Candidate (Meets all rules)</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between text-rose-600 font-bold">
                <span>Missing Mandatory Skill or GPA</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950 rounded">NOT ELIGIBLE</span>
              </div>
            </div>
          </div>

          {/* Step 2: Normalized Ollama Embeddings */}
          <div className="p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                2
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-400">Step 2</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stage 2 — Ollama Embeddings
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Normalized matching documents are embedded server-side using your local Ollama embedding model.
              </p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border text-xs">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Ollama Provider:</span>
                <span className="font-mono font-bold text-blue-600">Localhost</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Embedding Model:</span>
                <span className="font-mono font-bold text-purple-600">Configured via ENV</span>
              </div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                <span className="font-semibold">Vector Storage:</span>
                <span className="font-mono font-bold text-emerald-600">Normalized SQLite</span>
              </div>
            </div>
          </div>

          {/* Step 3: Transparent Scoring & Alerts */}
          <div className="p-5 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-400">Step 3</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Stage 3 — Weighted Score & Dashboard Notifications
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Weighted combination of Semantic, Skill, Experience, and Education scores triggers threshold notifications (e.g. &gt;= 92%).
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Match Threshold</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Configurable 90% - 95%</p>
              </div>
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Dashboard Feed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workflows */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Students</h3>
          <p className="text-xs text-slate-500">
            Create full structured profiles or import CVs with interactive review. View real match breakdowns and notifications.
          </p>
          <div className="pt-2 text-xs font-semibold text-blue-600 flex items-center gap-1">
            <Link href="/dashboard" className="hover:underline">Open Student Dashboard →</Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Recruiters</h3>
          <p className="text-xs text-slate-500">
            Publish real opportunities with structured degree, GPA, experience, and skill criteria. Review and evaluate matched candidates.
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <Link href="/recruiter" className="hover:underline">Open Recruiter Hub →</Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Admin</h3>
          <p className="text-xs text-slate-500">
            Verify pending recruiter opportunities, tune match weights & notification thresholds, and monitor Ollama health.
          </p>
          <div className="pt-2 text-xs font-semibold text-purple-600 flex items-center gap-1">
            <Link href="/admin" className="hover:underline">Open Admin Panel →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
