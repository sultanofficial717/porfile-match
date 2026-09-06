"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  FileText,
  RefreshCw,
  Award,
} from "lucide-react";

export default function ResumeOptimizerPage() {
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [bulletPoints, setBulletPoints] = useState(
    `• Worked on React frontend components and fixed bugs in user dashboard\n• Helped backend team with REST API endpoints and SQL database queries\n• Assisted with Docker deployment and tested features before release`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!bulletPoints.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resume-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          bulletPoints,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6436e9] via-[#815af3] to-indigo-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Resume Optimizer & ATS Scanner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Transform Your Resume for High-Match Roles</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Detect missing high-value technical keywords, replace passive verbs with dynamic action verbs,
            and quantify impact according to Google's hiring formula.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-3 rounded-2xl bg-white text-[#6436e9] font-extrabold text-xs shadow-md hover:bg-purple-50 transition-all shrink-0 text-center"
        >
          View Matched Jobs →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select Target Job Function
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden"
              >
                <option value="Software Engineer">Software Engineer (General / Full Stack)</option>
                <option value="Frontend Engineer">Frontend Engineer (React, TS, UI)</option>
                <option value="Backend / Systems Engineer">Backend / Systems Engineer (Go, Python, Distributed)</option>
                <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer (PyTorch, LLMs)</option>
                <option value="Data Scientist / Analyst">Data Scientist / Analyst (SQL, Python, Stats)</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Paste Resume Experience Bullets
                </label>
                <span className="text-[11px] text-slate-400">One bullet per line</span>
              </div>
              <textarea
                rows={8}
                value={bulletPoints}
                onChange={(e) => setBulletPoints(e.target.value)}
                placeholder="Paste your resume experience or project bullet points here..."
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-[#6436e9] focus:outline-hidden transition-all"
              />
            </div>

            <button
              onClick={handleOptimize}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#6436e9] hover:bg-[#5228cb] text-white font-extrabold text-sm shadow-lg shadow-[#6436e9]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing ATS Compatibility...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Run AI Optimization & ATS Score</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Score Card */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Overall ATS Readiness
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Resume Score Breakdown
                    </h3>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                      {result.overallAtsScore}%
                    </span>
                    <span className="block text-[9px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300 mt-0.5">
                      ATS Compatible
                    </span>
                  </div>
                </div>

                {/* Sub-scores */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                      {result.keywordScore}%
                    </span>
                    <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Keywords</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                      {result.verbScore}%
                    </span>
                    <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Action Verbs</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-lg font-black text-teal-600 dark:text-teal-400">
                      {result.impactScore}%
                    </span>
                    <span className="block text-[10px] font-bold text-slate-500 mt-0.5">Quantified</span>
                  </div>
                </div>

                {/* Missing & Present Keywords */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Skills Analysis:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.presentKeywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> {kw}
                      </span>
                    ))}
                    {result.missingKeywords.slice(0, 6).map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-[11px] font-medium"
                      >
                        + Missing: {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Rewritten Bullets */}
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6436e9]" />
                  <span>Google-Standard Impact Rewrites</span>
                </h3>

                {result.optimizedBullets.map((bullet: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {bullet.highlight}
                      </span>
                      <button
                        onClick={() => copyToClipboard(bullet.optimized, bullet.id)}
                        className="text-slate-400 hover:text-[#6436e9] transition-colors p-1"
                        title="Copy rewritten bullet"
                      >
                        {copiedId === bullet.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-900 dark:text-white font-semibold leading-relaxed">
                      • {bullet.optimized}
                    </p>

                    <p className="text-[11px] text-slate-400 line-through">
                      Original: {bullet.original}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center justify-center text-center space-y-3 min-h-[350px]">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#6436e9] flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Optimization Preview
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Click "Run AI Optimization & ATS Score" to evaluate keywords, detect passive language,
                and transform your experience into high-impact metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
