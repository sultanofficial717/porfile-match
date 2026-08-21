"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, CheckCircle2, XCircle, ArrowLeft, Building2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getPendingRecruiters();
      setRecruiters(res.recruiters || []);
    } catch (err) {
      console.warn("Failed to load recruiter queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    try {
      const adminId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : undefined;
      await api.admin.updateRecruiterStatus(id, status, adminId || undefined);
      fetchQueue();
    } catch (err: any) {
      alert(err.message || "Failed to update recruiter status.");
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
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Recruiter Approval Queue
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Review and approve pending recruiter signups before they can publish live opportunities.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading pending signups...</div>
        ) : recruiters.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">All recruiter accounts are moderated.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recruiters.map((r) => (
              <div
                key={r.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {r.organizationName}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {r.profile?.fullName || "Representative"}
                    </span>{" "}
                    ({r.profile?.email}) · {r.jobTitle || "Recruiter"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAction(r.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => handleAction(r.id, "rejected")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-bold transition-all"
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
    </div>
  );
}
