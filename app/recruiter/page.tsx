"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function RecruiterDashboardPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalStudents: 0, totalMatches: 0, highQualityMatches: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadRecruiterData = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem("current_user_id");
        const sessRes = await fetch(
          storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session`
        );
        const sessData = await sessRes.json();
        const user = sessData.currentUser;
        setCurrentUser(user);

        const [oppsRes, statsRes] = await Promise.all([
          fetch("/api/opportunities"),
          fetch("/api/admin/stats"),
        ]);

        if (oppsRes.ok) {
          const opps = await oppsRes.json();
          setOpportunities(Array.isArray(opps) ? opps : []);
        }
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadRecruiterData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {currentUser?.name || "Recruiter"} Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {currentUser?.recruiterProfile?.companyName || "Organization"} · Manage postings,
            review structured AI candidate matches, and give model tuning feedback.
          </p>
        </div>

        <Link
          href="/recruiter/opportunities/new"
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </Link>
      </div>

      {/* Recruiter KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Postings
          </p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {opportunities.length}
          </p>
          <p className="text-[11px] text-slate-500">Real opportunities in system</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Candidates
          </p>
          <p className="text-3xl font-black text-blue-600">
            {stats.totalStudents ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">Students & professionals registered</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            High-Quality Matches (&gt;=92%)
          </p>
          <p className="text-3xl font-black text-emerald-600">
            {stats.matchesAboveThreshold ?? stats.highQualityMatches ?? 0}
          </p>
          <p className="text-[11px] text-slate-500">Qualified for threshold notification</p>
        </div>
      </div>

      {/* Opportunity Management Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Opportunity Postings & Matches
            </h2>
            <p className="text-xs text-slate-500">
              Click "Review Candidates" to inspect ranked candidate cards with explainable matching.
            </p>
          </div>
          {opportunities.length > 0 && (
            <Link
              href="/recruiter/candidates"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>All Candidate Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {opportunities.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl border bg-slate-50 dark:bg-slate-800/40 space-y-3">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No opportunities created yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your first real opportunity with structured eligibility requirements to start matching with candidate profiles.
            </p>
            <div className="pt-2">
              <Link
                href="/recruiter/opportunities/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Post Opportunity
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800">
                      {opp.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {opp.title}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        opp.verificationStatus === "Verified"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : opp.verificationStatus === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {opp.verificationStatus || "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{opp.location}</span>
                    <span>•</span>
                    <span>Min GPA: {opp.minGpa !== null && opp.minGpa !== undefined ? opp.minGpa : "None"}</span>
                    <span>•</span>
                    <span>Required: {opp.requiredSkills || "General"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/recruiter/candidates?opportunityId=${opp.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Review Candidates</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

