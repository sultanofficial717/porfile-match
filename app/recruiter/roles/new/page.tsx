"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Save, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getRecruiterProfile, createRole } from "@/lib/database";
import type { RecruiterProfile } from "@/lib/types";

const SKILLS_LIST = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
  "GCP", "Machine Learning", "Data Science", "REST APIs", "GraphQL",
  "Git", "Linux", "Figma", "Tailwind CSS",
];

export default function NewRolePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [description, setDescription] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [workMode, setWorkMode] = useState("remote");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile || profile.role !== "recruiter") {
      router.push("/login");
      return;
    }
    loadRecruiterProfile();
  }, [user, profile, authLoading]);

  const loadRecruiterProfile = async () => {
    if (!user) return;
    const rp = await getRecruiterProfile(user.$id);
    setRecruiterProfile(rp);
    if (!rp) router.push("/recruiter/setup");
    setLoading(false);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    if (!user || !recruiterProfile || !title.trim()) {
      setError("Role title is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createRole(
        {
          recruiterProfileId: recruiterProfile.$id,
          title,
          requiredSkills: selectedSkills,
          experienceLevel: experienceLevel as any,
          location: location || undefined,
          employmentType: employmentType as any,
          description: description || undefined,
          salaryRange: salaryRange || undefined,
          workMode: workMode as any,
        },
        user.$id
      );
      router.push("/recruiter");
    } catch (err: any) {
      setError(err.message || "Failed to create role.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      <Link href="/recruiter" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
      </Link>

      <div className="editorial-card p-8 space-y-5">
        <div>
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center mb-4">
            <Briefcase className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Post a Role</h1>
          <p className="text-sm text-muted-foreground mt-1">Define the role and required skills. Candidates will be matched automatically.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Role Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Engineer" className="rounded-md" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and ideal candidate..." className="rounded-md" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className="rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Salary Range</Label>
              <Input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="$120K - $160K" className="rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <div className="flex flex-wrap gap-1.5">
                {["full-time", "part-time", "contract", "internship"].map((t) => (
                  <button key={t} type="button" onClick={() => setEmploymentType(t)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                      employmentType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                    }`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Experience Level</Label>
              <div className="flex flex-wrap gap-1.5">
                {["entry", "mid", "senior", "any"].map((l) => (
                  <button key={l} type="button" onClick={() => setExperienceLevel(l)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                      experienceLevel === l ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                    }`}>{l}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Work Mode</Label>
              <div className="flex flex-wrap gap-1.5">
                {["remote", "hybrid", "onsite"].map((m) => (
                  <button key={m} type="button" onClick={() => setWorkMode(m)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                      workMode === m ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border"
                    }`}>{m}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Required Skills</Label>
            <p className="text-[10px] text-muted-foreground">Select skills candidates should have. Used for match scoring.</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_LIST.map((skill) => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                    selectedSkills.includes(skill) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}>{skill}</button>
              ))}
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md">
          <Save className="w-4 h-4 mr-1.5" /> {saving ? "Publishing..." : "Publish Role"}
        </Button>
      </div>
    </div>
  );
}
