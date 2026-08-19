"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedWorkplace, setSelectedWorkplace] = useState("ALL");

  useEffect(() => {
    const fetchOpps = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/opportunities?status=Verified");
        if (res.ok) {
          const data = await res.json();
          setOpportunities(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOpps();
  }, []);

  const filtered = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.company.toLowerCase().includes(search.toLowerCase()) ||
      opp.requiredSkills.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === "ALL" || opp.type.toUpperCase() === selectedType.toUpperCase();
    const matchesWorkplace =
      selectedWorkplace === "ALL" ||
      (opp.workplaceType && opp.workplaceType.toUpperCase() === selectedWorkplace.toUpperCase());

    return matchesSearch && matchesType && matchesWorkplace;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Verified Opportunities Directory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Explore Verified Opportunities
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Jobs, internships, research fellowships, scholarships, and volunteer roles with structured
          eligibility criteria and skills matrices.
        </p>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, skills, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Categories</option>
              <option value="Job">Jobs</option>
              <option value="Internship">Internships</option>
              <option value="Fellowship">Fellowships</option>
              <option value="Scholarship">Scholarships</option>
              <option value="Volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <select
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Workplaces (Remote / Hybrid / On-site)</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="p-6 rounded-3xl border bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {opp.type}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    <Link href={`/opportunities/${opp.id}`}>{opp.title}</Link>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                      <Building2 className="w-3.5 h-3.5" /> {opp.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {opp.location} ({opp.workplaceType})
                    </span>
                  </div>
                </div>

                {/* Structured Requirements Pills */}
                <div className="flex flex-wrap gap-2 text-[11px] font-medium pt-1">
                  {opp.minGpa && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Min GPA: {opp.minGpa.toFixed(1)}
                    </span>
                  )}
                  {opp.minExperienceYears !== undefined && opp.minExperienceYears > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Exp: {opp.minExperienceYears}+ yrs
                    </span>
                  )}
                  {opp.salaryOrStipend && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      {opp.salaryOrStipend}
                    </span>
                  )}
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.skills?.slice(0, 4).map((sk: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-100 dark:border-blue-900"
                    >
                      {sk.skillName} ({sk.requiredLevel})
                    </span>
                  ))}
                  {opp.skills?.length > 4 && (
                    <span className="text-[11px] text-slate-400 self-center">
                      +{opp.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {opp.deadline ? `Deadline: ${opp.deadline}` : "Rolling admission"}
                </span>
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
