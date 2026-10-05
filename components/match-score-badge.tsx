"use client";

import React from "react";

interface MatchScoreBadgeProps {
  score: number;
  hardEligibility?: string;
  size?: "sm" | "md" | "lg";
}

export function MatchScoreBadge({ score, hardEligibility, size = "md" }: MatchScoreBadgeProps) {
  const rounded = Math.round(score);

  let colorClasses = "";
  if (rounded >= 90) {
    colorClasses = "bg-success-light text-success";
  } else if (rounded >= 80) {
    colorClasses = "bg-primary-light text-[#92400E]";
  } else {
    colorClasses = "bg-surface-alt text-ink-secondary";
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tabular-nums ${colorClasses} ${sizeClasses[size]}`}
    >
      <span className="font-bold">{rounded}%</span>
      <span className="font-normal">match</span>
    </span>
  );
}
