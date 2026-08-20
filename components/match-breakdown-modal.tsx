"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Layers,
  ThumbsUp,
  Award,
  BookOpen,
  Info,
} from "lucide-react";
import { MatchExplanation, EligibilityResult } from "@/lib/types";

interface MatchBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  studentName?: string;
  studentId?: string;
  opportunityId?: string;
  overallScore: number;
  semanticSimilarity?: number;
  hardEligibility: EligibilityResult;
  explanation: MatchExplanation;
  showFeedbackForm?: boolean;
}

export function MatchBreakdownModal({
  isOpen,
  onClose,
  title,
  subtitle,
  studentName,
  studentId,
  opportunityId,
  overallScore,
  semanticSimilarity,
  hardEligibility,
  explanation,
  showFeedbackForm = true,
}: MatchBreakdownModalProps) {
  const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [feedbackReason, setFeedbackReason] = useState<string>("Strong skill alignment");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFeedback = async (decision: string) => {
    if (!studentId || !opportunityId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          opportunityId,
          score: overallScore,
          recruiterDecision: decision,
          feedbackReason,
          feedbackText,
        }),
      });
      if (res.ok) {
        setFeedbackSent(decision);
      }
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  const scoreBreakdown = explanation?.scoreBreakdown || {
    semantic: semanticSimilarity || 0,
    skill: 0,
    experience: 0,
    education: 0,
    completeness: 0,
    other: 0,
  };

  const weights = explanation?.weightsUsed || {
    semanticWeight: 0.40,
    skillWeight: 0.20,
    experienceWeight: 0.15,
    educationWeight: 0.10,
    completenessWeight: 0.10,
    otherWeight: 0.05,
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-800/30 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Explainable Match Breakdown
              </span>
              {hardEligibility.passed ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Hard Eligibility: PASS
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Hard Eligibility: FAIL
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Overall Assessment Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              hardEligibility.passed
                ? overallScore >= 90
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
                  : overallScore >= 80
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800"
                : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="space-y-0.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Assessment Status
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {explanation?.overallAssessment || "Matching Evaluation"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {hardEligibility.passed
                  ? `Structured requirements satisfied + calculated hybrid multi-factor score.`
                  : `Candidate does not satisfy mandatory eligibility constraints.`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {overallScore.toFixed(0)}%
              </span>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Overall Score</p>
            </div>
          </div>

          {/* Stage 1: Hard Eligibility Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheckIcon /> Stage 1: Hard Eligibility Verification
            </h4>
            <div className="p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              {hardEligibility.failedChecks && hardEligibility.failedChecks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-bold text-red-600 dark:text-red-400">Failed Mandatory Criteria:</p>
                  {hardEligibility.failedChecks.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-red-700 dark:text-red-300">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{f.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {hardEligibility.passedChecks && hardEligibility.passedChecks.length > 0 && (
                <div className="space-y-1.5">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">Satisfied Criteria:</p>
                  {hardEligibility.passedChecks.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stage 2: Weighted Multi-Factor Score Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Transparent Scoring Matrix
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Semantic Similarity */}
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Semantic Similarity
                  </span>
                  <span className="font-bold">{scoreBreakdown.semantic.toFixed(1)}% (Weight: {(weights.semanticWeight * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, scoreBreakdown.semantic)}%` }}
                  />
                </div>
              </div>

              {/* Skill Match */}
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Skill Match
                  </span>
                  <span className="font-bold">{scoreBreakdown.skill.toFixed(1)}% (Weight: {(weights.skillWeight * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, scoreBreakdown.skill)}%` }}
                  />
                </div>
              </div>

              {/* Experience Match */}
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" /> Experience Match
                  </span>
                  <span className="font-bold">{scoreBreakdown.experience.toFixed(1)}% (Weight: {(weights.experienceWeight * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, scoreBreakdown.experience)}%` }}
                  />
                </div>
              </div>

              {/* Education Match */}
              <div className="p-3 rounded-xl border bg-white dark:bg-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500" /> Education Match
                  </span>
                  <span className="font-bold">{scoreBreakdown.education.toFixed(1)}% (Weight: {(weights.educationWeight * 100).toFixed(0)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, scoreBreakdown.education)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strong Matches */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <h5 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strong Matches
              </h5>
              {explanation?.strongMatches && explanation.strongMatches.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {explanation.strongMatches.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No standout highlights recorded.</p>
              )}
            </div>

            {/* Missing or Lower Level Skills */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <h5 className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Missing / Unmet Skills
              </h5>
              {explanation?.missingSkills && explanation.missingSkills.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                  {explanation.missingSkills.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                      <span className="text-amber-600 font-bold">○</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">All required and preferred skills satisfied!</p>
              )}
            </div>
          </div>

          {/* Recruiter Evaluation Feedback Section (Section 23) */}
          {showFeedbackForm && (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> Recruiter Evaluation & Model Feedback
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Rate this candidate match and submit structured feedback to refine opportunity matching.
                  </p>
                </div>
                {feedbackSent && (
                  <span className="text-xs font-semibold text-emerald-600">
                    ✓ Feedback saved ({feedbackSent})
                  </span>
                )}
              </div>

              {/* Rating Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedDecision("STRONG_MATCH")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDecision === "STRONG_MATCH"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 border-slate-200"
                  }`}
                >
                  ⭐ Strong Match
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedDecision("GOOD_MATCH")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDecision === "GOOD_MATCH"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-700 border-slate-200"
                  }`}
                >
                  👍 Good Match
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedDecision("WEAK_MATCH")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDecision === "WEAK_MATCH"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 border-slate-200"
                  }`}
                >
                  ⚠️ Weak Match
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedDecision("WRONG_MATCH")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedDecision === "WRONG_MATCH"
                      ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 border-slate-200"
                  }`}
                >
                  ❌ Wrong Match
                </button>
              </div>

              {/* Structured Feedback Reason Selection */}
              {selectedDecision && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Reason for Rating
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        "Strong skill alignment",
                        "Skills mismatch",
                        "Experience mismatch",
                        "Education mismatch",
                        "Profile incomplete",
                        "Other",
                      ].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackReason(r)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-left transition-colors ${
                            feedbackReason === r
                              ? "bg-blue-600 text-white border-blue-600 font-semibold"
                              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Optional Notes / Comments
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Add specific feedback for this match recommendation..."
                      className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleFeedback(selectedDecision)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting Feedback..." : "Submit Evaluation Feedback"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 dark:bg-slate-800/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

function ShieldCheckIcon() {
  return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
}
