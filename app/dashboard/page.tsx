"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Briefcase,
  MapPin,
  ArrowRight,
  AlertCircle,
  Star,
  Check,
  ChevronRight,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getStudentProfile,
  getMatchesForStudent,
  generateMatchesForStudent,
  applyToRole,
  getApplicationDataFromMatch,
} from "@/lib/database";
import type { StudentProfile, MatchWithDetails } from "@/lib/types";
import { ApplyModal, type ApplicationFormData } from "@/components/apply-modal";
import { toast } from "sonner";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Tabs: "recommendations" | "applications"
  const [activeTab, setActiveTab] = useState<"recommendations" | "applications">("recommendations");
  const [statusFilter, setStatusFilter] = useState("all");

  // Application Modal state
  const [selectedMatchForApply, setSelectedMatchForApply] = useState<MatchWithDetails | null>(null);
  // View submission modal state
  const [viewingSubmission, setViewingSubmission] = useState<MatchWithDetails | null>(null);
  // Expanded fit explanations
  const [expandedFits, setExpandedFits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile) {
      router.push("/login");
      return;
    }
    if (profile.role !== "student") {
      router.push("/recruiter");
      return;
    }
    loadDashboard();
  }, [user, profile, authLoading]);

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const sp = await getStudentProfile(user.$id);
      setStudentProfile(sp);
      if (sp) {
        let m = await getMatchesForStudent(sp.$id);
        if (m.length === 0) {
          await generateMatchesForStudent(sp.$id);
          m = await getMatchesForStudent(sp.$id);
        }
        setMatches(m);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMatches = async () => {
    if (!studentProfile) return;
    setIsRefreshing(true);
    try {
      await generateMatchesForStudent(studentProfile.$id);
      const m = await getMatchesForStudent(studentProfile.$id);
      setMatches(m);
      toast.success("Recommendations refreshed with latest roles!");
    } catch (err) {
      console.error("Error refreshing matches:", err);
      toast.error("Failed to refresh matches.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApplySubmit = async (formData: ApplicationFormData) => {
    if (!studentProfile || !selectedMatchForApply || !selectedMatchForApply.role) return;
    try {
      await applyToRole(
        studentProfile.$id,
        selectedMatchForApply.role.$id,
        formData
      );
      toast.success(`Application submitted for ${selectedMatchForApply.role.title}!`);

      // Trigger transactional confirmation email via Resend
      fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "application_submitted",
          payload: {
            studentEmail: profile?.email || user?.email,
            studentName: profile?.name || "Candidate",
            roleTitle: selectedMatchForApply.role.title,
            companyName: selectedMatchForApply.recruiterProfile?.companyName || "Employer",
            earliestStartDate: formData.earliestStartDate,
            roleId: selectedMatchForApply.role.$id,
            matchScore: selectedMatchForApply.matchScore,
            pitchSnippet: formData.coverNote ? formData.coverNote.slice(0, 160) : undefined,
            degree: studentProfile.degree,
            institution: studentProfile.institution,
          },
        }),
      }).catch(console.error);

      setSelectedMatchForApply(null);
      // Reload matches
      const m = await getMatchesForStudent(studentProfile.$id);
      setMatches(m);
    } catch (err) {
      console.error("Error submitting application:", err);
      toast.error("Failed to submit application. Please try again.");
    }
  };

  const toggleFit = (matchId: string) => {
    setExpandedFits((prev) => ({
      ...prev,
      [matchId]: !prev[matchId],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading RippleMatch recommendations...</p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="max-w-lg mx-auto my-20 px-6">
        <div className="editorial-card p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <User className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-display font-semibold text-foreground">
            Complete Your Profile
          </h2>
          <p className="text-sm text-muted-foreground">
            Build your profile to unlock AI matching and 1-click tailored applications.
          </p>
          <Link href="/profile">
            <Button className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md">
              Build Profile <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const completeness = studentProfile.profileCompleteness ?? 0;

  // Split matches into applications and recommendations
  const applications = matches.filter((m) => getApplicationDataFromMatch(m).isApplied);
  const recommendations = matches; // All matched roles

  const filteredMatches = (activeTab === "applications" ? applications : recommendations).filter((m) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "applied") return getApplicationDataFromMatch(m).isApplied;
    if (statusFilter === "high") return m.matchScore >= 80;
    return m.status === statusFilter;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="page-header page-header-dark p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="tag tag-yellow text-[10px] mb-2 inline-flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3" /> RippleMatch Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-white">
            Welcome back, {profile?.name || "Student"}
          </h1>
          <p className="text-sm text-white/70 mt-1">
            {studentProfile.degree || "Student"} · {studentProfile.institution || "University"}
            {studentProfile.location ? ` · ${studentProfile.location}` : ""}
          </p>
        </div>
        <div className="editorial-card p-4 w-full md:w-56 space-y-2 bg-card/90">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Profile Match Power</span>
            <span className="text-foreground">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2" />
          <div className="flex justify-between items-center pt-1">
            <span className="text-[10px] text-muted-foreground">
              {completeness >= 80 ? "✨ Highly competitive" : "Complete to boost matches"}
            </span>
            <Link
              href="/profile"
              className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-0.5"
            >
              Update <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="editorial-card p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Curated Matches
          </p>
          <p className="text-2xl font-display font-semibold text-foreground mt-1">
            {matches.length}
          </p>
        </div>
        <div className="editorial-card p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Submitted Applications
          </p>
          <p className="text-2xl font-display font-semibold text-primary mt-1">
            {applications.length}
          </p>
        </div>
        <div className="editorial-card p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Shortlisted
          </p>
          <p className="text-2xl font-display font-semibold text-emerald-500 mt-1">
            {matches.filter((m) => m.status === "shortlisted").length}
          </p>
        </div>
        <div className="editorial-card p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
            Interview Outreaches
          </p>
          <p className="text-2xl font-display font-semibold text-blue-500 mt-1">
            {matches.filter((m) => m.status === "contacted").length}
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Recommended Matches vs My Applications) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("recommendations");
              setStatusFilter("all");
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "recommendations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended For You ({recommendations.length})
          </button>
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
            <Send className="w-3.5 h-3.5" />
            My Applications ({applications.length})
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeTab === "recommendations" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshMatches}
              disabled={isRefreshing}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw
                className={`w-3 h-3 mr-1.5 ${isRefreshing ? "animate-spin text-primary" : ""}`}
              />
              {isRefreshing ? "Recalculating..." : "Refresh Feed"}
            </Button>
          )}

          {activeTab === "recommendations" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 rounded-lg border text-xs bg-background font-medium focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="all">All Match Scores</option>
              <option value="high">High Compatibility (80%+)</option>
              <option value="applied">Already Applied</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredMatches.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-display font-semibold text-foreground">
            {activeTab === "applications"
              ? "No applications submitted yet"
              : "No matches found with this filter"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {activeTab === "applications"
              ? "Browse your curated recommendations and click 'Apply Now' to submit a tailored application to top companies."
              : "Try adjusting your filter or click 'Refresh Feed' to recalculate matches against newly posted roles."}
          </p>
          {activeTab === "applications" && (
            <Button
              size="sm"
              onClick={() => setActiveTab("recommendations")}
              className="bg-primary text-primary-foreground text-xs mt-2"
            >
              Explore Recommended Roles
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const appData = getApplicationDataFromMatch(match);
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
            const isFitExpanded = expandedFits[match.$id] ?? false;

            return (
              <div
                key={match.$id}
                className={`editorial-card p-5 transition-all hover:border-primary/40 ${
                  match.matchScore >= 80 ? "border-primary/25" : ""
                } ${isApplied ? "bg-muted/10" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Column: Role Details & Match Badge */}
                  <div className="flex-1 space-y-2.5">
                    {/* Badge Header */}
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
                        <Star className="w-3 h-3" /> {match.matchScore}% Match
                      </span>

                      {isApplied ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Applied {appliedDate ? `on ${appliedDate}` : ""}
                        </span>
                      ) : null}

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
                        {match.status === "contacted"
                          ? "Interview Invited"
                          : match.status === "shortlisted"
                          ? "Shortlisted by Recruiter"
                          : match.status === "rejected"
                          ? "Not Selected"
                          : isApplied
                          ? "Under Review"
                          : "New Match"}
                      </span>

                      {match.role?.employmentType && (
                        <span className="tag tag-outline text-[10px] capitalize">
                          {match.role.employmentType}
                        </span>
                      )}
                    </div>

                    {/* Title & Company */}
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground">
                        {match.role?.title || "Role Opportunity"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                        {match.recruiterProfile?.companyName && (
                          <span className="flex items-center gap-1 font-semibold text-foreground">
                            <Building2 className="w-3.5 h-3.5 text-primary" />
                            {match.recruiterProfile.companyName}
                          </span>
                        )}
                        {match.role?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {match.role.location}
                          </span>
                        )}
                        {match.role?.workMode && (
                          <span className="capitalize px-1.5 py-0.5 rounded bg-muted/60 text-[11px]">
                            {match.role.workMode}
                          </span>
                        )}
                        {match.role?.salaryRange && (
                          <span className="font-medium text-foreground">
                            {match.role.salaryRange}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RippleMatch Compatibility Breakdown */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-primary" /> Why you're a great fit:
                        </span>
                        <button
                          onClick={() => toggleFit(match.$id)}
                          className="text-[11px] text-primary hover:underline flex items-center gap-0.5"
                        >
                          {isFitExpanded ? "Show less" : "Details"}
                          {isFitExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Overlapping skills */}
                      {match.skillOverlap && match.skillOverlap.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {match.skillOverlap.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-md border border-primary/20"
                            >
                              <Check className="w-2.5 h-2.5" /> {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Expandable reasons */}
                      {isFitExpanded && cleanReasons.length > 0 && (
                        <div className="mt-2.5 p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1.5 text-xs text-muted-foreground">
                          {cleanReasons.map((reason, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                          {match.role?.description && (
                            <div className="pt-2 border-t border-border/40">
                              <span className="text-[11px] font-semibold text-foreground block mb-1">
                                Role Overview:
                              </span>
                              <p className="text-[11px] line-clamp-3 text-muted-foreground">
                                {match.role.description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions (Apply Now / View Application) */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-2 md:pt-0 shrink-0">
                    {isApplied ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingSubmission(match)}
                          className="text-xs h-8 px-3 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Submission
                        </Button>
                        <span className="text-[10px] text-muted-foreground">
                          Application Active
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedMatchForApply(match)}
                        className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] text-xs font-semibold h-9 px-4 rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Apply Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      {selectedMatchForApply && selectedMatchForApply.role && studentProfile && profile && (
        <ApplyModal
          isOpen={!!selectedMatchForApply}
          onClose={() => setSelectedMatchForApply(null)}
          role={selectedMatchForApply.role}
          studentProfile={studentProfile}
          profile={profile}
          matchScore={selectedMatchForApply.matchScore}
          recruiterCompanyName={selectedMatchForApply.recruiterProfile?.companyName}
          onSubmit={handleApplySubmit}
        />
      )}

      {/* View Submitted Application Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Your Application Submission
                </h3>
                <p className="text-xs text-muted-foreground">
                  {viewingSubmission.role?.title} at{" "}
                  {viewingSubmission.recruiterProfile?.companyName || "Company"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingSubmission(null)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>

            {(() => {
              const app = getApplicationDataFromMatch(viewingSubmission);
              const details = app.applicationDetails;
              return (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                    <span className="text-muted-foreground font-semibold">
                      Your Elevator Pitch:
                    </span>
                    <p className="text-foreground whitespace-pre-wrap">
                      {details?.coverNote || "No note provided."}
                    </p>
                  </div>

                  {details?.relevantExperience && (
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                      <span className="text-muted-foreground font-semibold">
                        Relevant Coursework & Projects:
                      </span>
                      <p className="text-foreground whitespace-pre-wrap">
                        {details.relevantExperience}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-semibold text-foreground">
                        {details?.earliestStartDate || "Flexible"}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border">
                      <span className="text-muted-foreground">Work Authorization:</span>
                      <p className="font-semibold text-foreground">
                        {details?.workAuthorization || "Authorized"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-muted-foreground text-[11px]">
                    <span>
                      Status:{" "}
                      <strong className="text-foreground capitalize">
                        {viewingSubmission.status}
                      </strong>
                    </span>
                    <span>Applied on {app.appliedDate?.split("T")[0] || "Recent"}</span>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingSubmission(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
