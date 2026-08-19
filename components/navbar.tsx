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
  ExternalLink,
  Bot,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Load active session from localStorage or fetch default
    const storedUserId = localStorage.getItem("current_user_id");
    const fetchSession = async () => {
      try {
        const url = storedUserId
          ? `/api/auth/session?userId=${storedUserId}`
          : `/api/auth/session`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.currentUser);
          setAvailableUsers(data.availableUsers || []);
          if (!storedUserId && data.currentUser) {
            localStorage.setItem("current_user_id", data.currentUser.id);
          }
        }
      } catch (err) {
        console.error("Session load error:", err);
      }
    };

    fetchSession();

    // Fetch unread notifications
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
  }, [pathname]);

  const switchUser = (user: any) => {
    localStorage.setItem("current_user_id", user.id);
    setCurrentUser(user);
    setIsDropdownOpen(false);

    // Route intelligently based on role
    if (user.role === "ADMIN") {
      router.push("/admin");
    } else if (user.role === "RECRUITER") {
      router.push("/recruiter");
    } else {
      router.push("/dashboard");
    }
  };

  const role = currentUser?.role || "STUDENT";

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "My Profile", icon: User },
    { href: "/profile/import", label: "Import CV", icon: FileText },
    { href: "/opportunities", label: "Opportunities", icon: Briefcase },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
  ];

  const recruiterLinks = [
    { href: "/recruiter", label: "Recruiter Hub", icon: Briefcase },
    { href: "/recruiter/candidates", label: "Candidate Matches", icon: Users },
    { href: "/recruiter/opportunities/new", label: "Post Opportunity", icon: FileText },
    { href: "/opportunities", label: "All Opportunities", icon: Briefcase },
    { href: "/notifications", label: "Inbox", icon: Bell, badge: unreadCount },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin Panel", icon: ShieldCheck },
    { href: "/experiments", label: "Experiments Lab", icon: FlaskConical },
    { href: "/admin/settings", label: "Scoring Weights", icon: Sliders },
    { href: "/opportunities", label: "Opportunities", icon: Briefcase },
    { href: "/notifications", label: "Notification Queue", icon: Bell, badge: unreadCount },
  ];

  const navLinks =
    role === "ADMIN" ? adminLinks : role === "RECRUITER" ? recruiterLinks : studentLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
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
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
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
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
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

        {/* User Persona Switcher & Controls */}
        <div className="flex items-center gap-3">
          {/* Embedding Models Pill */}
          <Link
            href="/experiments"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border hover:border-blue-400 transition-colors"
            title="Compare Qwen, Gemini, and Ollama embeddings"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">Models:</span>
            <span className="text-slate-500">Qwen / Gemini / Ollama</span>
          </Link>

          {/* Active User Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-900 shadow-xs hover:border-slate-400 transition-all text-left"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 border">
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
              <div className="hidden lg:flex flex-col text-xs leading-tight">
                <span className="font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">
                  {currentUser?.name || "Select Persona"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {role === "ADMIN" ? "Platform Admin" : role === "RECRUITER" ? "Recruiter" : "Student"}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Quick Persona Switcher
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Switch between Student, Recruiter, and Admin roles to test all sides of the MVP.
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {availableUsers.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    const roleBadgeColor =
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        : u.role === "RECRUITER"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";

                    return (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          isSelected ? "bg-blue-50/70 dark:bg-blue-950/40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${roleBadgeColor}`}>
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
