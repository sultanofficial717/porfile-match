"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  FlaskConical,
  Bell,
  ShieldCheck,
  Users,
  Sliders,
  ChevronDown,
  Calendar,
  Wand2,
  Plus,
  CheckCircle2,
  Building,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";
import { AuthModal } from "./auth-modal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "getstarted">("signin");
  const [authModalRole, setAuthModalRole] = useState<"STUDENT" | "RECRUITER" | "ADMIN">("STUDENT");

  const loadSession = async () => {
    try {
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
      const isAuthenticated = typeof window !== "undefined" ? localStorage.getItem("user_authenticated") === "true" : false;

      if (!storedUserId || !isAuthenticated) {
        setCurrentUser(null);
        // Still fetch available users for demo switcher
        const res = await fetch("/api/auth/session?guest=true");
        if (res.ok) {
          const data = await res.json();
          setAvailableUsers(data.availableUsers || []);
        }
        return;
      }

      const res = await fetch(`/api/auth/session?userId=${storedUserId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.currentUser);
        setAvailableUsers(data.availableUsers || []);
      }
    } catch (err) {
      console.error("Session load error:", err);
    }
  };

  useEffect(() => {
    loadSession();

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?status=PENDING`);
        if (res.ok) {
          const notifs = await res.json();
          setUnreadCount(Array.isArray(notifs) ? notifs.length : 0);
        }
      } catch (err) {
        console.error("Notifications count error:", err);
      }
    };
    fetchNotifications();

    const handleAuthChange = () => {
      loadSession();
    };

    window.addEventListener("auth-state-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-state-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [pathname]);

  const switchUser = (user: any) => {
    localStorage.setItem("current_user_id", user.id);
    localStorage.setItem("user_authenticated", "true");
    setCurrentUser(user);
    setIsDropdownOpen(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { user, action: "switch" },
        })
      );
    }

    if (user.role === "ADMIN") {
      router.push("/admin");
    } else if (user.role === "RECRUITER") {
      router.push("/recruiter");
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("current_user_id");
    localStorage.removeItem("user_authenticated");
    setCurrentUser(null);
    setIsDropdownOpen(false);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("auth-state-change", {
          detail: { action: "logout" },
        })
      );
    }

    router.push("/");
  };

  const openAuth = (mode: "signin" | "getstarted", role: "STUDENT" | "RECRUITER" | "ADMIN" = "STUDENT") => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const role = currentUser?.role || null;

  const publicLinks = [
    { href: "/#roles", label: "Role Portals", icon: Users },
    { href: "/opportunities", label: "Jobs & Roles", icon: Briefcase },
    { href: "/resume-optimizer", label: "AI Resume Optimizer", icon: Wand2, badgeText: "AI" },
    { href: "/events", label: "Virtual Events", icon: Calendar },
  ];

  const candidateLinks = [
    { href: "/dashboard", label: "Match Stream", icon: LayoutDashboard },
    { href: "/resume-optimizer", label: "Resume Optimizer", icon: Wand2, badgeText: "AI" },
    { href: "/opportunities", label: "Jobs & Roles", icon: Briefcase },
    { href: "/events", label: "Virtual Events", icon: Calendar },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/notifications", label: "Inbox", icon: Bell, badge: unreadCount },
  ];

  const recruiterLinks = [
    { href: "/recruiter", label: "Recruiter Hub", icon: Building },
    { href: "/recruiter/candidates", label: "AI Sourcing Feed", icon: Users },
    { href: "/recruiter/opportunities/new", label: "Post Opportunity", icon: Plus },
    { href: "/recruiter/events", label: "Host Events", icon: Calendar },
    { href: "/opportunities", label: "All Postings", icon: Briefcase },
    { href: "/notifications", label: "Inbox", icon: Bell, badge: unreadCount },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
    { href: "/admin/settings", label: "Scoring Weights", icon: Sliders },
    { href: "/experiments", label: "Experiments Lab", icon: FlaskConical },
    { href: "/opportunities", label: "Opportunities", icon: Briefcase },
    { href: "/notifications", label: "Notification Queue", icon: Bell, badge: unreadCount },
  ];

  const navLinks = !currentUser
    ? publicLinks
    : role === "ADMIN"
    ? adminLinks
    : role === "RECRUITER"
    ? recruiterLinks
    : candidateLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6436e9] via-[#815af3] to-[#7ef7de] flex items-center justify-center text-white shadow-md shadow-[#6436e9]/20 group-hover:scale-105 transition-all">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-900 dark:text-white font-extrabold text-lg tracking-tight leading-tight">
                    Easy<span className="text-[#6436e9] dark:text-[#815af3]">Match</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-[#7ef7de]/40 text-[#006f56] dark:bg-[#7ef7de]/20 dark:text-[#7ef7de]">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                  YOUR AI JOB MATCHMAKER
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
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#6436e9]/10 text-[#6436e9] dark:bg-[#815af3]/20 dark:text-[#815af3] shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                    {link.badgeText && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-[#6436e9] text-white">
                        {link.badgeText}
                      </span>
                    )}
                    {link.badge && link.badge > 0 ? (
                      <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white animate-pulse">
                        {link.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* AI Engine Status (Shown when logged in or on desktop) */}
            <Link
              href="/admin/settings"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-colors"
              title="Hybrid AI Matchmaker Engine: Hard Rules + Ollama Semantic Embeddings"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI Match Engine:</span>
              <span className="font-bold text-[#6436e9] dark:text-[#815af3]">Active</span>
            </Link>

            {/* Authenticated State vs Guest State */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-400 transition-all text-left cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-gradient-to-tr from-[#6436e9] to-[#815af3] flex items-center justify-center text-xs font-bold text-white border border-white/20">
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      currentUser?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col text-xs leading-tight">
                    <span className="font-bold text-slate-900 dark:text-white max-w-[130px] truncate">
                      {currentUser?.name || "Select Account"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">
                      {role === "ADMIN"
                        ? "Admin"
                        : role === "RECRUITER"
                        ? currentUser?.recruiterProfile?.companyName || "Recruiter"
                        : "Candidate"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">
                          Signed in as {currentUser.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {currentUser.email}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#6436e9]/10 text-[#6436e9]">
                        {role}
                      </span>
                    </div>

                    <div className="px-4 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Switch Active Profile:
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1 px-2 space-y-1">
                      {availableUsers.map((u) => {
                        const isSelected = u.id === currentUser?.id;
                        const roleBadgeColor =
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : u.role === "RECRUITER"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";

                        return (
                          <button
                            key={u.id}
                            onClick={() => switchUser(u)}
                            className={`w-full flex items-center justify-between p-2 rounded-2xl text-left text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#6436e9]/10 border border-[#6436e9]/30 text-slate-900 dark:text-white"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <div className="w-7 h-7 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                ) : (
                                  u.name.charAt(0)
                                )}
                              </div>
                              <div className="truncate max-w-[130px]">
                                <p className="font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase shrink-0 ${roleBadgeColor}`}>
                              {u.role === "RECRUITER" && u.recruiterProfile?.companyName
                                ? u.recruiterProfile.companyName
                                : u.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 mt-2 space-y-1.5">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          openAuth("getstarted");
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-700 dark:text-slate-200"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Account</span>
                      </button>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Guest / Not Logged In State */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth("signin")}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => openAuth("getstarted")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#6436e9] hover:bg-[#5228cb] text-white shadow-md shadow-[#6436e9]/20 transition-all hover:scale-102 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
        defaultRole={authModalRole}
      />
    </>
  );
}
