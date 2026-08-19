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

        const oppsRes = await fetch("/api/opportunities");
        const opps = await oppsRes.json();
        setOpportunities(Array.isArray(opps) ? opps : []);
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
            {currentUser?.recruiterProfile?.companyName || "Example AI Labs"} · Manage postings,
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
            Active Postings
          </p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">
            {opportunities.length}
          </p>
          <p className="text-[11px] text-slate-500">Verified & active in matching pipeline</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Candidate Pipeline
          </p>
          <p className="text-3xl font-black text-blue-600">12+</p>
          <p className="text-[11px] text-slate-500">Evaluated against structured criteria</p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            High-Quality Matches (&gt;90%)
          </p>
          <p className="text-3xl font-black text-emerald-600">8</p>
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
              Click "View Candidates" to inspect ranked candidate cards with explainable matching.
            </p>
          </div>
          <Link
            href="/recruiter/candidates"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Candidate Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

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
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{opp.location}</span>
                  <span>•</span>
                  <span>Min GPA: {opp.minGpa || "None"}</span>
                  <span>•</span>
                  <span>Required: {opp.requiredSkills}</span>
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
      </div>
    </div>
  );
}
