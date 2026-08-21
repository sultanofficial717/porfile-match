"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Compass,
  BarChart3,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Activity,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [ollama, setOllama] = useState<any>(null);
  const [pendingRecruiters, setPendingRecruiters] = useState<any[]>([]);
  const [pendingOpportunities, setPendingOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const metRes = await api.admin.getMetrics();
      setMetrics(metRes.metrics);
      setOllama(metRes.ollamaHealth);

      const recRes = await api.admin.getPendingRecruiters();
      setPendingRecruiters(recRes.recruiters || []);

      const oppRes = await api.admin.getPendingOpportunities();
      setPendingOpportunities(oppRes.opportunities || []);
    } catch (err) {
      console.warn("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Platform Administration Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Moderate recruiters, review opportunity postings, and inspect Ollama vector engine health.
          </p>
        </div>
      </div>

      {/* Ollama Diagnostics Banner */}
      <div className="p-4 rounded-2xl border bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              Ollama Embedding Service Status:{" "}
              <span className={ollama?.isConnected ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                {ollama?.statusText || "CHECKING"}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Model: {ollama?.model || "nomic-embed-text"} ({ollama?.baseUrl || "http://localhost:11434"})
            </p>
          </div>
        </div>

        <Link
          href="/admin/metrics"
          className="text-xs font-bold text-blue-600 hover:underline"
        >
          View Full Metrics →
        </Link>
      </div>

      {/* KPI Cards per PRD §5.5 & Design §8 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Students</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalStudents || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Recruiters</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalRecruiters || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Published Opps</span>
          <p className="text-2xl font-black text-emerald-600">{metrics?.publishedOpportunities || 0}</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Matches Generated</span>
          <p className="text-2xl font-black text-blue-600">{metrics?.matchesGenerated || 0}</p>
        </div>
      </div>

      {/* Moderation Queues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruiter Approval Queue Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pending Recruiters ({pendingRecruiters.length})
              </h2>
            </div>
            <Link
              href="/admin/recruiters"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingRecruiters.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No pending recruiter signups.</p>
          ) : (
            <div className="space-y-2">
              {pendingRecruiters.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{r.organizationName}</p>
                    <p className="text-[11px] text-slate-500">{r.profile?.fullName} ({r.profile?.email})</p>
                  </div>
                  <Link
                    href="/admin/recruiters"
                    className="px-3 py-1 rounded-xl bg-blue-600 text-white font-bold text-[11px]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunity Review Queue Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Pending Opportunities ({pendingOpportunities.length})
              </h2>
            </div>
            <Link
              href="/admin/opportunities"
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Manage Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingOpportunities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No opportunities waiting for review.</p>
          ) : (
            <div className="space-y-2">
              {pendingOpportunities.slice(0, 3).map((opp) => (
                <div
                  key={opp.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{opp.title}</p>
                    <p className="text-[11px] text-slate-500">{opp.organization} · {opp.type}</p>
                  </div>
                  <Link
                    href="/admin/opportunities"
                    className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-[11px]"
                  >
                    Approve
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
