"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ArrowRight,
  User,
  Sliders,
  Filter,
  Check,
  Award,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { MatchBreakdownModal } from "@/components/match-breakdown-modal";

export default function StudentDashboard() {
  const [student, setStudent] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState("ALL");
  const [appliedOpps, setAppliedOpps] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const storedUserId = localStorage.getItem("current_user_id");
        const sessRes = await fetch(
          storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session`
        );
        const sessData = await sessRes.json();
        const curUser = sessData.currentUser;

        if (curUser && curUser.studentProfile) {
          // Fetch full student profile
          const stuRes = await fetch(`/api/students/${curUser.studentProfile.id}`);
          const stuData = await stuRes.json();
          setStudent(stuData);

          // Fetch matches for this student
          const matchRes = await fetch(`/api/match?studentProfileId=${curUser.studentProfile.id}`);
          const matchData = await matchRes.json();
          setMatches(Array.isArray(matchData) ? matchData : []);
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleApply = (oppId: string) => {
    setAppliedOpps((prev) => ({ ...prev, [oppId]: true }));
  };

  const filteredMatches = matches.filter((m) => {
    if (activeTypeFilter === "ALL") return true;
    return m.opportunity.type.toUpperCase() === activeTypeFilter.toUpperCase();
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          Running hybrid matching pipeline across verified opportunities...
        </p>
      </div>
    );
  }

  const completeness = student?.profileCompleteness || 85;

  return (
    <div className="space-y-8">
      {/* Top Banner: Profile Completion & Welcome */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Match Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {student?.user?.name || "Student"}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-100">
            {student?.degree || "Undergraduate"} · {student?.university || "University"} · GPA:{" "}
            {student?.gpa ? student.gpa.toFixed(2) : "3.62"}
          </p>
        </div>

        {/* Completeness Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full md:w-72 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span>Profile Completion</span>
            <span>{completeness}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] text-blue-200">
              {completeness >= 85 ? "✓ Excellent profile depth" : "Add more skills & projects"}
            </span>
            <Link
              href="/profile"
              className="text-[11px] font-bold text-white hover:underline flex items-center gap-0.5"
            >
              Edit Profile <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recommended Opportunities Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Recommended Opportunities</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {filteredMatches.length} Matches
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked by hybrid match score (hard eligibility + semantic similarity + structured criteria).
            </p>
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs font-semibold">
            {["ALL", "JOB", "INTERNSHIP", "FELLOWSHIP", "VOLUNTEER"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize ${
                  activeTypeFilter === t
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t === "ALL" ? "All Types" : t.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Matches Feed Cards */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-3xl border bg-white dark:bg-slate-900 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching opportunities found
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your profile skills or switching filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((item, index) => {
              const opp = item.opportunity;
              const isApplied = appliedOpps[opp.id];
              const isEligible = item.hardEligibility.passed;

              return (
                <div
                  key={opp.id}
                  className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 transition-all hover:shadow-lg ${
                    isEligible && item.overallScore >= 90
                      ? "ring-1 ring-emerald-500/30 border-emerald-200 dark:border-emerald-800"
                      : ""
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Main Opportunity Info */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {opp.type}
                        </span>
                        <MatchScoreBadge
                          score={item.overallScore}
                          hardEligibility={item.hardEligibility.status}
                          size="md"
                        />
                        {index === 0 && isEligible && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Top Recommendation
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          <Link href={`/opportunities/${opp.id}`} className="hover:text-blue-600 transition-colors">
                            {opp.title}
                          </Link>
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1 font-medium">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                            <Building2 className="w-3.5 h-3.5" /> {opp.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {opp.location} ({opp.workplaceType})
                          </span>
                          {opp.salaryOrStipend && (
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <DollarSign className="w-3.5 h-3.5" /> {opp.salaryOrStipend}
                            </span>
                          )}
                          {opp.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> Due: {opp.deadline}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Why this matches you section */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            {isEligible ? "Why this matches you:" : "Eligibility constraints:"}
                          </p>
                          <button
                            onClick={() => setSelectedMatch(item)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                          >
                            View Full Score Breakdown <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>

                        {isEligible ? (
                          <div className="flex flex-wrap gap-2 text-xs">
                            {item.explanation.strongMatches.slice(0, 5).map((sm: string, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                {sm}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs text-rose-600 font-medium">
                            {item.hardEligibility.failedChecks.map((f: any, idx: number) => (
                              <p key={idx}>✕ {f.message}</p>
                            ))}
                          </div>
                        )}

                        {/* Missing skills if any */}
                        {item.explanation.missingSkills && item.explanation.missingSkills.length > 0 && isEligible && (
                          <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-semibold text-amber-600">Consider learning:</span>
                            <span>{item.explanation.missingSkills.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Actions */}
                    <div className="flex sm:flex-row lg:flex-col items-center justify-between gap-2 lg:w-44 pt-2 lg:pt-0">
                      <button
                        onClick={() => setSelectedMatch(item)}
                        className="w-full px-4 py-2 rounded-xl border bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all"
                      >
                        Explain Score
                      </button>

                      {isEligible ? (
                        <button
                          onClick={() => handleApply(opp.id)}
                          disabled={isApplied}
                          className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                            isApplied
                              ? "bg-emerald-600 text-white cursor-default"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Applied
                            </>
                          ) : (
                            <>
                              Apply Now <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-xs text-center text-slate-400 font-medium py-1">
                          Ineligible to apply
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Score Breakdown Modal */}
      {selectedMatch && (
        <MatchBreakdownModal
          isOpen={Boolean(selectedMatch)}
          onClose={() => setSelectedMatch(null)}
          title={selectedMatch.opportunity.title}
          subtitle={`Organization: ${selectedMatch.opportunity.company} · Candidate: ${student?.user?.name}`}
          studentName={student?.user?.name}
          studentId={student?.id}
          opportunityId={selectedMatch.opportunity.id}
          overallScore={selectedMatch.overallScore}
          semanticSimilarity={selectedMatch.semanticSimilarity}
          hardEligibility={selectedMatch.hardEligibility}
          explanation={selectedMatch.explanation}
          showFeedbackForm={false}
        />
      )}
    </div>
  );
}
