"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Briefcase,
  Layers,
  GraduationCap,
  Award,
  Globe,
  ExternalLink,
  Shield,
} from "lucide-react";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { MatchBreakdownModal } from "@/components/match-breakdown-modal";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOpportunity(data);
        }

        // Check active student session
        const storedUserId = localStorage.getItem("current_user_id");
        const sessRes = await fetch(
          storedUserId ? `/api/auth/session?userId=${storedUserId}` : `/api/auth/session`
        );
        const sessData = await sessRes.json();
        if (sessData.currentUser?.studentProfile) {
          setCurrentStudent(sessData.currentUser.studentProfile);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const runLiveMatch = async () => {
    if (!currentStudent || !opportunity) return;
    setMatching(true);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentProfileId: currentStudent.id,
          opportunityId: opportunity.id,
          providerName: "gemini",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMatchResult(data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!opportunity) {
    return <div className="text-center py-12">Opportunity not found.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Opportunities</span>
      </Link>

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {opportunity.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {opportunity.verificationStatus}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {opportunity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200">
                <Building2 className="w-4 h-4" /> {opportunity.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {opportunity.location} ({opportunity.workplaceType})
              </span>
              {opportunity.salaryOrStipend && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <DollarSign className="w-4 h-4" /> {opportunity.salaryOrStipend}
                </span>
              )}
            </div>
          </div>

          {/* Instant Match Action */}
          {currentStudent && (
            <button
              onClick={runLiveMatch}
              disabled={matching}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{matching ? "Matching..." : "Match With My Profile"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Structured Eligibility Requirements Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Stage 1 Mandatory Eligibility Criteria</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Minimum GPA</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {opportunity.minGpa ? `${opportunity.minGpa.toFixed(2)} / 4.00` : "No minimum GPA"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Required Discipline</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={opportunity.requiredDegree || "Any"}>
              {opportunity.requiredDegree || "Any Discipline"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Min Experience</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {opportunity.minExperienceYears ? `${opportunity.minExperienceYears}+ Years` : "Fresh / Entry"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase">Work Authorization</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {opportunity.workAuthorization || "Pakistan"}
            </p>
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Skills Matrix Requirements</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {opportunity.skills?.map((sk: any, idx: number) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{sk.skillName}</p>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    sk.isMandatory
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {sk.isMandatory ? "Mandatory" : "Preferred"}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border">
                Level: {sk.requiredLevel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description & Responsibilities */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border space-y-6 shadow-xs">
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Full Opportunity Description
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {opportunity.fullDescription}
          </p>
        </div>

        {opportunity.responsibilities && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Key Responsibilities
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.responsibilities}
            </p>
          </div>
        )}

        {opportunity.benefits && (
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Benefits & Compensation
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {opportunity.benefits}
            </p>
          </div>
        )}
      </div>

      {/* Score Modal */}
      {matchResult && (
        <MatchBreakdownModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={opportunity.title}
          subtitle={`Organization: ${opportunity.company}`}
          studentName={matchResult.student?.user?.name}
          studentId={matchResult.student?.id}
          opportunityId={opportunity.id}
          overallScore={matchResult.overallScore}
          semanticSimilarity={matchResult.semanticSimilarity}
          hardEligibility={matchResult.hardEligibility}
          explanation={matchResult.explanation}
          showFeedbackForm={true}
        />
      )}
    </div>
  );
}
