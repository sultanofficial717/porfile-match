"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Sparkles,
  Play,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Cpu,
  Zap,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import Papa from "papaparse";
import { MatchScoreBadge } from "@/components/match-score-badge";

export default function ExperimentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedOppId, setSelectedOppId] = useState("");
  const [providers, setProviders] = useState<string[]>(["ollama"]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentResult, setCurrentResult] = useState<any>(null);
  const [pastExperiments, setPastExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [stuRes, oppRes, expRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/opportunities"),
          fetch("/api/experiments"),
        ]);

        const stuData = await stuRes.json();
        const oppData = await oppRes.json();
        const expData = await expRes.json();

        setStudents(Array.isArray(stuData) ? stuData : []);
        setOpportunities(Array.isArray(oppData) ? oppData : []);
        setPastExperiments(Array.isArray(expData) ? expData : []);

        if (Array.isArray(stuData) && stuData.length > 0) {
          setSelectedStudentId(stuData[0].id);
        }
        if (Array.isArray(oppData) && oppData.length > 0) {
          setSelectedOppId(oppData[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  const toggleProvider = (p: string) => {
    if (providers.includes(p)) {
      if (providers.length === 1) return; // keep at least one
      setProviders(providers.filter((item) => item !== p));
    } else {
      setProviders([...providers, p]);
    }
  };

  const runExperiment = async () => {
    if (!selectedStudentId || !selectedOppId) return;
    setIsRunning(true);
    setCurrentResult(null);

    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudentId,
          opportunityId: selectedOppId,
          providers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentResult(data);

        // Refresh past experiments
        const expRes = await fetch("/api/experiments");
        const expData = await expRes.json();
        setPastExperiments(Array.isArray(expData) ? expData : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const exportToCsv = () => {
    if (!currentResult && pastExperiments.length === 0) return;

    const rows: any[] = [];

    if (currentResult) {
      for (const r of currentResult.results) {
        rows.push({
          Student: currentResult.student.name,
          Degree: currentResult.student.degree,
          GPA: currentResult.student.gpa,
          Opportunity: currentResult.opportunity.title,
          Company: currentResult.opportunity.company,
          Provider: r.provider,
          Model: r.modelName,
          "Hard Eligibility": r.hardEligibility,
          "Semantic Similarity (%)": r.semanticScore,
          "Overall Score (%)": r.overallScore,
          "Latency (ms)": r.latencyMs,
          Dimension: r.dimension,
          Status: r.status,
        });
      }
    }

    for (const exp of pastExperiments) {
      for (const r of exp.results || []) {
        rows.push({
          Student: r.studentProfile?.user?.name || "Student",
          Degree: r.studentProfile?.degree,
          GPA: r.studentProfile?.gpa,
          Opportunity: r.opportunity?.title || "Opportunity",
          Company: r.opportunity?.company,
          Provider: r.provider,
          Model: r.modelName,
          "Hard Eligibility": r.hardEligibility,
          "Semantic Similarity (%)": r.semanticScore,
          "Overall Score (%)": r.overallScore,
          "Latency (ms)": r.latencyMs,
          Dimension: r.dimension,
          Status: "Archived",
        });
      }
    }

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `model_comparison_experiments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
            <FlaskConical className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Model Evaluation & Comparison Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Multi-Provider Embedding Experiments
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Compare Qwen vs Gemini vs Ollama embeddings on the identical candidate profile and
            opportunity requirements with latency and dimension benchmarks.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Experiments CSV</span>
        </button>
      </div>

      {/* Experiment Runner Controls */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Configure & Run Model Comparison Test</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Student Candidate
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user?.name} · GPA: {s.gpa ? s.gpa.toFixed(2) : "N/A"} · {s.degree}
                </option>
              ))}
            </select>
          </div>

          {/* Select Opportunity */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Opportunity
            </label>
            <select
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {opportunities.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} · {o.company} (Min GPA: {o.minGpa || "None"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Checkbox Selectors */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Embedding Providers to Evaluate
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: "ollama", label: "Ollama Local Engine (nomic-embed-text)", icon: Zap },
            ].map((m) => {
              const Icon = m.icon;
              const isChecked = providers.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleProvider(m.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    isChecked
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-400 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Run Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={runExperiment}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? "Running Concurrent Benchmark..." : "Run Multi-Model Experiment"}</span>
          </button>
        </div>
      </div>

      {/* Live Experiment Results Display (Section 7 & 29) */}
      {currentResult && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Live Experiment Results
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {currentResult.student.name} vs {currentResult.opportunity.title}
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              Candidate GPA: {currentResult.student.gpa || "3.62"} · {currentResult.student.degree}
            </div>
          </div>

          {/* Model Comparison Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase">
                  <th className="p-3.5 rounded-l-xl">Provider</th>
                  <th className="p-3.5">Model Name</th>
                  <th className="p-3.5 text-center">Hard Eligibility</th>
                  <th className="p-3.5 text-right">Semantic Sim</th>
                  <th className="p-3.5 text-right">Overall Score</th>
                  <th className="p-3.5 text-right">Latency</th>
                  <th className="p-3.5 text-right">Dimensions</th>
                  <th className="p-3.5 rounded-r-xl text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentResult.results.map((r: any, idx: number) => {
                  const isEligible = r.hardEligibility === "PASS";
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {r.provider}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">{r.modelName}</td>
                      <td className="p-3.5 text-center">
                        {isEligible ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            PASS
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-blue-600">
                        {r.semanticScore.toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                          {r.overallScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        {r.latencyMs}ms
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-500">
                        {r.dimension}d
                      </td>
                      <td className="p-3.5 text-center">
                        {r.status === "mock" ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="API key not provided; used deterministic semantic generator">
                            DEMO / MOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            LIVE API
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Experiments Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Past Experiment Benchmarks</span>
        </h3>

        {pastExperiments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No past experiments saved yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pastExperiments.slice(0, 5).map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{exp.name}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(exp.createdAt).toLocaleString()} · Evaluated {exp.results?.length || 3} models
                  </p>
                </div>
                <div className="flex gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                  {exp.results?.map((r: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                      {r.provider}: {r.overallScore.toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
