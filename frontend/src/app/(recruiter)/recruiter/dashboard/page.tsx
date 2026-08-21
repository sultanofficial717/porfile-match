"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";

export default function RecruiterDashboardPage() {
  const [recruiter, setRecruiter] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRecruiterData = async () => {
    setLoading(true);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      const session = await api.auth.getSession(storedId || undefined);

      if (session.currentUser) {
        const recId = session.currentUser.id;
        const recRes = await api.recruiter.getProfile(recId);
        setRecruiter(recRes.recruiter);

        const oppRes = await api.recruiter.listOpportunities(recId);
        setOpportunities(oppRes.opportunities || []);

        const metRes = await api.recruiter.getMetrics(recId);
        setMetrics(metRes.metrics);
      }
    } catch (err) {
      console.warn("Recruiter load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const isApproved = recruiter?.status === "approved";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {recruiter?.organizationName || "Recruiter Dashboard"}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isApproved
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
              }`}
            >
              {recruiter?.status || "Pending Approval"}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Post opportunities and review candidate match metrics.
          </p>
        </div>

        <Link
          href="/recruiter/opportunities/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Opportunity</span>
        </Link>
      </div>

      {/* Recruiter Approval Pending Notice */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Account Under Review by Administrator</p>
            <p className="opacity-90 mt-0.5">
              You can create draft opportunities. Postings will be submitted for moderation once your organization is approved by the admin.
            </p>
          </div>
        </div>
      )}

      {/* KPI Metrics Header per PRD §4.4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Active Published</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {metrics?.activeCount || 0}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Pending Admin Review</span>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics?.pendingReviewCount || 0}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Matched Candidates</span>
          <p className="text-3xl font-black text-blue-600">
            {metrics?.totalMatches || 0}
          </p>
        </div>
      </div>

      {/* Opportunities List Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Manage Postings ({opportunities.length})
        </h2>

        {opportunities.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-3">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No opportunities created yet.</p>
            <Link
              href="/recruiter/opportunities/new"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Post Your First Opportunity
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Matches</th>
                    <th className="px-6 py-3.5">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {opportunities.map((opp) => (
                    <tr key={opp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                        {opp.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-slate-100 dark:bg-slate-800">
                          {opp.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            opp.status === "published"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : opp.status === "submitted"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {opp.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">
                        {opp.matches?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {opp.applicationDeadline
                          ? new Date(opp.applicationDeadline).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
