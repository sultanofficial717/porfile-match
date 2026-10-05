"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Save, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { upsertRecruiterProfile } from "@/lib/database";

export default function RecruiterSetupPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [location, setLocation] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!user || !companyName.trim()) {
      setError("Company name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await upsertRecruiterProfile(user.$id, {
        companyName,
        industry: industry || undefined,
        companySize: companySize || undefined,
        location: location || undefined,
        companyDescription: companyDescription || undefined,
        website: website || undefined,
      });
      router.push("/recruiter");
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 sm:px-10 py-12">
      <div className="editorial-card p-8 space-y-5">
        <div>
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center mb-4">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-foreground">Company Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">Set up your company profile to start posting roles.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Company Name *</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" className="rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Technology" className="rounded-md" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company Size</Label>
              <Input value={companySize} onChange={(e) => setCompanySize(e.target.value)} placeholder="50-200" className="rounded-md" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Website</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" className="rounded-md" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Company Description</Label>
            <Textarea value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} placeholder="Tell candidates about your company..." className="rounded-md" rows={3} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md">
          <Save className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Create Profile"}
        </Button>
      </div>
    </div>
  );
}
