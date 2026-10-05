"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Save,
  ArrowLeft,
  Users,
  Check,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { getRole, updateRole } from "@/lib/database";
import type { Role } from "@/lib/types";
import { toast } from "sonner";

const SKILLS_LIST = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust",
  "React", "Next.js", "Vue", "Angular", "Node.js", "Express",
  "PostgreSQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS",
  "GCP", "Machine Learning", "Data Science", "REST APIs", "GraphQL",
  "Git", "Linux", "Figma", "Tailwind CSS",
];

export default function RoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = use(params);
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [employmentType, setEmploymentType] = useState("full-time");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [workMode, setWorkMode] = useState("remote");
  const [isActive, setIsActive] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !profile || profile.role !== "recruiter") {
      router.push("/login");
      return;
    }
    loadRole();
  }, [user, profile, authLoading, roleId]);

  const loadRole = async () => {
    setLoading(true);
    try {
      const r = await getRole(roleId);
      if (!r) {
        toast.error("Role not found");
        router.push("/recruiter");
        return;
      }
      setRole(r);
      setTitle(r.title || "");
      setDescription(r.description || "");
      setLocation(r.location || "");
      setSalaryRange(r.salaryRange || "");
      setEmploymentType(r.employmentType || "full-time");
      setExperienceLevel(r.experienceLevel || "entry");
      setWorkMode(r.workMode || "remote");
      setIsActive(r.isActive !== false);
      setSelectedSkills(r.requiredSkills || []);
    } catch (err) {
      console.error("Error loading role:", err);
      toast.error("Failed to load role details");
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Role title cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateRole(roleId, {
        title,
        description,
        location,
        salaryRange,
        employmentType: employmentType as any,
        experienceLevel: experienceLevel as any,
        workMode: workMode as any,
        isActive,
        requiredSkills: selectedSkills,
      });
      toast.success("Role updated successfully!");
      router.push("/recruiter");
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
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
    <div className="max-w-[720px] mx-auto px-6 sm:px-10 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/recruiter"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <Link href={`/recruiter/roles/${roleId}/candidates`}>
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Review Candidates
          </Button>
        </Link>
      </div>

      <div className="editorial-card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="tag tag-yellow text-[10px] mb-2 inline-block">Role Management</span>
            <h1 className="text-2xl font-display font-semibold text-foreground">Edit Role</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update role requirements, skills, or status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              isActive
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4" />}
            <span>{isActive ? "Active (Receiving Matches)" : "Closed (Archived)"}</span>
          </button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Role Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              className="rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Role responsibilities and qualifications..."
              className="rounded-md"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Location</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Salary / Stipend Range</Label>
              <Input
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                placeholder="$100k - $130k"
                className="rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <div className="flex flex-wrap gap-1.5">
                {["full-time", "part-time", "contract", "internship"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEmploymentType(t)}
                    className={`px-2 py-1 rounded text-[10px] font-medium border capitalize ${
                      employmentType === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Experience Level</Label>
              <div className="flex flex-wrap gap-1.5">
                {["entry", "mid", "senior", "any"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setExperienceLevel(l)}
                    className={`px-2 py-1 rounded text-[10px] font-medium border capitalize ${
                      experienceLevel === l
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Work Mode</Label>
              <div className="flex flex-wrap gap-1.5">
                {["remote", "hybrid", "onsite"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setWorkMode(m)}
                    className={`px-2 py-1 rounded text-[10px] font-medium border capitalize ${
                      workMode === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Required Skills ({selectedSkills.length} selected)</Label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_LIST.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
        >
          <Save className="w-4 h-4 mr-1.5" />
          {saving ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
