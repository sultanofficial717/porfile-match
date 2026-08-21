"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ArrowLeft, Building2, User, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminUsersPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [recruiters, setRecruiters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"students" | "recruiters">("students");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.listUsers().then((res) => {
      setStudents(res.students || []);
      setRecruiters(res.recruiters || []);
    }).catch(console.warn).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Hub</span>
        </Link>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            User Management
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Manage registered students and company recruiters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "students"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("recruiters")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "recruiters"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Recruiters ({recruiters.length})</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-3xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          {activeTab === "students" ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Completion</th>
                  <th className="px-6 py-3.5">Preferred Types</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {s.profile?.fullName || "Student"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{s.profile?.email}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {s.profileCompletionPct || 0}%
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {s.preferences?.opportunityTypes || "All"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Organization</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Postings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recruiters.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {r.organizationName}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {r.profile?.fullName} ({r.profile?.email})
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">
                      {r.opportunities?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
