"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Building2,
  ShieldCheck,
  Bell,
  ChevronDown,
  UserPlus,
  Compass,
  FileText,
  PlusCircle,
  BarChart3,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { RoleAuthModal } from "./RoleAuthModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<any>(null);

  const fetchSession = async () => {
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      const res = await api.auth.getSession(storedId || undefined);
      if (res.currentUser) {
        setCurrentUser(res.currentUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("current_user_id", res.currentUser.id);
        }
      }
      setAvailableUsers(res.availableUsers || []);
    } catch (err) {
      console.warn("Session fetch:", err);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await api.system.getHealth();
      setOllamaStatus(res.ollama);
    } catch {
      setOllamaStatus({ isConnected: false, statusText: "UNAVAILABLE" });
    }
  };

  useEffect(() => {
    fetchSession();
    fetchHealth();
  }, []);

  const switchUser = (user: any) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("current_user_id", user.id);
    }
    setIsDropdownOpen(false);

    if (user.role === "admin") router.push("/admin");
    else if (user.role === "recruiter") router.push("/recruiter/dashboard");
    else router.push("/dashboard");
  };

  const role = currentUser?.role || "student";

  // Dynamic Navigation Links based on active role
  const getNavLinks = () => {
    if (role === "admin") {
      return [
        { href: "/admin", label: "Admin Hub", icon: ShieldCheck },
        { href: "/admin/recruiters", label: "Recruiters", icon: Users },
        { href: "/admin/opportunities", label: "Opportunities", icon: Compass },
        { href: "/admin/metrics", label: "Metrics", icon: BarChart3 },
      ];
    } else if (role === "recruiter") {
      return [
        { href: "/recruiter/dashboard", label: "Recruiter Dashboard", icon: Building2 },
        { href: "/recruiter/opportunities/new", label: "Post Opportunity", icon: PlusCircle },
        { href: "/notifications", label: "Notifications", icon: Bell },
      ];
    } else {
      return [
        { href: "/dashboard", label: "My Matches", icon: Sparkles },
        { href: "/profile", label: "Profile Builder", icon: FileText },
        { href: "/onboarding", label: "Onboarding Wizard", icon: User },
        { href: "/opportunities", label: "Browse All", icon: Compass },
        { href: "/notifications", label: "Alerts", icon: Bell },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 dark:text-white font-extrabold text-base leading-tight">
                  Match<span className="text-blue-600">AI</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-none">
                  Hybrid AI Matching
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/register"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Register as Student</span>
            </Link>

            {/* Informational Ollama Status Badge */}
            <Link
              href="/admin/metrics"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 text-xs font-medium border border-slate-200/80 dark:border-slate-800 transition-colors"
              title="Ollama Local Embeddings Engine: Click to view system metrics"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  ollamaStatus?.isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
                aria-hidden="true"
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Ollama:</span>
              <span className="font-mono text-[11px] text-slate-500">
                {ollamaStatus?.model || "nomic-embed-text"}
              </span>
            </Link>

            {/* Active User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs hover:border-slate-400 transition-all text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                  {currentUser?.fullName?.[0] || currentUser?.email?.[0] || "U"}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser?.fullName || currentUser?.email?.split("@")[0] || "Select User"}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-blue-600 leading-none">
                    {role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border rounded-2xl p-2 shadow-2xl space-y-1 animate-in fade-in z-50">
                  <div className="px-3 py-2 border-b">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Active Role Switcher
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Switch accounts or create a new user profile
                    </p>
                  </div>

                  <div className="max-h-56 overflow-y-auto py-1 space-y-1">
                    {availableUsers.map((u) => {
                      const isSelected = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => switchUser(u)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <div className="truncate">
                            <p className="font-semibold truncate">{u.fullName || u.email}</p>
                            <p className="text-[10px] opacity-70 truncate">{u.email}</p>
                          </div>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-200 dark:bg-slate-800">
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t pt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create New Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <RoleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => {
          fetchSession();
          switchUser(newUser);
        }}
      />
    </>
  );
}
