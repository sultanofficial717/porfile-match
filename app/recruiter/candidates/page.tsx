"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Sparkles,
  Eye,
  Star,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { MatchBreakdownModal } from "@/components/match-breakdown-modal";

export default function RecruiterCandidatesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [selectedOppId, setSelectedOppId] = useState<string>("");
  const [candidateMatches, setCandidateMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [shortlistedMap, setShortlistedMap] = useState<Record<string, "SHORTLISTED" | "REJECTED">>({});

  useEffect(() => {
    fetch("/api/opportunities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOpportunities(data);
          setSelectedOppId(data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedOppId) return;
    setLoading(true);
    fetch(`/api/match?opportunityId=${selectedOppId}`)
      .then((res) => res.json())
      .then((data) => {
        setCandidateMatches(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedOppId]);

  const activeOpp = opportunities.find((o) => o.id === selectedOppId);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>AI Candidate Matching Pipeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Candidate Pool & Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked candidates for your opportunities with hard eligibility checks and feedback collection.
            </p>
          </div>

          {/* Opportunity Switcher */}
          <div className="w-full sm:w-80">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Opportunity
            </label>
            <select
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden"
            >
              {opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.company})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Matches List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {candidateMatches.length} Evaluated Candidates
            </h2>
            <span className="text-xs text-slate-400">
              Sorted by Overall Hybrid Match Score
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidateMatches.map((item) => {
              const stu = item.student;
              const isEligible = item.hardEligibility.passed;
              const status = shortlistedMap[stu.id];

              return (
                <div
                  key={stu.id}
                  className={`p-6 rounded-3xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between space-y-4 ${
                    isEligible && item.overallScore >= 90
                      ? "border-emerald-200 dark:border-emerald-800 shadow-sm ring-1 ring-emerald-500/20"
                      : ""
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center font-bold text-slate-600 border">
                          {stu.user?.avatar ? (
                            <img
                              src={stu.user.avatar}
                              alt={stu.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            stu.user?.name?.charAt(0) || "U"
                          )}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {stu.user?.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {stu.degree || "Major"} · {stu.university || "University"}
                          </p>
                        </div>
                      </div>

                      <MatchScoreBadge
                        score={item.overallScore}
                        hardEligibility={item.hardEligibility.status}
                        size="md"
                      />
                    </div>

                    {/* Candidate Matrix Details */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">GPA</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {stu.gpa ? stu.gpa.toFixed(2) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Experience</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {stu.yearsExperience || 0} yrs
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Location</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {stu.location || "Pakistan"}
                        </p>
                      </div>
                    </div>

                    {/* Top Skills Grid with Levels */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stu.skills?.slice(0, 5).map((sk: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-900"
                        >
                          {sk.skillName} ({sk.level})
                        </span>
                      ))}
                    </div>

                    {/* Why Matched Highlight */}
                    {isEligible ? (
                      <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-0.5">
                        {item.explanation.strongMatches.slice(0, 2).map((sm: string, idx: number) => (
                          <p key={idx} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>{sm}</span>
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-rose-600 space-y-0.5">
                        <p className="flex items-center gap-1 font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{item.hardEligibility.failedChecks[0]?.message}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions & Feedback */}
                  <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedCandidate(item)}
                      className="px-3 py-1.5 rounded-xl border text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    >
                      View Breakdown & Rate
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setShortlistedMap({ ...shortlistedMap, [stu.id]: "SHORTLISTED" })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          status === "SHORTLISTED"
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        ✓ Shortlist
                      </button>

                      <button
                        onClick={() =>
                          setShortlistedMap({ ...shortlistedMap, [stu.id]: "REJECTED" })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          status === "REJECTED"
                            ? "bg-rose-600 text-white"
                            : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidate Breakdown Modal */}
      {selectedCandidate && (
        <MatchBreakdownModal
          isOpen={Boolean(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          title={activeOpp?.title || "Candidate Evaluation"}
          subtitle={`Opportunity: ${activeOpp?.company} · Candidate: ${selectedCandidate.student?.user?.name}`}
          studentName={selectedCandidate.student?.user?.name}
          studentId={selectedCandidate.student?.id}
          opportunityId={activeOpp?.id}
          overallScore={selectedCandidate.overallScore}
          semanticSimilarity={selectedCandidate.semanticSimilarity}
          hardEligibility={selectedCandidate.hardEligibility}
          explanation={selectedCandidate.explanation}
          showFeedbackForm={true}
        />
      )}
    </div>
  );
}
