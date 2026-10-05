"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Upload,
  Target,
  Zap,
  Users,
  Briefcase,
  GraduationCap,
  Check,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export default function LandingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const handleGetStarted = () => {
    if (user && profile) {
      router.push(profile.role === "recruiter" ? "/recruiter" : "/dashboard");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="w-full">
      {/* ═══ HERO ═══ */}
      <section className="w-full py-24 md:py-32 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-accent-foreground rounded-md text-xs font-semibold mb-6">
              <Zap className="w-3 h-3" /> Automated Matching Engine
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-semibold tracking-tight text-foreground leading-[1.05] mb-6">
              Find your perfect{" "}
              <span className="text-primary">match.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Connect students and recruiters with automated profile-to-role
              matching. Build your profile, post roles, and let the algorithm
              surface the best candidates — ranked by skill overlap, education,
              and fit.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
              >
                I&apos;m a Student <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold text-sm rounded-md"
                >
                  Recruiter Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg">
            {[
              { value: "40%", label: "Skills Weight" },
              { value: "5", label: "Scoring Factors" },
              { value: "100%", label: "Transparent" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-display font-semibold text-primary">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wide font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="w-full py-20 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="max-w-xl mb-12">
            <span className="tag tag-yellow text-xs uppercase tracking-wide mb-3 inline-block">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
              Three steps to your next opportunity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                step: "01",
                title: "Build Your Profile",
                desc: "Add your education, skills, experience, and projects. Upload your resume. The richer your profile, the better your matches.",
              },
              {
                icon: Zap,
                step: "02",
                title: "Algorithm Matches You",
                desc: "Our scoring engine evaluates skill overlap, education fit, location preference, experience level, and industry alignment.",
              },
              {
                icon: Target,
                step: "03",
                title: "Review & Connect",
                desc: "Students see ranked roles with scores and reasons. Recruiters see ranked candidates per role. Shortlist, contact, and hire.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="editorial-card p-6 relative group"
              >
                <div className="absolute top-4 right-4 text-4xl font-display font-semibold text-border group-hover:text-primary/30 transition-colors">
                  {item.step}
                </div>
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCORING BREAKDOWN ═══ */}
      <section className="w-full py-20 bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="tag tag-yellow text-xs uppercase tracking-wide mb-3 inline-block">
              Transparent Scoring
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4 leading-tight">
              Know exactly why you{" "}
              <span className="text-primary">matched</span>
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
              Every match score is broken down into weighted factors. Skills
              overlap, education relevance, location compatibility, experience
              level, and industry preference — all visible.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
            >
              See Your Matches <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="editorial-card p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-display font-semibold text-foreground">
                Score Breakdown
              </h3>
              <span className="tag tag-yellow text-[10px]">
                <BarChart3 className="w-3 h-3" /> Weighted
              </span>
            </div>
            {[
              { label: "Skills Overlap", pct: 40 },
              { label: "Education Relevance", pct: 20 },
              { label: "Location / Work Mode", pct: 15 },
              { label: "Experience Level Fit", pct: 15 },
              { label: "Industry Preference", pct: 10 },
            ].map((bar) => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">
                    {bar.label}
                  </span>
                  <span className="font-semibold text-foreground">
                    {bar.pct}%
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-md transition-all duration-700"
                    style={{ width: `${bar.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOR STUDENTS / RECRUITERS ═══ */}
      <section className="w-full py-20 border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10">
          <div className="max-w-xl mb-12">
            <span className="tag tag-yellow text-xs uppercase tracking-wide mb-3 inline-block">
              Built For You
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground">
              Two sides, one platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Students */}
            <div className="editorial-card p-6">
              <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                For Students
              </h3>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Full profile builder with all fields",
                  "Resume upload via Appwrite Storage",
                  "Automated match feed ranked by score",
                  "Skill overlap + match reasons visible",
                  "Application status tracker",
                  "Profile completeness tracking",
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Create Profile <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Recruiters */}
            <div className="editorial-card p-6">
              <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                For Recruiters
              </h3>
              <ul className="space-y-2.5 mb-6">
                {[
                  "Company + open role management",
                  "Automated candidate feed per role",
                  "Ranked by match score with reasons",
                  "Shortlist, contact, status actions",
                  "Filter and search on top of matches",
                  "Admin creates recruiter credentials",
                ].map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Recruiter Login <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="w-full py-20 bg-foreground text-background">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">
            Ready to find your perfect match?
          </h2>
          <p className="text-base text-background/60 mb-8 max-w-lg mx-auto">
            Students build profiles and get ranked matches. Recruiters post
            roles and see top candidates. Start now.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-[var(--color-primary-hover)] font-semibold text-sm rounded-md"
            >
              Get Started Free
            </Button>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="font-semibold text-sm rounded-md border-background/30 text-background hover:bg-background/10"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="w-full bg-foreground text-background/60 py-10 border-t border-background/10">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>&copy; {new Date().getFullYear()} ProfileMatch. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-background transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-background transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
