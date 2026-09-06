"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Video,
  Check,
} from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [rsvpedEvents, setRsvpedEvents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const storedUserId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
        const url = storedUserId ? `/api/events?userId=${storedUserId}` : `/api/events`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleRsvp = async (eventId: string) => {
    const storedUserId = typeof window !== "undefined" ? localStorage.getItem("current_user_id") : null;
    if (!storedUserId) {
      alert("Please sign in or select an account to RSVP for virtual events.");
      return;
    }

    try {
      const res = await fetch("/api/events/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          userId: storedUserId,
        }),
      });
      if (res.ok) {
        setRsvpedEvents((prev) => ({ ...prev, [eventId]: true }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (activeFilter === "ALL") return true;
    return e.type === activeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7ef7de]/20 text-[#7ef7de] text-xs font-bold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Virtual Employer Sessions & Tech Talks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black">Campus AMAs & Technical Deep Dives</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Meet engineering directors and talent leads from eBay, Reddit, MongoDB, and Palo Alto Networks.
            Directly connect and receive fast-track interview consideration.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-5 py-3 rounded-2xl bg-[#7ef7de] text-slate-900 font-extrabold text-xs shadow-md hover:bg-[#68e0c7] transition-all shrink-0 text-center"
        >
          View Matched Jobs →
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {["ALL", "Tech Talk", "Info Session", "Career Fair", "Workshop"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === tab
                ? "bg-[#6436e9] text-white shadow-md shadow-[#6436e9]/20"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            }`}
          >
            {tab === "ALL" ? "All Events" : tab}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading virtual events schedule...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border bg-white dark:bg-slate-900 space-y-2">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No events in this category yet.</p>
          <p className="text-xs text-slate-500">Check back soon for new employer tech talks and info sessions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const isConfirmed = rsvpedEvents[evt.id] || evt.isRsvped;
            return (
              <div
                key={evt.id}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#6436e9]/10 text-[#6436e9]">
                      {evt.type}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{evt.duration || "60 mins"}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6436e9]" />
                      {evt.date} · {evt.time}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-teal-600" />
                      {evt.locationType || "Virtual"}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{evt.company}</p>
                    <p className="text-[10px] text-slate-500">
                      {evt.hostName ? `Host: ${evt.hostName}` : "Company Sourcing Team"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRsvp(evt.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isConfirmed
                        ? "bg-emerald-600 text-white"
                        : "bg-[#6436e9] hover:bg-[#5228cb] text-white shadow-md shadow-[#6436e9]/20"
                    }`}
                  >
                    {isConfirmed ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Registered
                      </span>
                    ) : (
                      "1-Click RSVP"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
