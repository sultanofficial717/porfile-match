"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  ExternalLink,
  FileText,
  Mail,
  Calendar,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  getRecruiterProfile,
  getRoles,
  getMatchesForRole,
  updateMatchStatus,
  generateMatchesForRole,
  getApplicationDataFromMatch,
} from "@/lib/database";
import type { Role, MatchWithDetails, MatchStatus } from "@/lib/types";
import { ApplicationDossierModal } from "@/components/application-dossier-modal";
import { toast } from "sonner";

export default function RecruiterCandidatesPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tabs: "applications" | "prospects"
  const [activePipelineTab, setActivePipelineTab] = useState<"applications" | "prospects">("applications");
  const [stageFilter, setStageFilter] = useState("all");

  // Selected candidate dossier modal
  const [dossierMatch, setDossierMatch] = useState<MatchWithDetails | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile || profile.role !== "recruiter") {
      router.push("/login");
      return;
    }
    loadRecruiterRoles();
  }, [user, profile, authLoading]);

  const loadRecruiterRoles = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const rp = await getRecruiterProfile(user.$id);
      if (!rp) {
        router.push("/recruiter/setup");
        return;
      }
      const r = await getRoles(rp.$id);
      setRoles(r);
      if (r.length > 0) {
        setSelectedRoleId(r[0].$id);
        await loadCandidatesForRole(r[0].$id);
      }
    } catch (err) {
      console.error("Error loading roles:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidatesForRole = async (roleId: string) => {
    try {
      let m = await getMatchesForRole(roleId);
      if (m.length === 0) {
        await generateMatchesForRole(roleId);
        m = await getMatchesForRole(roleId);
      }
      setMatches(m);
    } catch (err) {
      console.error("Error loading candidates:", err);
    }
  };

  const handleRoleChange = async (roleId: string) => {
    setSelectedRoleId(roleId);
    setLoading(true);
    await loadCandidatesForRole(roleId);
    setLoading(false);
  };

  const handleRefresh = async () => {
    if (!selectedRoleId) return;
    setIsRefreshing(true);
    try {
      await generateMatchesForRole(selectedRoleId);
      const m = await getMatchesForRole(selectedRoleId);
      setMatches(m);
      toast.success("Candidate pool refreshed!");
    } catch (err) {
      console.error("Error refreshing matches:", err);
      toast.error("Failed to refresh candidates.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (matchId: string, status: MatchStatus) => {
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
              roleTitle: selectedRole?.title || "Role",
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

  if (authLoading || (loading && roles.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const selectedRole = roles.find((r) => r.$id === selectedRoleId);

  // Partition candidates into submitted applications vs matched prospects
  const appliedCandidates = matches.filter((m) => getApplicationDataFromMatch(m).isApplied);
  const matchedProspects = matches.filter((m) => !getApplicationDataFromMatch(m).isApplied);

  const currentList = activePipelineTab === "applications" ? appliedCandidates : matchedProspects;

  const filteredCandidates = currentList.filter((m) => {
    if (stageFilter === "all") return true;
    return m.status === stageFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="page-header page-header-dark p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <span className="tag tag-yellow text-[10px] mb-2 inline-flex items-center gap-1 font-semibold">
            <Users className="w-3 h-3" /> ATS Pipeline & Candidate Matching
          </span>
          <h1 className="text-2xl font-display font-semibold text-white">Candidates & Applications</h1>
          <p className="text-xs text-white/60">
            Review detailed student applications and discover high-compatibility matched candidates.
          </p>
        </div>
        <Link href="/recruiter/roles/new">
          <Button className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] text-xs font-semibold rounded-md">
            + Post New Role
          </Button>
        </Link>
      </div>

      {roles.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-display font-semibold">No Roles Posted Yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Post an open opportunity to start receiving candidate applications and automated matches.
          </p>
          <Link href="/recruiter/roles/new">
            <Button size="sm" className="bg-primary text-primary-foreground text-xs mt-2">
              Post Your First Role
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Role Selector & Top Controls */}
          <div className="editorial-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <label className="text-xs font-semibold text-muted-foreground shrink-0">
                Active Role:
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full sm:w-80 px-3 py-1.5 rounded-md border text-xs bg-background font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                {roles.map((r) => (
                  <option key={r.$id} value={r.$id}>
                    {r.title} ({r.location || "Remote"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs h-8 flex items-center gap-1.5"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
                />
                <span>{isRefreshing ? "Matching..." : "Refresh Pipeline"}</span>
              </Button>
              {selectedRoleId && (
                <Link href={`/recruiter/roles/${selectedRoleId}`}>
                  <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                    Edit Role <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Subtabs: Applications vs Matched Prospects */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActivePipelineTab("applications");
                  setStageFilter("all");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activePipelineTab === "applications"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Inbox className="w-3.5 h-3.5" />
                Submitted Applications ({appliedCandidates.length})
              </button>
              <button
                onClick={() => {
                  setActivePipelineTab("prospects");
                  setStageFilter("all");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activePipelineTab === "prospects"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Matched Talent Pool ({matchedProspects.length})
              </button>
            </div>

            {/* Stage filter dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md border text-xs bg-background font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Stages</option>
                <option value="new">New</option>
                <option value="viewed">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="contacted">Contacted / Interview</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidate List */}
          {loading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="editorial-card p-12 text-center space-y-2">
              <Users className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="text-sm font-semibold text-foreground">
                {activePipelineTab === "applications"
                  ? "No candidate applications received yet"
                  : "No matched candidates found"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {activePipelineTab === "applications"
                  ? "Students who browse your open position and submit their application will appear here with full answers and pitch."
                  : "Click 'Refresh Pipeline' to run algorithm matching against newly registered students."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map((match) => {
                const appData = getApplicationDataFromMatch(match);
                const details = appData.applicationDetails;
                const isApplied = appData.isApplied;
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
                    className={`editorial-card p-5 space-y-3.5 transition-all hover:border-primary/40 ${
                      isApplied ? "border-emerald-500/25 bg-emerald-500/[0.01]" : ""
                    }`}
                  >
                    {/* Top Row: Candidate Identity & Stage Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold text-foreground">
                            {match.profile?.name || "Student Candidate"}
                          </h4>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                            <Star className="w-3 h-3" /> {match.matchScore}% Match
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

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            {match.studentProfile?.degree || "Student"} ·{" "}
                            {match.studentProfile?.institution || "University"}
                          </span>
                          {match.studentProfile?.gpa && (
                            <span>GPA: {match.studentProfile.gpa.toFixed(2)}</span>
                          )}
                          {match.studentProfile?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {match.studentProfile.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pipeline Stage Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDossierMatch(match)}
                          className="text-xs h-8 px-2.5 bg-muted/30 hover:bg-muted"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1 text-primary" />
                          View Dossier
                        </Button>
                        <Button
                          size="sm"
                          variant={match.status === "shortlisted" ? "default" : "outline"}
                          onClick={() => handleStatusUpdate(match.$id, "shortlisted")}
                          className={`text-xs h-8 px-2.5 ${
                            match.status === "shortlisted" ? "bg-emerald-600 text-white" : ""
                          }`}
                        >
                          Shortlist
                        </Button>
                        <Button
                          size="sm"
                          variant={match.status === "contacted" ? "default" : "outline"}
                          onClick={() => handleStatusUpdate(match.$id, "contacted")}
                          className={`text-xs h-8 px-2.5 ${
                            match.status === "contacted" ? "bg-blue-600 text-white" : ""
                          }`}
                        >
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(match.$id, "rejected")}
                          className="text-xs h-8 px-2 text-muted-foreground hover:text-destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Application Pitch Preview (if applied) */}
                    {details?.coverNote && (
                      <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                        <span className="font-semibold text-muted-foreground flex items-center gap-1">
                          <FileText className="w-3 h-3 text-primary" /> Candidate Elevator Pitch:
                        </span>
                        <p className="text-foreground line-clamp-2 italic leading-relaxed">
                          &ldquo;{details.coverNote}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Matched Skills */}
                    {match.skillOverlap && match.skillOverlap.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                          Matched Skills:
                        </span>
                        {match.skillOverlap.map((s) => (
                          <span key={s} className="tag tag-yellow text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Compatibility explanations */}
                    {cleanReasons.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                        {cleanReasons.map((reason, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Candidate Application Dossier Modal */}
      <ApplicationDossierModal
        isOpen={!!dossierMatch}
        onClose={() => setDossierMatch(null)}
        match={dossierMatch}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
