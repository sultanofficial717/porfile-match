"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Calendar,
  Building2,
  MapPin,
  Sliders,
  FileText,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import { MatchExplanationModal } from "@/components/MatchExplanationModal";

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      const session = await api.auth.getSession(storedId || undefined);

      if (session.currentUser) {
        const studentProfile = await api.student.getProfile(session.currentUser.id);
        setStudent(studentProfile.student);

        const matchRes = await api.matches.getStudentMatches(session.currentUser.id);
        setMatches(matchRes.matches || []);
      }
    } catch (err) {
      console.warn("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completionPct = student?.profileCompletionPct || 0;
  const eligibleMatches = matches.filter((m) => m.eligibilityStatus === "pass");

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Welcome back, {student?.profile?.fullName || "Student"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {student?.headline || "Manage your profile and explore personalized opportunity matches."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:scale-102 transition-transform"
          >
            <span>Profile: {completionPct}% complete</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={fetchDashboardData}
            title="Refresh Matches"
            className="p-2 rounded-2xl border hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>Edit Preferences</span>
        </Link>

        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>Edit Complete Profile</span>
        </Link>
      </div>

      {/* Matches Feed Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Personalized Matches ({eligibleMatches.length})
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Evaluating opportunities against your profile via Ollama...
          </div>
        ) : eligibleMatches.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No active matches yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ensure your preferences are saved and your profile includes education, skills, and experience.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md"
            >
              Update Preferences & Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {eligibleMatches.map((match) => {
              const opp = match.opportunity;
              return (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border hover:border-blue-400 shadow-md hover:shadow-lg transition-all cursor-pointer space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {opp.type}
                      </span>
                      <MatchScoreBadge score={match.finalScore} size="md" />
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {opp.title}
                    </h3>

                    <div className="space-y-1 text-xs text-slate-500 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {opp.organization}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.location || "Remote"} {opp.isRemote ? "(Remote)" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {opp.applicationDeadline
                        ? new Date(opp.applicationDeadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Open"}
                    </span>

                    <span className="font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      <span>View Explanation</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Match Explanation Modal */}
      <MatchExplanationModal
        isOpen={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
      />
    </div>
  );
}
