"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  User,
  GraduationCap,
  MapPin,
  Check,
  X,
  Mail,
  Eye,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
  Inbox,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  getRole,
  getMatchesForRole,
  updateMatchStatus,
  generateMatchesForRole,
  getApplicationDataFromMatch,
} from "@/lib/database";
import type { Role, MatchWithDetails, MatchStatus } from "@/lib/types";
import { ApplicationDossierModal } from "@/components/application-dossier-modal";
import { toast } from "sonner";

export default function CandidatesPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = use(params);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab & Filter states
  const [activeTab, setActiveTab] = useState<"applications" | "prospects">("applications");
  const [statusFilter, setStatusFilter] = useState("all");

  // Application Dossier modal
  const [dossierMatch, setDossierMatch] = useState<MatchWithDetails | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile || profile.role !== "recruiter") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, profile, authLoading, roleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const r = await getRole(roleId);
      setRole(r);
      if (r) {
        let m = await getMatchesForRole(roleId);
        if (m.length === 0) {
          await generateMatchesForRole(roleId);
          m = await getMatchesForRole(roleId);
        }
        setMatches(m);
      }
    } catch (err) {
      console.error("Error loading candidates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await generateMatchesForRole(roleId);
      const m = await getMatchesForRole(roleId);
      setMatches(m);
      toast.success("Candidates recalculated!");
    } catch (err) {
      console.error("Error refreshing matches:", err);
      toast.error("Failed to refresh candidates.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (matchId: string, status: MatchStatus) => {
    try {
      await updateMatchStatus(matchId, status);
      setMatches((prev) =>
        prev.map((m) => (m.$id === matchId ? { ...m, status } : m))
      );
      if (dossierMatch && dossierMatch.$id === matchId) {
        setDossierMatch((prev) => (prev ? { ...prev, status } : null));
      }
      toast.success(`Candidate moved to ${status}!`);

      // Dispatch notification email to candidate
      const targetMatch = matches.find((m) => m.$id === matchId) || dossierMatch;
      if (targetMatch && (status === "shortlisted" || status === "contacted")) {
        fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: status,
            payload: {
              studentEmail: targetMatch.profile?.email || targetMatch.studentProfile?.email,
              studentName: targetMatch.profile?.name || "Candidate",
              roleTitle: role?.title || "Role",
              companyName: profile?.name || "Employer",
              recruiterEmail: user?.email,
            },
          }),
        }).catch(console.error);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="max-w-lg mx-auto my-20 px-6 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-xl font-display font-semibold text-foreground">Role not found</h2>
        <Link href="/recruiter" className="text-sm text-primary hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Partition candidates
  const appliedCandidates = matches.filter((m) => getApplicationDataFromMatch(m).isApplied);
  const matchedProspects = matches.filter((m) => !getApplicationDataFromMatch(m).isApplied);

  const currentList = activeTab === "applications" ? appliedCandidates : matchedProspects;

  const filteredMatches = currentList.filter((m) => {
    if (statusFilter === "all") return true;
    return m.status === statusFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      <Link
        href="/recruiter"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      {/* Role Header */}
      <div className="page-header page-header-dark p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="tag tag-yellow text-[10px] mb-2 inline-block">Role Pipeline</span>
          <h1 className="text-2xl font-display font-semibold text-white">{role.title}</h1>
          <p className="text-sm text-white/60 mt-0.5">
            {role.location || "Remote"} · {role.employmentType || "Full-time"} · {appliedCandidates.length} applications · {matchedProspects.length} matched
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin text-[#F59E0B]" : ""}`} />
          {isRefreshing ? "Calculating..." : "Refresh Matches"}
        </Button>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("applications");
              setStatusFilter("all");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "applications"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Submitted Applications ({appliedCandidates.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("prospects");
              setStatusFilter("all");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "prospects"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Matched Candidates ({matchedProspects.length})
          </button>
        </div>

        {/* Stage Filter */}
        <div className="flex flex-wrap gap-1.5">
          {["all", "viewed", "shortlisted", "contacted", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)} (
              {status === "all" ? currentList.length : currentList.filter((m) => m.status === status).length}
              )
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Cards */}
      {filteredMatches.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-2">
          <User className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-display font-semibold text-foreground">
            {activeTab === "applications" ? "No applications submitted for this role yet" : "No candidates found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {activeTab === "applications"
              ? "Candidates who apply will appear here with their custom pitch, coursework, and contact details."
              : "Check your active skills requirements or click 'Refresh Matches' to rescan the student pool."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => {
            const appData = getApplicationDataFromMatch(match);
            const isApplied = appData.isApplied;
            const details = appData.applicationDetails;
            const appliedDate = appData.appliedDate
              ? new Date(appData.appliedDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : null;

            const cleanReasons = (match.matchReasons || []).filter(
              (r) => !r.startsWith("APPLICATION_DATA:") && !r.startsWith("APPLIED_ON:")
            );

            return (
              <div
                key={match.$id}
                className={`editorial-card p-5 space-y-3 transition-all hover:border-primary/40 ${
                  isApplied ? "border-emerald-500/25 bg-emerald-500/[0.01]" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
                          match.matchScore >= 80
                            ? "bg-primary text-primary-foreground"
                            : match.matchScore >= 60
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Star className="w-3 h-3" /> {match.matchScore}%
                      </span>
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Applied {appliedDate ? `· ${appliedDate}` : ""}
                        </span>
                      )}
                      <span
                        className={`tag text-[10px] capitalize ${
                          match.status === "shortlisted"
                            ? "bg-emerald-500/15 text-emerald-600 font-semibold"
                            : match.status === "contacted"
                            ? "bg-blue-500/15 text-blue-600 font-semibold"
                            : match.status === "rejected"
                            ? "bg-rose-500/15 text-rose-600"
                            : "tag-outline"
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-semibold text-foreground">
                      {match.profile?.name || "Student Candidate"}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {match.studentProfile?.degree && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-primary" /> {match.studentProfile.degree}
                        </span>
                      )}
                      {match.studentProfile?.institution && (
                        <span>{match.studentProfile.institution}</span>
                      )}
                      {match.studentProfile?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {match.studentProfile.location}
                        </span>
                      )}
                      {match.studentProfile?.gpa && (
                        <span className="font-medium">GPA: {match.studentProfile.gpa}</span>
                      )}
                    </div>

                    {/* Candidate Pitch (if applied) */}
                    {details?.coverNote && (
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                        <span className="font-semibold text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3 text-primary" /> Pitch:
                        </span>
                        <p className="text-foreground line-clamp-2 italic leading-relaxed">
                          &ldquo;{details.coverNote}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Skill overlap */}
                    {match.skillOverlap && match.skillOverlap.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {match.skillOverlap.map((skill) => (
                          <span key={skill} className="tag tag-yellow text-[10px]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Clean Match reasons */}
                    {cleanReasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cleanReasons.map((r, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-medium rounded-md"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-500" /> {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 px-2.5"
                      onClick={() => setDossierMatch(match)}
                    >
                      <FileText className="w-3.5 h-3.5 mr-1 text-primary" /> Dossier
                    </Button>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        className={`text-xs h-8 px-2.5 ${
                          match.status === "shortlisted"
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20"
                        }`}
                        onClick={() => handleUpdateStatus(match.$id, "shortlisted")}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Shortlist
                      </Button>
                      <Button
                        size="sm"
                        className={`text-xs h-8 px-2.5 ${
                          match.status === "contacted"
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20"
                        }`}
                        onClick={() => handleUpdateStatus(match.$id, "contacted")}
                      >
                        <Mail className="w-3.5 h-3.5 mr-1" /> Contact
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => handleUpdateStatus(match.$id, "rejected")}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Dossier Modal */}
      <ApplicationDossierModal
        isOpen={!!dossierMatch}
        onClose={() => setDossierMatch(null)}
        match={dossierMatch}
        onStatusUpdate={handleUpdateStatus}
      />
    </div>
  );
}
