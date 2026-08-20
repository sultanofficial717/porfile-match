"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Bell,
  Layers,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<any>({
    semanticWeight: 0.40,
    skillWeight: 0.20,
    experienceWeight: 0.15,
    educationWeight: 0.10,
    completenessWeight: 0.10,
    otherWeight: 0.05,
    notificationThreshold: 92.0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.semanticWeight !== undefined) {
          setConfig(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalWeight =
    (parseFloat(config.semanticWeight) || 0) +
    (parseFloat(config.skillWeight) || 0) +
    (parseFloat(config.experienceWeight) || 0) +
    (parseFloat(config.educationWeight) || 0) +
    (parseFloat(config.completenessWeight) || 0) +
    (parseFloat(config.otherWeight) || 0);

  const isTotalValid = Math.abs(totalWeight - 1.0) <= 0.01;

  const handleSave = async () => {
    if (!isTotalValid) {
      alert(`Scoring weights must sum to 100%. Current sum: ${(totalWeight * 100).toFixed(0)}%`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({
      semanticWeight: 0.40,
      skillWeight: 0.20,
      experienceWeight: 0.15,
      educationWeight: 0.10,
      completenessWeight: 0.10,
      otherWeight: 0.05,
      notificationThreshold: 92.0,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Panel</span>
      </Link>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-lg space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
          <Sliders className="w-3.5 h-3.5" />
          <span>Configurable Scoring Algorithm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Scoring Weights & Threshold Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Customize the contribution of each matching component in the overall hybrid score.
          Weights dynamically update without modifying application code.
        </p>
      </div>

      {/* Weights Matrix */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Multi-Factor Weights</span>
          </h2>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isTotalValid
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            Total: {(totalWeight * 100).toFixed(0)}% / 100%
          </div>
        </div>

        <div className="space-y-4">
          {/* Semantic Similarity */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Semantic Similarity Weight</span>
              <span className="text-blue-600 font-mono">{(config.semanticWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.semanticWeight}
              onChange={(e) =>
                setConfig({ ...config, semanticWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Skill Match */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Skill Match Weight</span>
              <span className="text-blue-600 font-mono">{(config.skillWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.skillWeight}
              onChange={(e) =>
                setConfig({ ...config, skillWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Experience Match */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Experience Match Weight</span>
              <span className="text-blue-600 font-mono">{(config.experienceWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.experienceWeight}
              onChange={(e) =>
                setConfig({ ...config, experienceWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Education Match */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Education Match Weight</span>
              <span className="text-blue-600 font-mono">{(config.educationWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.educationWeight}
              onChange={(e) =>
                setConfig({ ...config, educationWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Profile Completeness */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Profile Completeness Weight</span>
              <span className="text-blue-600 font-mono">{(config.completenessWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.completenessWeight}
              onChange={(e) =>
                setConfig({ ...config, completenessWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Other Factors */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-800 dark:text-slate-200">Other Factors (Certifications & Leadership)</span>
              <span className="text-blue-600 font-mono">{(config.otherWeight * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.otherWeight}
              onChange={(e) =>
                setConfig({ ...config, otherWeight: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Notification Threshold Setting (Section 21) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>Match Notification Threshold</span>
          </h2>
          <p className="text-xs text-slate-500">
            Automatically creates notification queue items when overall score &gt;= threshold (Default: 92%) and Stage 1 hard eligibility passes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[90, 91, 92, 93, 94, 95].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setConfig({ ...config, notificationThreshold: t })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                config.notificationThreshold === t
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              }`}
            >
              {t}% Threshold {t === 92 ? "(Default)" : ""}
            </button>
          ))}
        </div>
      </div>


      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !isTotalValid}
          className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Scoring weights and threshold updated successfully!
        </div>
      )}
    </div>
  );
}
