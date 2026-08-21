"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Compass,
  Sparkles,
  Mail,
  Activity,
  ArrowLeft,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [ollama, setOllama] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getMetrics();
      setMetrics(res.metrics);
      setOllama(res.ollamaHealth);
    } catch (err) {
      console.warn("Metrics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Hub</span>
        </Link>

        <button
          onClick={fetchMetrics}
          className="p-2 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Platform Metrics & Engine Diagnostics
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Real-time KPIs for student profiles, recruiter postings, match quality, and Ollama embedding engine health.
        </p>
      </div>

      {/* Ollama Engine Diagnostics Box */}
      <div className="p-6 rounded-3xl border bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Ollama Local Embeddings Engine
            </h2>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              ollama?.isConnected
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
            }`}
          >
            {ollama?.statusText || "CHECKING"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Endpoint URL</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white">
              {ollama?.baseUrl || "http://localhost:11434"}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Configured Model</span>
            <p className="font-mono font-bold text-purple-600">
              {ollama?.model || "nomic-embed-text"}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Embedding Vector Size</span>
            <p className="font-mono font-bold text-emerald-600">
              768 Dimensions (Normalized)
            </p>
          </div>
        </div>

        {ollama?.error && (
          <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-3 rounded-xl border border-rose-200">
            {ollama.error}
          </p>
        )}
      </div>

      {/* Platform KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Registered Students</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.totalStudents || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Approved Recruiters</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.totalRecruiters || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Published Opportunities</span>
          <p className="text-3xl font-black text-emerald-600">{metrics?.publishedOpportunities || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Matches Generated</span>
          <p className="text-3xl font-black text-blue-600">{metrics?.matchesGenerated || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Notification Emails Sent</span>
          <p className="text-3xl font-black text-purple-600">{metrics?.emailsSent || 0}</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Opportunity Match Rate</span>
          <p className="text-3xl font-black text-indigo-600">{metrics?.matchRatePercentage || 0}%</p>
        </div>
      </div>

      {/* Opportunities by Type Breakdown */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Opportunities by Type
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Full-time Jobs</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics?.opportunitiesByType?.jobs || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Internships</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics?.opportunitiesByType?.internships || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Scholarships</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics?.opportunitiesByType?.scholarships || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Fellowships</span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {metrics?.opportunitiesByType?.fellowships || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
