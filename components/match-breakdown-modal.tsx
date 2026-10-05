"use client";

import React, { useState } from "react";
import {
  Cancel01Icon as X,
  Tick02Icon as CheckCircle2,
  MultiplicationSignCircleIcon as XCircle,
  Alert01Icon as AlertTriangle,
  Mortarboard01Icon as GraduationCap,
  Briefcase02Icon as Briefcase,
  Layers01Icon as Layers,
  ThumbsUpIcon as ThumbsUp,
  BookOpen01Icon as BookOpen,
} from "hugeicons-react";
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

  const scoreBars = [
    { label: "Semantic Similarity", value: scoreBreakdown.semantic, weight: weights.semanticWeight, color: "#F59E0B" },
    { label: "Skill Match", value: scoreBreakdown.skill, weight: weights.skillWeight, color: "#2563EB", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { label: "Experience", value: scoreBreakdown.experience, weight: weights.experienceWeight, color: "#059669", icon: <Briefcase className="w-3.5 h-3.5" /> },
    { label: "Education", value: scoreBreakdown.education, weight: weights.educationWeight, color: "#7C3AED", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-white border border-[#E5E7EB] overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-start justify-between bg-[#FAFAFA]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-[#FEF3C7] text-[#92400E]">
                Match Breakdown
              </span>
              {hardEligibility.passed ? (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#D1FAE5] text-[#065F46] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Eligible
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FEE2E2] text-[#991B1B] flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Ineligible
                </span>
              )}
            </div>
            <h2 className="text-lg font-display font-bold text-[#0A0A0A]">{title}</h2>
            {subtitle && <p className="text-xs text-[#6B7280]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#9CA3AF] hover:text-[#0A0A0A] hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Overall Score Banner */}
          <div className={`p-4 rounded-lg border flex items-center justify-between ${
            hardEligibility.passed
              ? overallScore >= 90 ? "bg-[#D1FAE5] border-[#A7F3D0]" : overallScore >= 80 ? "bg-[#FEF3C7] border-[#FDE68A]" : "bg-[#F9FAFB] border-[#E5E7EB]"
              : "bg-[#FEE2E2] border-[#FECACA]"
          }`}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">Assessment</p>
              <h3 className="text-base font-display font-bold text-[#0A0A0A]">
                {explanation?.overallAssessment || "Match Evaluation"}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-3xl font-display font-bold text-[#0A0A0A]">
                {overallScore.toFixed(0)}%
              </span>
              <p className="text-[10px] text-[#6B7280] font-medium">Overall Score</p>
            </div>
          </div>

          {/* Eligibility Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#374151] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Hard Eligibility
            </h4>
            <div className="p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] space-y-1.5 text-xs">
              {hardEligibility.failedChecks && hardEligibility.failedChecks.length > 0 && (
                <div className="space-y-1">
                  {hardEligibility.failedChecks.map((f: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[#DC2626]">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{f.message}</span>
                    </div>
                  ))}
                </div>
              )}
              {hardEligibility.passedChecks && hardEligibility.passedChecks.length > 0 && (
                <div className="space-y-1">
                  {hardEligibility.passedChecks.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[#059669]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Score Breakdown Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#374151] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#F59E0B]" /> Score Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scoreBars.map((bar) => (
                <div key={bar.label} className="p-3 rounded-lg border border-[#E5E7EB] bg-white space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[#374151] flex items-center gap-1" style={{ color: bar.color }}>
                      {bar.icon} {bar.label}
                    </span>
                    <span className="font-semibold text-[#0A0A0A]">{bar.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, bar.value)}%`, backgroundColor: bar.color }}
                    />
                  </div>
                  <p className="text-[10px] text-[#9CA3AF]">Weight: {(bar.weight * 100).toFixed(0)}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Highlights & Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#A7F3D0] bg-[#F0FDF4] space-y-2">
              <h5 className="text-xs font-semibold uppercase text-[#065F46] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strong Matches
              </h5>
              {explanation?.strongMatches && explanation.strongMatches.length > 0 ? (
                <ul className="space-y-1 text-xs text-[#374151]">
                  {explanation.strongMatches.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-[#059669] font-bold">✓</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#9CA3AF]">No standout highlights.</p>
              )}
            </div>

            <div className="p-3 rounded-lg border border-[#FDE68A] bg-[#FFFBEB] space-y-2">
              <h5 className="text-xs font-semibold uppercase text-[#92400E] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Gaps
              </h5>
              {explanation?.missingSkills && explanation.missingSkills.length > 0 ? (
                <ul className="space-y-1 text-xs text-[#374151]">
                  {explanation.missingSkills.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center gap-1.5 text-[#92400E]">
                      <span className="font-bold">○</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-[#9CA3AF]">All skills satisfied!</p>
              )}
            </div>
          </div>

          {/* Recruiter Feedback */}
          {showFeedbackForm && (
            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-[#374151] flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#F59E0B]" /> Recruiter Feedback
                  </h5>
                  <p className="text-[11px] text-[#9CA3AF]">Rate this match to improve future recommendations.</p>
                </div>
                {feedbackSent && (
                  <span className="text-xs font-medium text-[#059669]">✓ Saved</span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "STRONG_MATCH", label: "⭐ Strong", color: "#059669" },
                  { key: "GOOD_MATCH", label: "👍 Good", color: "#2563EB" },
                  { key: "WEAK_MATCH", label: "⚠️ Weak", color: "#D97706" },
                  { key: "WRONG_MATCH", label: "❌ Wrong", color: "#DC2626" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setSelectedDecision(opt.key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      selectedDecision === opt.key
                        ? "text-white border-transparent"
                        : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                    }`}
                    style={selectedDecision === opt.key ? { backgroundColor: opt.color } : {}}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {selectedDecision && (
                <div className="p-3 rounded-lg bg-[#FAFAFA] border border-[#E5E7EB] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Reason</label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Strong skill alignment", "Skills mismatch", "Experience mismatch", "Education mismatch", "Profile incomplete", "Other"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFeedbackReason(r)}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                            feedbackReason === r
                              ? "bg-[#F59E0B] text-white border-[#F59E0B]"
                              : "bg-white text-[#374151] border-[#E5E7EB] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#374151] mb-1">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Additional feedback..."
                      className="w-full p-2 rounded-lg border border-[#E5E7EB] bg-white text-xs text-[#0A0A0A] outline-none focus:ring-2 focus:ring-[#F59E0B]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleFeedback(selectedDecision)}
                      className="px-4 py-2 bg-[#0A0A0A] hover:bg-[#374151] text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E5E7EB] bg-[#FAFAFA] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#0A0A0A] hover:bg-[#374151] text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
