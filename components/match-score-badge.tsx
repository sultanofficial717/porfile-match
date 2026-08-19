import React from "react";
import { Sparkles, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface MatchScoreBadgeProps {
  score: number;
  hardEligibility?: "PASS" | "FAIL";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function MatchScoreBadge({
  score,
  hardEligibility = "PASS",
  size = "md",
  showLabel = true,
}: MatchScoreBadgeProps) {
  if (hardEligibility === "FAIL") {
    const sizeClasses =
      size === "sm"
        ? "px-2 py-0.5 text-xs"
        : size === "lg"
        ? "px-3.5 py-1.5 text-sm font-semibold"
        : "px-2.5 py-1 text-xs font-semibold";

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 ${sizeClasses}`}
      >
        <XCircle className="w-3.5 h-3.5 text-red-600" />
        <span>Not Eligible</span>
      </span>
    );
  }

  // Color gradient based on match percentage
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let icon = null;

  if (score >= 92) {
    colorClasses =
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 ring-1 ring-emerald-500/20";
    icon = <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
  } else if (score >= 80) {
    colorClasses =
      "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 ring-1 ring-blue-500/20";
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
  } else if (score >= 65) {
    colorClasses =
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30";
    icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-xs font-medium"
      : size === "lg"
      ? "px-3.5 py-1.5 text-sm font-bold shadow-sm"
      : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-all ${colorClasses} ${sizeClasses}`}
    >
      {icon}
      <span>{score.toFixed(0)}%{showLabel ? " Match" : ""}</span>
    </span>
  );
}
