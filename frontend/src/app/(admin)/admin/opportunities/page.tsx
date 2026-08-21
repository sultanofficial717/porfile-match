"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getPendingOpportunities();
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.warn("Failed to load opportunities queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReview = async (id: string, status: "published" | "rejected") => {
    setActionSuccessMessage(null);
    try {
      const adminId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : undefined;
      const res = await api.admin.reviewOpportunity(id, status, adminId || undefined);

      if (status === "published" && res.matchStats) {
        setActionSuccessMessage(
          `Opportunity Published! Matching engine evaluated students: ${res.matchStats.matchesCreated} matches scored, ${res.matchStats.emailsSent} notification emails sent.`
        );
      }
      fetchQueue();
    } catch (err: any) {
      alert(err.message || "Failed to review opportunity.");
    }
  };

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
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Opportunity Review Queue
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Moderate submitted postings. Approving an opportunity publishes it and triggers the matching engine automatically.
        </p>
      </div>

      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pending opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">All submitted postings have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {opp.type}
                      </span>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">{opp.title}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted by <span className="font-semibold">{opp.organization}</span> ({opp.recruiter?.profile?.email || "Recruiter"})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReview(opp.id, "published")}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve → Publish</span>
                    </button>

                    <button
                      onClick={() => handleReview(opp.id, "rejected")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Structured Criteria Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Location / Remote</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {opp.location || "Remote"} {opp.isRemote ? "(Remote OK)" : ""}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Min GPA / Degree</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      GPA: {opp.requirements?.minGpa || "None"} · {opp.requirements?.requiredDegrees || "Any Degree"}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Application Deadline</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {opp.applicationDeadline
                        ? new Date(opp.applicationDeadline).toLocaleDateString()
                        : "Open"}
                    </p>
                  </div>
                </div>

                {opp.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                    {opp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
