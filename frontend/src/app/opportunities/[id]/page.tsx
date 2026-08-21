"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.opportunities.getById(id).then((res) => {
        setOpportunity(res.opportunity);
      }).catch(console.warn).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading opportunity details...</div>;
  }

  if (!opportunity) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">Opportunity not found</p>
        <Link href="/opportunities" className="text-xs text-blue-600 hover:underline">
          Return to browse
        </Link>
      </div>
    );
  }

  const req = opportunity.requirements;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Main Opportunity Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xl space-y-6">
        <div className="space-y-2 border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {opportunity.type}
            </span>
            {opportunity.isRemote && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                Remote Available
              </span>
            )}
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {opportunity.organization}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {opportunity.location || "Remote"}
            </span>
            {opportunity.applicationDeadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Structured Eligibility Requirements */}
        {req && (
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border">
            <h3 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Eligibility Requirements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {req.minGpa && (
                <p>
                  <span className="text-slate-400 font-semibold">Min GPA:</span>{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{req.minGpa}/{req.minGpaScale || 4.0}</span>
                </p>
              )}
              {req.minExperienceYears > 0 && (
                <p>
                  <span className="text-slate-400 font-semibold">Min Experience:</span>{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{req.minExperienceYears} years</span>
                </p>
              )}
              {req.requiredDegrees && (
                <p className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold">Degrees:</span>{" "}
                  <span className="font-bold text-slate-900 dark:text-white">{req.requiredDegrees}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {opportunity.description && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
              Opportunity Overview
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>
        )}

        {/* Apply CTA */}
        <div className="pt-4 border-t flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {opportunity.compensation ? `Compensation: ${opportunity.compensation}` : "Verified Posting"}
          </span>

          {opportunity.applicationUrl ? (
            <a
              href={opportunity.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Apply Directly</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button className="px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md">
              Apply via Platform
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
