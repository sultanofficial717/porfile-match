"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Users,
  ArrowRight,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  getRecruiterProfile,
  getRoles,
  getMatchesForRole,
} from "@/lib/database";
import type { RecruiterProfile, Role, MatchWithDetails } from "@/lib/types";

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleCandidateCounts, setRoleCandidateCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    if (profile.role !== "recruiter") {
      router.push("/dashboard");
      return;
    }
    loadRecruiterData();
  }, [user, profile, authLoading]);

  const loadRecruiterData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rp = await getRecruiterProfile(user.$id);
      setRecruiterProfile(rp);
      if (rp) {
        const r = await getRoles(rp.$id);
        setRoles(r);

        // Get candidate counts per role
        const counts: Record<string, number> = {};
        for (const role of r) {
          try {
            const matches = await getMatchesForRole(role.$id);
            counts[role.$id] = matches.length;
          } catch {
            counts[role.$id] = 0;
          }
        }
        setRoleCandidateCounts(counts);
      }
    } catch (err) {
      console.error("Error loading recruiter data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no recruiter profile yet, prompt to create one
  if (!recruiterProfile) {
    return (
      <div className="max-w-lg mx-auto my-20 px-6">
        <div className="editorial-card p-8 text-center">
          <div className="w-14 h-14 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground mb-2">
            Set Up Your Company
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Create your recruiter profile to start posting roles and receiving candidates.
          </p>
          <Link href="/recruiter/setup">
            <Button className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md">
              Set Up Profile <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalCandidates = Object.values(roleCandidateCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="page-header page-header-dark p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="tag tag-yellow text-[10px] mb-2 inline-block">
            <Briefcase className="w-3 h-3" /> Recruiter Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-white">
            {recruiterProfile.companyName}
          </h1>
          <p className="text-sm text-white/60 mt-0.5">{profile?.name} · Manage roles and review candidates</p>
        </div>
        <Link href="/recruiter/roles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md">
            <Plus className="w-4 h-4 mr-1" /> Post Role
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="editorial-card p-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Open Roles</p>
          <p className="text-3xl font-display font-semibold text-foreground mt-1">{roles.length}</p>
        </div>
        <div className="editorial-card p-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Total Candidates</p>
          <p className="text-3xl font-display font-semibold text-primary mt-1">{totalCandidates}</p>
        </div>
        <div className="editorial-card p-5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Industry</p>
          <p className="text-lg font-display font-semibold text-foreground mt-1">{recruiterProfile.industry || "—"}</p>
        </div>
      </div>

      {/* Roles List */}
      <div className="editorial-card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-display font-semibold text-foreground">Open Roles</h2>
          <Link href="/recruiter/roles/new" className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
            New Role <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-md">
            <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-display font-semibold text-foreground mb-1">No roles yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Post your first role to start matching candidates.</p>
            <Link href="/recruiter/roles/new">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] text-xs rounded-md">
                <Plus className="w-3.5 h-3.5 mr-1" /> Post Role
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {roles.map((role) => (
              <div key={role.$id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {role.title}
                    </h3>
                    {role.employmentType && (
                      <span className="tag tag-outline text-[10px]">{role.employmentType}</span>
                    )}
                    {role.isActive ? (
                      <span className="tag bg-[var(--color-success-light)] text-[var(--color-success)] text-[10px]">Active</span>
                    ) : (
                      <span className="tag bg-muted text-muted-foreground text-[10px]">Closed</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {role.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {role.location}</span>
                    )}
                    {role.experienceLevel && (
                      <span className="capitalize">{role.experienceLevel} level</span>
                    )}
                    {role.salaryRange && <span>{role.salaryRange}</span>}
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3 h-3" /> {roleCandidateCounts[role.$id] || 0} candidates
                    </span>
                  </div>
                  {role.requiredSkills && role.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.slice(0, 6).map((skill) => (
                        <span key={skill} className="tag tag-yellow text-[10px]">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  href={`/recruiter/roles/${role.$id}/candidates`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-border text-xs font-semibold text-foreground hover:border-primary hover:bg-accent transition-colors shrink-0"
                >
                  <Users className="w-3.5 h-3.5" /> Review Candidates
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
