"use client";

import React from "react";
import {
  X,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Calendar,
  ShieldCheck,
  Globe,
  Phone,
  Mail,
  FileText,
  Star,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MatchWithDetails, MatchStatus } from "@/lib/types";
import { getApplicationDataFromMatch, getFilePreviewUrl } from "@/lib/database";

interface ApplicationDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchWithDetails | null;
  onStatusUpdate: (matchId: string, status: MatchStatus) => Promise<void>;
}

export function ApplicationDossierModal({
  isOpen,
  onClose,
  match,
  onStatusUpdate,
}: ApplicationDossierModalProps) {
  if (!isOpen || !match) return null;

  const appData = getApplicationDataFromMatch(match);
  const details = appData.applicationDetails;
  const student = match.studentProfile;
  const userProfile = match.profile;
  const role = match.role;

  const appliedDate = appData.appliedDate
    ? new Date(appData.appliedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              {userProfile?.name?.charAt(0) || "C"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {userProfile?.name || "Applicant Dossier"}
                </h3>
                {match.matchScore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    <Star className="w-3 h-3" /> {match.matchScore}% Match
                  </span>
                )}
                {appData.isApplied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Applied Candidate
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    <Sparkles className="w-3 h-3" /> Matched Prospect
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Applying for <span className="font-medium text-foreground">{role?.title || "Role"}</span>
                {appliedDate && ` · Submitted on ${appliedDate}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Action Bar for Pipeline Stage */}
          <div className="p-4 rounded-lg bg-muted/40 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Pipeline Stage
              </span>
              <p className="text-sm font-medium capitalize flex items-center gap-1.5 text-foreground">
                <span
                  className={`w-2 h-2 rounded-full ${
                    match.status === "shortlisted"
                      ? "bg-emerald-500"
                      : match.status === "contacted"
                      ? "bg-blue-500"
                      : match.status === "rejected"
                      ? "bg-rose-500"
                      : "bg-amber-500"
                  }`}
                />
                {match.status}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={match.status === "shortlisted" ? "default" : "outline"}
                className={`text-xs h-8 ${
                  match.status === "shortlisted"
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "border-border text-foreground hover:bg-emerald-500/10"
                }`}
                onClick={() => onStatusUpdate(match.$id, "shortlisted")}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Shortlist Candidate
              </Button>
              <Button
                size="sm"
                variant={match.status === "contacted" ? "default" : "outline"}
                className={`text-xs h-8 ${
                  match.status === "contacted"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "border-border text-foreground hover:bg-blue-500/10"
                }`}
                onClick={() => onStatusUpdate(match.$id, "contacted")}
              >
                <Mail className="w-3.5 h-3.5 mr-1" />
                Contact / Invite
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10"
                onClick={() => onStatusUpdate(match.$id, "rejected")}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Reject
              </Button>
            </div>
          </div>

          {/* Submitted Application Details (if student submitted form) */}
          {details ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Application Submission Answers
              </h4>

              <div className="space-y-3">
                {/* Elevator Pitch */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Elevator Pitch & Why Good Fit:
                  </span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {details.coverNote || "No cover note provided."}
                  </p>
                </div>

                {/* Relevant Experience / Coursework */}
                {details.relevantExperience && (
                  <div className="p-4 rounded-lg bg-card border border-border space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Relevant Coursework, Projects & Technical Background:
                    </span>
                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                      {details.relevantExperience}
                    </p>
                  </div>
                )}

                {/* Meta details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> Earliest Start Date
                    </span>
                    <p className="font-medium text-foreground">
                      {details.earliestStartDate
                        ? new Date(details.earliestStartDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Immediate"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Work Authorization
                    </span>
                    <p className="font-medium text-foreground">{details.workAuthorization || "Authorized"}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" /> Preferred Work Mode
                    </span>
                    <p className="font-medium text-foreground capitalize">
                      {details.preferredWorkMode || "Any"}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" /> Contact Phone
                    </span>
                    <p className="font-medium text-foreground">{details.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                {details.portfolioOrGithub && (
                  <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" /> Portfolio / Repository Link
                    </span>
                    <a
                      href={
                        details.portfolioOrGithub.startsWith("http")
                          ? details.portfolioOrGithub
                          : `https://${details.portfolioOrGithub}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      {details.portfolioOrGithub} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border text-center space-y-1">
              <Clock className="w-5 h-5 text-muted-foreground mx-auto" />
              <p className="text-xs font-semibold text-foreground">Matched Profile (No Direct Form Submitted Yet)</p>
              <p className="text-xs text-muted-foreground">
                This candidate was automatically matched by the RippleMatch recommendation engine based on profile fit.
              </p>
            </div>
          )}

          {/* Academic & Profile Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Candidate Background & Credentials
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-muted-foreground">Institution & Degree</span>
                <p className="font-medium text-foreground">
                  {student?.degree || "Student"} · {student?.institution || "University"}
                </p>
                {student?.fieldOfStudy && (
                  <p className="text-muted-foreground text-[11px]">{student.fieldOfStudy}</p>
                )}
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-muted-foreground">GPA & Graduation</span>
                <p className="font-medium text-foreground">
                  GPA: {student?.gpa ? student.gpa.toFixed(2) : "N/A"} · Class of{" "}
                  {student?.graduationYear || "Upcoming"}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-muted-foreground">Location & Mobility</span>
                <p className="font-medium text-foreground">{student?.location || "Not specified"}</p>
                <p className="text-muted-foreground text-[11px]">
                  Preference: {student?.locationPreference || "Flexible"} ({student?.workMode || "any"})
                </p>
              </div>

              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <span className="text-muted-foreground">Direct Contact</span>
                <p className="font-medium text-foreground">{userProfile?.email || "No email"}</p>
                {student?.phone && (
                  <p className="text-muted-foreground text-[11px]">Phone: {student.phone}</p>
                )}
              </div>
            </div>

            {/* Skills & Match Overlap */}
            <div className="p-4 rounded-lg bg-card border border-border space-y-2">
              <span className="text-xs font-semibold text-muted-foreground">Candidate Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {(student?.skills || []).map((skill) => {
                  const isOverlap = (match.skillOverlap || []).some(
                    (s) => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`text-xs px-2.5 py-0.5 rounded-md font-medium ${
                        isOverlap
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {skill} {isOverlap && "✓"}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Resume Link */}
            {student?.resumeFileId && (
              <div className="pt-2">
                <a
                  href={getFilePreviewUrl(student.resumeFileId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <FileText className="w-4 h-4" /> View Full Resume Document <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-4 bg-card/95 backdrop-blur border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Dossier
          </Button>
        </div>
      </div>
    </div>
  );
}
