import React from 'react';
import { BEST_N, WINDOW_SIZE } from '../../utils/rtoCompliance';

/**
 * ComplianceBanner: top-of-page status summary.
 *
 * Shows:
 *  - Overall compliance status (COMPLIANT / AT RISK / IN PROGRESS)
 *  - Best 8 total vs target with a progress bar
 *  - Quick-read stat chips
 */
export default function ComplianceBanner({ compliance }) {
  const { best8Total, target, daysNeeded, isCompliant, weeks, deadWeightCount } = compliance;

  const pct = Math.min(100, Math.round((best8Total / target) * 100));

  const countingWeeks = weeks.filter((w) => w.status === 'COUNTING' || w.status === 'ON_TRACK').length;
  const sprintWeeks = weeks.filter((w) => w.status === 'SPRINT').length;
  const deadWeeks = weeks.filter((w) => w.status === 'DEAD_WEIGHT').length;

  let statusLabel, statusColor, statusBg, barColor;
  if (isCompliant) {
    statusLabel = '✓ COMPLIANT';
    statusColor = 'text-green-400';
    statusBg = 'bg-green-900/40 border-green-600';
    barColor = 'bg-green-500';
  } else if (daysNeeded <= 2) {
    statusLabel = '⚠ ALMOST THERE';
    statusColor = 'text-amber-400';
    statusBg = 'bg-amber-900/30 border-amber-600';
    barColor = 'bg-amber-500';
  } else {
    statusLabel = '✗ AT RISK';
    statusColor = 'text-red-400';
    statusBg = 'bg-red-900/30 border-red-700';
    barColor = 'bg-red-500';
  }

  return (
    <div className={`rounded-xl border-2 p-5 mb-6 ${statusBg}`}>
      {/* Status headline */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-black tracking-wide ${statusColor}`}>
          {statusLabel}
        </h2>
        <span className="text-3xl font-black text-white">
          {best8Total}
          <span className="text-lg text-gray-400 font-normal">/{target}</span>
          <span className="text-sm text-gray-400 font-normal ml-1">days</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
        {/* Target marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/60"
          style={{ left: '100%' }}
        />
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Chip label="Best 8 Total" value={`${best8Total} days`} color="text-white" />
        <Chip
          label="Still Needed"
          value={daysNeeded === 0 ? 'None 🎉' : `${daysNeeded} day${daysNeeded !== 1 ? 's' : ''}`}
          color={daysNeeded === 0 ? 'text-green-400' : 'text-amber-400'}
        />
        <Chip label="Counting Weeks" value={`${countingWeeks + sprintWeeks} / ${BEST_N}`} color="text-green-300" />
        <Chip label="Dead Weight" value={`${deadWeeks} weeks`} color="text-gray-400" />
        <Chip label="Compliance" value={`${pct}%`} color={pct >= 100 ? 'text-green-400' : 'text-amber-300'} />
      </div>
    </div>
  );
}

function Chip({ label, value, color }) {
  return (
    <div className="flex flex-col bg-gray-800/70 rounded-lg px-3 py-1.5 min-w-[100px]">
      <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
