"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Sparkles,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
    if (storedId) {
      api.notifications.getStudentNotifications(storedId).then((res) => {
        setEmailLogs(res.emailLogs || []);
        setNotifications(res.notifications || []);
      }).catch(console.warn).finally(() => setLoading(false));
    } else {
      api.notifications.listEmailLogs().then((res) => {
        setEmailLogs(res.emailLogs || []);
      }).catch(console.warn).finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border shadow-md space-y-1">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Notifications & Match Alert History
          </h1>
        </div>
        <p className="text-xs text-slate-500">
          Review automated notification emails sent when opportunities exceed your threshold.
        </p>
      </div>

      {/* Email Delivery Logs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Email Delivery Log ({emailLogs.length})
          </h2>
        </div>

        {emailLogs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border text-center space-y-2">
            <Mail className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">No emails sent yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {log.subject}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {log.deliveryStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl whitespace-pre-line font-mono text-[11px]">
                  {log.body}
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>To: {log.recipientEmail}</span>
                  <span>Sent: {new Date(log.sentAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
