"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { MatchScoreBadge } from "@/components/match-score-badge";

export default function NotificationsInboxPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSendTestEmail = async (id: string, email: string) => {
    setSendingId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, action: "SEND_TEST_EMAIL" }),
      });
      if (res.ok) {
        setSentToast(`Simulated email successfully delivered to ${email}`);
        setTimeout(() => setSentToast(null), 4000);
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingId(null);
    }
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === "ALL") return true;
    return n.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulated Opportunity Notification Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Opportunity Match Alerts & Email Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            When a candidate's hybrid match score reaches the configured threshold (≥92%), an alert is
            queued. Preview the email template and simulate dispatch without email spam.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/10 backdrop-blur-md rounded-xl text-xs font-semibold">
          {["ALL", "PENDING", "SENT"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeFilter === f
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sentToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sentToast}</span>
        </div>
      )}

      {/* Notifications Queue List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl border bg-white dark:bg-slate-900 space-y-3">
          <Mail className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Notifications in this queue
          </h3>
          <p className="text-xs text-slate-500">
            Run matching on the student dashboard or check scoring settings threshold.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const opp = item.opportunity;
            const isSent = item.status === "SENT";

            return (
              <div
                key={item.id}
                className="p-6 rounded-3xl border bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                {/* Header with recipient & score */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 font-bold">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        To: {item.user.name} ({item.user.email})
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Queued on {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isSent
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <MatchScoreBadge score={item.matchScore} size="sm" />
                  </div>
                </div>

                {/* Email Simulation Card Preview (Section 10) */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border font-sans space-y-3">
                  <div className="border-b pb-2">
                    <p className="text-[11px] text-slate-400 font-bold uppercase">Email Subject:</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.emailSubject}
                    </p>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-mono bg-white dark:bg-slate-900 p-4 rounded-xl border">
                    {item.emailBody}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {opp && (
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>View Opportunity</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!isSent && (
                    <button
                      onClick={() => handleSendTestEmail(item.id, item.user.email)}
                      disabled={sendingId === item.id}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingId === item.id ? "Sending..." : "Send Test Email"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
