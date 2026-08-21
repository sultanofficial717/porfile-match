"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Search,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";

export default function OpportunitiesBrowsePage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchOpps = async () => {
    setLoading(true);
    try {
      const res = await api.opportunities.list({
        type: selectedType,
        search: search || undefined,
        remote: remoteOnly ? true : undefined,
      });
      setOpportunities(res.opportunities || []);
    } catch (err) {
      console.warn("Fetch opportunities error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, [selectedType, remoteOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOpps();
  };

  return (
    <div className="space-y-8 py-4">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Explore Opportunities
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Browse verified jobs, internships, scholarships, and fellowships.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or skills..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border bg-slate-50 dark:bg-slate-800"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Types" },
              { id: "job", label: "Full-time Jobs" },
              { id: "internship", label: "Internships" },
              { id: "scholarship", label: "Scholarships" },
              { id: "fellowship", label: "Fellowships" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  selectedType === t.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
            <span>Remote Only</span>
          </label>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-slate-400">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="col-span-2 p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-2">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No opportunities match the current filter.</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {opp.type}
                  </span>
                  {opp.isRemote && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      Remote Available
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  {opp.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-500 font-medium">
                  <p className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {opp.organization}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {opp.location || "Remote"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {opp.applicationDeadline
                    ? new Date(opp.applicationDeadline).toLocaleDateString()
                    : "Open"}
                </span>

                <Link
                  href={`/opportunities/${opp.id}`}
                  className="font-bold text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
