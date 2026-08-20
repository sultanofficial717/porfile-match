"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Bell,
  Sliders,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FlaskConical,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#6366f1"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [pendingOpps, setPendingOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      const oppsRes = await fetch("/api/opportunities?status=ALL");
      const oppsData = await oppsRes.json();
      setPendingOpps(Array.isArray(oppsData) ? oppsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerify = async (oppId: string, status: "Verified" | "Rejected") => {
    setVerifyingId(oppId);
    try {
      const res = await fetch(`/api/opportunities/${oppId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
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
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Platform Administrator Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Matching Analytics & System Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor hybrid matching distributions, verify recruiter opportunities, tune model weights, and inspect experiment telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/settings"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
          >
            <Sliders className="w-4 h-4" />
            <span>Configure Weights</span>
          </Link>
          <Link
            href="/experiments"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Model Experiments</span>
          </Link>
        </div>
      </div>

      {/* Ollama System Diagnostics Banner */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
        stats?.ollamaStatus?.isConnected && stats?.ollamaStatus?.isModelAvailable
          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${
            stats?.ollamaStatus?.isConnected && stats?.ollamaStatus?.isModelAvailable
              ? "bg-emerald-500 animate-pulse"
              : "bg-amber-500 animate-ping"
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wide">
                Ollama Engine: {stats?.ollamaStatus?.isConnected ? "CONNECTED" : "DISCONNECTED"}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white/60 dark:bg-black/30">
                Model: {stats?.ollamaStatus?.model || "nomic-embed-text"}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                stats?.ollamaStatus?.statusText === "AVAILABLE"
                  ? "bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                  : "bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
              }`}>
                Embedding Status: {stats?.ollamaStatus?.statusText || "UNAVAILABLE"}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono">
              Base URL: {stats?.ollamaStatus?.baseUrl || "http://localhost:11434"}
              {stats?.ollamaStatus?.error ? ` — ${stats.ollamaStatus.error}` : ""}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-900 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors"
        >
          Check Connection
        </button>
      </div>

      {/* KPI Cards (True Database Metrics - Section 24) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Real Students</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalStudents ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Real Recruiters</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalRecruiters ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Postings</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalOpportunities ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Verified Postings</p>
          <p className="text-2xl font-black text-emerald-600">{stats?.verifiedOpportunities ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Matches</p>
          <p className="text-2xl font-black text-blue-600">{stats?.totalMatches ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">High-Quality (&gt;=92%)</p>
          <p className="text-2xl font-black text-indigo-600">{stats?.matchesAboveThreshold ?? stats?.highQualityMatches ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Notifications Sent</p>
          <p className="text-2xl font-black text-amber-600">{stats?.notificationsGenerated ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Recruiter Feedback</p>
          <p className="text-2xl font-black text-purple-600">{stats?.recruiterFeedbackCount ?? 0}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-[11px] font-bold uppercase text-slate-400">Avg Match Score</p>
          <p className="text-2xl font-black text-teal-600">{stats?.avgScore ? `${stats.avgScore}%` : "0%"}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Match Score Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">Distribution of candidate hybrid match scores.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.distribution || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Opportunities by Category */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Opportunities by Category</span>
            </h3>
            <p className="text-xs text-slate-500">Breakdown of opportunities by type.</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {(!stats?.categories || stats.categories.length === 0) ? (
              <p className="text-xs text-slate-400">No opportunities categorized yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categories || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {(stats?.categories || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Opportunity Verification Queue (Section 9 & 17) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Opportunity Verification Queue</span>
            </h3>
            <p className="text-xs text-slate-500">
              Admin review for recruiter postings. Only verified opportunities trigger candidate matching and notifications.
            </p>
          </div>
        </div>

        {pendingOpps.length === 0 ? (
          <div className="text-center py-10 p-4 border rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
            No opportunities in queue.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingOpps.map((opp) => (
              <div
                key={opp.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        opp.verificationStatus === "Verified"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : opp.verificationStatus === "Rejected"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {opp.verificationStatus}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {opp.title}
                    </span>
                    <span className="text-xs text-slate-400">· {opp.company}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Type: {opp.type}</span>
                    <span>•</span>
                    <span>Min GPA: {opp.minGpa !== null && opp.minGpa !== undefined ? opp.minGpa : "None"}</span>
                    <span>•</span>
                    <span>Location: {opp.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={verifyingId === opp.id}
                    onClick={() => handleVerify(opp.id, "Verified")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      opp.verificationStatus === "Verified"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>

                  <button
                    disabled={verifyingId === opp.id}
                    onClick={() => handleVerify(opp.id, "Rejected")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      opp.verificationStatus === "Rejected"
                        ? "bg-rose-600 text-white"
                        : "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recruiter Evaluation Feedback Table */}
      {stats?.recentFeedbacks && stats.recentFeedbacks.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span>Recent Recruiter Evaluation Feedback</span>
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {stats.recentFeedbacks.map((f: any) => (
              <div key={f.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Candidate: {f.studentProfile?.user?.name || "Student"} → {f.opportunity?.title}
                  </p>
                  <p className="text-slate-500">
                    Decision: <span className="font-bold text-slate-800 dark:text-slate-200">{f.recruiterDecision}</span>
                    {f.feedbackReason ? ` (${f.feedbackReason})` : ""}
                    {f.feedbackText ? ` — "${f.feedbackText}"` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Score: {f.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

