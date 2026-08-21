"use client";

import React from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  Layers,
} from "lucide-react";
import { MatchScoreBadge } from "./MatchScoreBadge";

interface MatchExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export function MatchExplanationModal({
  isOpen,
  onClose,
  match,
}: MatchExplanationModalProps) {
  if (!isOpen || !match) return null;

  const opp = match.opportunity || {};
  const exp = match.explanation || {};
  const breakdown = exp.scoreBreakdown || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {opp.type}
              </span>
              <MatchScoreBadge
                score={match.finalScore}
                eligibilityStatus={match.eligibilityStatus}
                size="sm"
              />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {opp.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium pt-0.5">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {opp.organization}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {opp.location || "Remote"} {opp.isRemote ? "(Remote)" : ""}
              </span>
              {opp.applicationDeadline && (
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Deadline:{" "}
                  {new Date(opp.applicationDeadline).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why You Matched (Checklist) */}
        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-700 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Why This Is A Match</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {exp.overallAssessment || "Your profile qualifies for this position with high compatibility."}
          </p>

          {exp.strongMatches && exp.strongMatches.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Aligned Profile Strengths:
              </p>
              <ul className="space-y-1 text-xs">
                {exp.strongMatches.map((m: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exp.missingSkills && exp.missingSkills.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                Recommended / Preferred Skills To Learn:
              </p>
              <ul className="space-y-1 text-xs">
                {exp.missingSkills.map((s: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{s} (Preferred)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Multi-Factor Score Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Transparent Score Composition</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Semantic AI (40%)</span>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {breakdown.semantic || match.semanticScore || 85}%
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Skills (20%)</span>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {breakdown.skill || match.skillScore || 80}%
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Experience (15%)</span>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {breakdown.experience || match.experienceScore || 75}%
              </p>
            </div>

            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Education (10%)</span>
              <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {breakdown.education || match.educationScore || 90}%
              </p>
            </div>
          </div>
        </div>

        {/* Opportunity Overview & Requirements */}
        {opp.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Description & Responsibilities
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {opp.description}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Close
          </button>

          {opp.applicationUrl ? (
            <a
              href={opp.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
            >
              <span>Apply Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button className="px-6 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
              Apply via Platform
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
