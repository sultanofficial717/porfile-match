"use client";

import React from "react";

interface MatchScoreBadgeProps {
  score: number;
  eligibilityStatus?: "pass" | "fail";
  size?: "sm" | "md" | "lg";
}

export function MatchScoreBadge({
  score,
  eligibilityStatus = "pass",
  size = "md",
}: MatchScoreBadgeProps) {
  if (eligibilityStatus === "fail") {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-full border border-rose-200 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : size === "lg"
            ? "px-4 py-1.5 text-base"
            : "px-2.5 py-1 text-xs"
        }`}
      >
        Not Eligible
      </span>
    );
  }

  let colorClasses = "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300";
  if (score < 80) {
    colorClasses = "border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300";
  } else if (score < 90) {
    colorClasses = "border-amber-200 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border shadow-xs ${colorClasses} ${
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : size === "lg"
          ? "px-4 py-1.5 text-base"
          : "px-2.5 py-1 text-xs"
      }`}
    >
      <span>{score}%</span>
      <span className="text-[10px] uppercase font-semibold opacity-75">Match</span>
    </span>
  );
}
