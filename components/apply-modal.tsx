"use client";

import React, { useState } from "react";
import {
  Briefcase,
  User,
  GraduationCap,
  Calendar,
  FileText,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Star,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Role, StudentProfile, Profile, MatchWithDetails, WorkMode } from "@/lib/types";
import { toast } from "sonner";

export interface ApplicationFormData {
  coverNote: string;
  relevantExperience: string;
  earliestStartDate: string;
  workAuthorization: string;
  preferredWorkMode: string;
  portfolioOrGithub: string;
  phoneNumber: string;
  additionalComments?: string;
}

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role;
  studentProfile: StudentProfile;
  profile: Profile;
  matchScore?: number;
  recruiterCompanyName?: string;
  onSubmit: (formData: ApplicationFormData) => Promise<void>;
}

export function ApplyModal({
  isOpen,
  onClose,
  role,
  studentProfile,
  profile,
  matchScore,
  recruiterCompanyName,
  onSubmit,
}: ApplyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [coverNote, setCoverNote] = useState("");
  const [relevantExperience, setRelevantExperience] = useState("");
  const [earliestStartDate, setEarliestStartDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
  );
  const [workAuthorization, setWorkAuthorization] = useState("Citizen / Permanent Resident");
  const [preferredWorkMode, setPreferredWorkMode] = useState<WorkMode>(role.workMode || "any");
  const [portfolioOrGithub, setPortfolioOrGithub] = useState(
    studentProfile.githubUrl || studentProfile.portfolioUrl || studentProfile.linkedinUrl || ""
  );
  const [phoneNumber, setPhoneNumber] = useState(studentProfile.phone || profile.phone || "");
  const [additionalComments, setAdditionalComments] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverNote.trim() || coverNote.length < 20) {
      toast.error("Please provide a cover note explaining why you're a good fit (at least 20 chars).");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        coverNote,
        relevantExperience,
        earliestStartDate,
        workAuthorization,
        preferredWorkMode,
        portfolioOrGithub,
        phoneNumber,
        additionalComments,
      });
      toast.success("Application submitted successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-muted/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Application Form
              </span>
              {matchScore !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <Star className="w-3 h-3" /> {matchScore}% Match
                </span>
              )}
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Apply to {role.title}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                {recruiterCompanyName || "Hiring Company"}
              </span>
              {role.location && (
                <>
                  <span>·</span>
                  <MapPin className="w-3 h-3" />
                  <span>{role.location}</span>
                </>
              )}
              {role.employmentType && (
                <>
                  <span>·</span>
                  <span className="capitalize">{role.employmentType}</span>
                </>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-3 pb-2 border-b bg-card flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`pb-1 border-b-2 transition-colors ${
              step === 1 ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            1. Verified Profile Data
          </button>
          <button
            onClick={() => setStep(2)}
            className={`pb-1 border-b-2 transition-colors ${
              step === 2 ? "border-primary text-primary" : "border-transparent text-muted-foreground"
            }`}
          >
            2. Role Questions & Pitch
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-2 text-xs">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  RippleMatch Auto-Verified Candidate Dossier
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  The recruiter will receive this verified snapshot from your profile alongside your role answers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <p className="text-sm font-semibold">{profile.name || "Student"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm font-semibold">{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">University / Institution</Label>
                  <p className="text-sm font-semibold">{studentProfile.institution || "—"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Degree & GPA</Label>
                  <p className="text-sm font-semibold">
                    {studentProfile.degree || "—"} {studentProfile.gpa ? `(GPA: ${studentProfile.gpa.toFixed(2)})` : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <Label className="text-xs">Contact Phone Number *</Label>
                <Input
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Portfolio / GitHub / LinkedIn URL</Label>
                <Input
                  value={portfolioOrGithub}
                  onChange={(e) => setPortfolioOrGithub(e.target.value)}
                  placeholder="https://github.com/yourhandle"
                  className="rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1 pt-1">
                <Label className="text-xs text-muted-foreground">Key Skills Included in Profile</Label>
                <div className="flex flex-wrap gap-1">
                  {studentProfile.skills && studentProfile.skills.length > 0 ? (
                    studentProfile.skills.map((skill) => (
                      <span key={skill} className="tag tag-yellow text-[10px]">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-primary text-primary-foreground text-xs font-semibold px-4"
                >
                  Continue to Role Pitch →
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    Elevator Pitch / Why You Fit This Role *
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Min 20 characters</span>
                </div>
                <Textarea
                  required
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Highlight why your skills and background make you excited and equipped to excel at this position..."
                  className="rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  Relevant Coursework or Project Highlights
                </Label>
                <Textarea
                  rows={3}
                  value={relevantExperience}
                  onChange={(e) => setRelevantExperience(e.target.value)}
                  placeholder="Mention 1-2 projects, internships, or courses specifically relevant to this job description..."
                  className="rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Earliest Start Date</Label>
                  <Input
                    type="date"
                    value={earliestStartDate}
                    onChange={(e) => setEarliestStartDate(e.target.value)}
                    className="rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Work Authorization</Label>
                  <select
                    value={workAuthorization}
                    onChange={(e) => setWorkAuthorization(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-xs bg-background font-medium focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="Citizen / Permanent Resident">Citizen / Permanent Resident</option>
                    <option value="Needs Visa Sponsorship">Will require sponsorship (F-1 OPT / H-1B)</option>
                    <option value="Authorized to work without restriction">Authorized to work without restriction</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Work Mode Preference</Label>
                <div className="flex gap-2">
                  {(["remote", "hybrid", "onsite", "any"] as WorkMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setPreferredWorkMode(mode)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition-colors ${
                        preferredWorkMode === mode
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Additional Notes / Questions for Recruiter (Optional)</Label>
                <Input
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="e.g. Willing to relocate, graduating in May..."
                  className="rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-xs text-muted-foreground"
                >
                  ← Back to Profile Snapshot
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground text-xs font-semibold px-5 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Submitting Application..." : "Submit Application"}</span>
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
