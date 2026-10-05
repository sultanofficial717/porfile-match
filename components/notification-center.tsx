"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Sparkles,
  Send,
  CheckCircle2,
  Mail,
  Calendar,
  Star,
  Check,
  Trash2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  User,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  databases,
  client,
  DATABASE_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite";
import {
  getStudentProfile,
  getRecruiterProfile,
  getMatchesForStudent,
  getMatchesForRole,
  getRoles,
  getApplicationDataFromMatch,
} from "@/lib/database";
import type { MatchWithDetails, Role } from "@/lib/types";
import { toast } from "sonner";

export interface AppNotification {
  id: string;
  type: "match" | "application" | "shortlist" | "interview" | "general";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link: string;
  matchScore?: number;
  roleTitle?: string;
  companyName?: string;
  candidateName?: string;
}

export function NotificationCenter() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "applications">("all");
  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userId = user?.$id;
  const userRole = profile?.role;

  // Load persistent read state from localStorage
  useEffect(() => {
    if (!userId) return;
    try {
      const stored = localStorage.getItem(`read_notifications_${userId}`);
      if (stored) {
        setReadIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, [userId]);

  // Save persistent read state
  const markAsRead = (id: string) => {
    if (!userId) return;
    setReadIds((prev) => {
      const updated = new Set(prev);
      updated.add(id);
      try {
        localStorage.setItem(`read_notifications_${userId}`, JSON.stringify([...updated]));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const markAllAsRead = () => {
    if (!userId) return;
    const allIds = notifications.map((n) => n.id);
    const updated = new Set(allIds);
    setReadIds(updated);
    try {
      localStorage.setItem(`read_notifications_${userId}`, JSON.stringify(allIds));
    } catch {
      // ignore
    }
    toast.success("All notifications marked as read");
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Load activity notifications based on user role
  const loadNotifications = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const items: AppNotification[] = [];

      if (userRole === "student") {
        const student = await getStudentProfile(user.$id);
        if (student) {
          const matches = await getMatchesForStudent(student.$id);
          for (const m of matches) {
            const app = getApplicationDataFromMatch(m);
            const roleTitle = m.role?.title || "Role";
            const companyName = m.recruiterProfile?.companyName || "Organization";

            // 1. Interview outreach
            if (m.status === "contacted") {
              items.push({
                id: `contact_${m.$id}`,
                type: "interview",
                title: "Interview Outreach!",
                message: `${companyName} would like to connect with you regarding ${roleTitle}.`,
                timestamp: m.$updatedAt || m.$createdAt,
                read: readIds.has(`contact_${m.$id}`),
                link: "/dashboard",
                roleTitle,
                companyName,
              });
            }

            // 2. Shortlisted
            if (m.status === "shortlisted") {
              items.push({
                id: `shortlist_${m.$id}`,
                type: "shortlist",
                title: "You've Been Shortlisted! ⭐",
                message: `${companyName} reviewed your application for ${roleTitle} and moved you to their shortlist.`,
                timestamp: m.$updatedAt || m.$createdAt,
                read: readIds.has(`shortlist_${m.$id}`),
                link: "/dashboard",
                roleTitle,
                companyName,
              });
            }

            // 3. Application submitted
            if (app.isApplied) {
              items.push({
                id: `apply_${m.$id}`,
                type: "application",
                title: "Application Submitted",
                message: `Your tailored application for ${roleTitle} at ${companyName} is in review.`,
                timestamp: app.appliedDate || m.$updatedAt || m.$createdAt,
                read: readIds.has(`apply_${m.$id}`),
                link: "/dashboard",
                roleTitle,
                companyName,
              });
            }

            // 4. High Match Alert (>80%)
            if (m.matchScore >= 80 && !app.isApplied) {
              items.push({
                id: `match_${m.$id}`,
                type: "match",
                title: `✨ Top Match: ${m.matchScore}% Compatibility`,
                message: `You are an exceptional match for ${roleTitle} at ${companyName}.`,
                timestamp: m.$createdAt,
                read: readIds.has(`match_${m.$id}`),
                link: "/dashboard",
                matchScore: m.matchScore,
                roleTitle,
                companyName,
              });
            }
          }
        }
      } else if (userRole === "recruiter") {
        const recruiter = await getRecruiterProfile(user.$id);
        if (recruiter) {
          const roles = await getRoles(recruiter.$id);
          for (const r of roles) {
            const matches = await getMatchesForRole(r.$id);
            for (const m of matches) {
              const app = getApplicationDataFromMatch(m);
              const candidateName = m.profile?.name || "Student Candidate";

              // 1. Direct Application
              if (app.isApplied) {
                items.push({
                  id: `rec_app_${m.$id}`,
                  type: "application",
                  title: `📥 New Candidate Application (${m.matchScore}% Match)`,
                  message: `${candidateName} applied for your ${r.title} role. Review their pitch & dossier.`,
                  timestamp: app.appliedDate || m.$updatedAt || m.$createdAt,
                  read: readIds.has(`rec_app_${m.$id}`),
                  link: `/recruiter/roles/${r.$id}/candidates`,
                  matchScore: m.matchScore,
                  roleTitle: r.title,
                  candidateName,
                });
              } else if (m.matchScore >= 85) {
                items.push({
                  id: `rec_match_${m.$id}`,
                  type: "match",
                  title: `🎯 Top Match Available: ${candidateName}`,
                  message: `Candidate matches ${m.matchScore}% of required skills for ${r.title}.`,
                  timestamp: m.$createdAt,
                  read: readIds.has(`rec_match_${m.$id}`),
                  link: `/recruiter/roles/${r.$id}/candidates`,
                  matchScore: m.matchScore,
                  roleTitle: r.title,
                  candidateName,
                });
              }
            }
          }
        }
      }

      // Sort by newest first
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(items);
    } catch (err) {
      console.error("Error loading activity notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user, profile, readIds.size]);

  // Real-time Appwrite WebSocket Subscription
  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;
    try {
      const channel = `databases.${DATABASE_ID}.collections.${COLLECTIONS.MATCHES}.documents`;
      unsubscribe = client.subscribe(channel, (event) => {
        setIsLiveConnected(true);
        // Refresh notifications
        loadNotifications();

        // If newly created or updated match
        const payload = event.payload as any;
        if (payload) {
          const app = getApplicationDataFromMatch(payload);
          if (userRole === "recruiter" && app.isApplied) {
            toast.info("📥 New candidate application received!", {
              description: "A student just submitted their application.",
              action: {
                label: "Review",
                onClick: () => router.push("/recruiter/candidates"),
              },
            });
          } else if (userRole === "student" && payload.status === "shortlisted") {
            toast.success("⭐ You've been shortlisted!", {
              description: "A recruiter just moved your application to their shortlist.",
              action: {
                label: "View",
                onClick: () => router.push("/dashboard"),
              },
            });
          } else if (userRole === "student" && payload.status === "contacted") {
            toast.success("📅 Interview invitation received!", {
              description: "A recruiter reached out to connect with you.",
              action: {
                label: "Open",
                onClick: () => router.push("/dashboard"),
              },
            });
          }
        }
      });
      setIsLiveConnected(true);
    } catch (err) {
      console.warn("Could not establish real-time subscription:", err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, userRole]);

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !readIds.has(n.id);
    if (activeFilter === "applications") return n.type === "application";
    return true;
  });

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "interview":
        return <Mail className="w-4 h-4 text-blue-500" />;
      case "shortlist":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "application":
        return <Send className="w-4 h-4 text-amber-500" />;
      case "match":
        return <Sparkles className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        aria-label="Activity Center"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Activity Center Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-card border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-4 bg-muted/40 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Activity Center</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Subtabs */}
          <div className="px-4 py-2 bg-muted/20 border-b border-border/60 flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeFilter === "all"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter("unread")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeFilter === "unread"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter("applications")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeFilter === "applications"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Applications
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-2">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-semibold text-foreground">All caught up!</p>
                <p className="text-[11px] text-muted-foreground">
                  {activeFilter === "unread"
                    ? "No unread notifications right now."
                    : "Matches, applicant submissions, and outreach updates will appear here."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isRead = readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      setIsOpen(false);
                      router.push(notif.link);
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !isRead ? "bg-primary/[0.03]" : ""
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-lg bg-card border border-border shrink-0">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatTime(notif.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px]">
                        <span className="text-primary font-medium hover:underline flex items-center gap-0.5">
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                        {!isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Live WebSocket status indicator */}
          <div className="p-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Sync Active</span>
            </span>
            <span>ProfileMatch Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
