import React, { useState, useMemo, useCallback } from 'react';
import { computeCompliance, WINDOW_SIZE, BEST_N } from '../utils/rtoCompliance';
import { getMockData } from '../utils/rtoMockData';
import WeekCard from '../components/rto/WeekCard';
import ComplianceBanner from '../components/rto/ComplianceBanner';
import ForecastPanel from '../components/rto/ForecastPanel';

// ── Target toggle ──────────────────────────────────────────────────────────────

function TargetToggle({ target, onToggle }) {
  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {[20, 24].map((t) => (
        <button
          key={t}
          onClick={() => onToggle(t)}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-bold transition-all duration-200',
            target === t
              ? 'bg-indigo-600 text-white shadow'
              : 'text-gray-400 hover:text-white hover:bg-gray-700',
          ].join(' ')}
        >
          {t} days
        </button>
      ))}
    </div>
  );
}

// ── Edit modal ─────────────────────────────────────────────────────────────────

function EditModal({ week, onSave, onClose }) {
  const [days, setDays] = useState(week.daysAttended);

  const handleSave = () => {
    onSave(Math.min(week.maxDays, Math.max(0, days)));
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold text-lg mb-1">Edit Week</h3>
        <p className="text-gray-400 text-sm mb-5">
          {week.startDate} – {week.endDate}
          {week.isCurrent && (
            <span className="ml-2 text-amber-400 font-semibold">· Current week</span>
          )}
        </p>

        <label className="block text-gray-300 text-sm mb-2">
          Days attended (0 – {week.maxDays})
        </label>

        {/* Day picker buttons */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: week.maxDays + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => setDays(i)}
              className={[
                'flex-1 h-10 rounded-lg font-bold text-sm border-2 transition-all',
                days === i
                  ? 'border-indigo-500 bg-indigo-700 text-white'
                  : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500',
              ].join(' ')}
            >
              {i}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Week grid ──────────────────────────────────────────────────────────────────

function WeekGrid({ weeks, onEditWeek }) {
  const countingCount = weeks.filter(
    (w) => w.status === 'COUNTING' || w.status === 'ON_TRACK'
  ).length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-bold text-base">
          12-Week Rolling Window
        </h2>
        <div className="flex gap-3 text-xs">
          <LegendPip color="border-green-500 bg-green-900/30" label="Counting" />
          <LegendPip color="border-gray-600 bg-gray-800/50" label="Dead Weight" />
          <LegendPip color="border-amber-400 bg-amber-900/30" label="Sprint" />
          <LegendPip color="border-blue-400 bg-blue-900/30" label="On Track" />
        </div>
      </div>

      {/* Horizontal scrollable card row */}
      <div className="overflow-x-auto pb-3">
        <div className="flex gap-2 min-w-max">
          {weeks.map((week, i) => (
            <WeekCard
              key={week.id}
              week={week}
              weekNum={i + 1}
              isDropping={i === 0}
              onClick={onEditWeek}
            />
          ))}
        </div>
      </div>

      {/* Direction label */}
      <div className="flex justify-between text-xs text-gray-600 mt-1 px-1">
        <span>← Oldest (drops off next)</span>
        <span>Current week →</span>
      </div>

      {/* Best 8 summary bar */}
      <BestEightBar weeks={weeks} />
    </section>
  );
}

function LegendPip({ color, label }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-3 h-3 rounded border-2 ${color}`} />
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

/**
 * BestEightBar: a compact ranked bar chart showing all 12 weeks by days attended,
 * colour-coded to show which 8 are counting.
 */
function BestEightBar({ weeks }) {
  const maxDays = Math.max(...weeks.map((w) => w.maxDays), 1);

  // Sort weeks for the bar chart (descending by daysAttended)
  const sorted = [...weeks].sort((a, b) => b.daysAttended - a.daysAttended);

  return (
    <div className="mt-4 rounded-xl border border-gray-700 bg-gray-800/40 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
        Ranked attendance · Best {BEST_N} highlighted
      </p>
      <div className="flex items-end gap-1 h-16">
        {sorted.map((week, rank) => {
          const isCounting = week.status === 'COUNTING' || week.status === 'ON_TRACK';
          const isSprint = week.status === 'SPRINT';
          const pct = (week.daysAttended / maxDays) * 100;
          const barColor = isSprint
            ? 'bg-amber-500'
            : isCounting
            ? 'bg-green-500'
            : 'bg-gray-600';

          return (
            <div key={week.id} className="flex flex-col items-center flex-1 gap-0.5">
              <span className="text-[9px] text-gray-400 leading-none">
                {week.daysAttended}
              </span>
              <div
                className={`w-full rounded-t transition-all ${barColor}`}
                style={{ height: `${Math.max(4, pct)}%` }}
              />
              {rank === BEST_N - 1 && (
                <div className="absolute -mt-1 w-px h-full border-l border-dashed border-yellow-500/50" />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-gray-500 mt-1">
        <span>← Best weeks</span>
        <span className="text-yellow-600/70">↑ Cut-off</span>
        <span>Worst →</span>
      </div>
    </div>
  );
}

// ── Data source badge ──────────────────────────────────────────────────────────

function DataSourceBadge({ onReset }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span>
        Using <strong className="text-gray-400">mock data</strong> · Click any week to edit ·{' '}
        <button
          className="text-indigo-400 hover:text-indigo-300 underline"
          onClick={onReset}
        >
          Reset to defaults
        </button>
      </span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RTOTracker() {
  const [weeks, setWeeks] = useState(() => getMockData());
  const [target, setTarget] = useState(20);
  const [editingWeek, setEditingWeek] = useState(null);

  const compliance = useMemo(
    () => computeCompliance(weeks, target),
    [weeks, target]
  );

  const handleUpdateDays = useCallback(
    (weekId, days) => {
      setWeeks((prev) =>
        prev.map((w) => (w.id === weekId ? { ...w, daysAttended: days } : w))
      );
      setEditingWeek(null);
    },
    []
  );

  const handleReset = useCallback(() => {
    setWeeks(getMockData());
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              RTO Compliance Tracker
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              Best {BEST_N} of {WINDOW_SIZE} weeks · rolling window
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Target:</span>
            <TargetToggle target={target} onToggle={setTarget} />
          </div>
        </div>

        {/* ── Data source indicator ───────────────────────────────────── */}
        <DataSourceBadge onReset={handleReset} />

        {/* ── Compliance status banner ────────────────────────────────── */}
        <ComplianceBanner compliance={compliance} />

        {/* ── 12-week grid ────────────────────────────────────────────── */}
        <WeekGrid
          weeks={compliance.weeks}
          onEditWeek={setEditingWeek}
        />

        {/* ── Forecast panel ──────────────────────────────────────────── */}
        <ForecastPanel compliance={compliance} />

        {/* ── Architecture note ───────────────────────────────────────── */}
        <ArchitectureNote />
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      {editingWeek && (
        <EditModal
          week={editingWeek}
          onSave={(days) => handleUpdateDays(editingWeek.id, days)}
          onClose={() => setEditingWeek(null)}
        />
      )}
    </div>
  );
}

// ── Architecture note ──────────────────────────────────────────────────────────

function ArchitectureNote() {
  return (
    <div className="mt-8 rounded-xl border border-gray-700 bg-gray-800/30 p-4">
      <h3 className="text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
        <span>🏗</span> Integration Guide
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        This prototype uses hardcoded mock data. Swap in real badge-in data by replacing one file:
      </p>
      <div className="rounded-lg bg-gray-900 border border-gray-700 p-3 font-mono text-xs text-gray-300 space-y-1">
        <div>
          <span className="text-gray-500">// src/utils/</span>
          <span className="text-green-400">rtoMockData.js</span>
          <span className="text-gray-500"> ← replace this file</span>
        </div>
        <div className="mt-1 text-gray-400">
          Export a <span className="text-amber-300">getMockData(today)</span> function that returns
          exactly <span className="text-blue-300">12 Week objects</span> (oldest first).
        </div>
        <div className="mt-1 text-gray-500">
          The engine (<span className="text-green-400">rtoCompliance.js</span>) and all UI
          components need zero changes.
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <ArchChip
          icon="⚙️"
          title="Logic Engine"
          file="rtoCompliance.js"
          desc="Pure functions. No framework deps."
        />
        <ArchChip
          icon="🗄"
          title="Data Adapter"
          file="rtoMockData.js"
          desc="Swap for real HR/badge-in API."
        />
        <ArchChip
          icon="🖥"
          title="UI Layer"
          file="RTOTracker.jsx + components/rto/"
          desc="React only. No coupling to data source."
        />
      </div>
    </div>
  );
}

function ArchChip({ icon, title, file, desc }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-2.5">
      <div className="font-bold text-gray-200 text-xs mb-0.5">
        {icon} {title}
      </div>
      <div className="text-indigo-400 font-mono text-[10px] mb-1">{file}</div>
      <div className="text-gray-500 text-[10px]">{desc}</div>
    </div>
  );
}
