import React from 'react';
import { formatDateRange } from '../../utils/rtoCompliance';

const STATUS_CONFIG = {
  COUNTING: {
    border: 'border-green-500',
    bg: 'bg-green-900/30',
    badge: 'bg-green-700 text-green-100',
    label: 'COUNTING',
    dot: '#22c55e',
  },
  DEAD_WEIGHT: {
    border: 'border-gray-600',
    bg: 'bg-gray-800/50',
    badge: 'bg-gray-700 text-gray-400',
    label: 'DEAD WEIGHT',
    dot: '#374151',
  },
  SPRINT: {
    border: 'border-amber-400',
    bg: 'bg-amber-900/30',
    badge: 'bg-amber-600 text-amber-100',
    label: 'SPRINT ⚡',
    dot: '#f59e0b',
    pulse: true,
  },
  ON_TRACK: {
    border: 'border-blue-400',
    bg: 'bg-blue-900/30',
    badge: 'bg-blue-700 text-blue-100',
    label: 'ON TRACK ✓',
    dot: '#3b82f6',
    pulse: false,
  },
  FUTURE: {
    border: 'border-gray-700',
    bg: 'bg-gray-900/30',
    badge: 'bg-gray-800 text-gray-500',
    label: 'FUTURE',
    dot: '#1f2937',
  },
};

/**
 * AttendanceDots: visual representation of days (filled = attended, empty = not)
 */
function AttendanceDots({ attended, max, dotColor }) {
  return (
    <div className="flex gap-1 justify-center my-2">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-full border"
          style={{
            backgroundColor: i < attended ? dotColor : 'transparent',
            borderColor: i < attended ? dotColor : '#4b5563',
          }}
        />
      ))}
    </div>
  );
}

/**
 * WeekCard: represents one week in the 12-week window.
 *
 * Props:
 *   week       – annotated week object from computeCompliance
 *   weekNum    – display number (1–12)
 *   isDropping – true if this is the oldest week (about to drop off)
 *   onClick    – called when user clicks to edit
 */
export default function WeekCard({ week, weekNum, isDropping, onClick }) {
  const config = STATUS_CONFIG[week.status] ?? STATUS_CONFIG.DEAD_WEIGHT;

  return (
    <button
      onClick={() => onClick(week)}
      className={[
        'relative flex flex-col items-center p-2 rounded-lg border-2 cursor-pointer',
        'text-center transition-all duration-200 hover:scale-105 hover:brightness-110',
        'min-w-[100px] w-[100px] flex-shrink-0',
        config.border,
        config.bg,
        config.pulse ? 'rto-sprint-pulse' : '',
        isDropping ? 'rto-drop-warning' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={`Click to edit – ${formatDateRange(week.startDate, week.endDate)}`}
    >
      {/* Drop-off warning badge */}
      {isDropping && (
        <span className="absolute -top-2 -right-2 text-[10px] bg-red-600 text-white rounded-full px-1 py-0.5 font-bold leading-none z-10">
          DROP↓
        </span>
      )}

      {/* Week number */}
      <span className="text-xs text-gray-400 font-mono">W{weekNum}</span>

      {/* Date range */}
      <span className="text-[11px] text-gray-300 leading-tight mt-0.5">
        {formatDateRange(week.startDate, week.endDate)}
      </span>

      {/* Attendance dots */}
      <AttendanceDots
        attended={week.daysAttended}
        max={week.maxDays}
        dotColor={config.dot}
      />

      {/* Day count */}
      <span className="text-xl font-bold text-white leading-none">
        {week.daysAttended}
        <span className="text-xs text-gray-400 font-normal">/{week.maxDays}</span>
      </span>

      {/* Status badge */}
      <span
        className={`mt-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${config.badge}`}
      >
        {config.label}
      </span>
    </button>
  );
}
