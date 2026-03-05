import React from 'react';
import { formatDateRange, MANDATE_START } from '../../utils/rtoCompliance';

/**
 * ForecastPanel: explains the "so what" of the current compliance state.
 *
 * Three sections:
 *  1. Drop-off Impact  – what happens when the oldest week leaves the window
 *  2. Sprint Guide     – how many extra days this week to hit target
 *  3. Legend           – colour key for the week grid
 */
export default function ForecastPanel({ compliance, isAnchored }) {
  const { dropOff, sprintScenarios, target, best8Total, daysNeeded } = compliance;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <DropOffCard dropOff={dropOff} target={target} best8Total={best8Total} isAnchored={isAnchored} />
      <SprintCard sprintScenarios={sprintScenarios} daysNeeded={daysNeeded} target={target} />
    </div>
  );
}

// ── Drop-off card ──────────────────────────────────────────────────────────────

function DropOffCard({ dropOff, target, best8Total, isAnchored }) {
  if (!dropOff) return null;

  // During the first 12 weeks the window grows — nothing drops off yet
  if (isAnchored) {
    const rollingDate = new Date(MANDATE_START + 'T12:00:00');
    rollingDate.setDate(rollingDate.getDate() + 12 * 7);
    const rollingLabel = rollingDate.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
      <div className="rounded-xl border-2 border-blue-700 bg-blue-900/20 p-4">
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xl">📅</span>
          <div>
            <h3 className="font-bold text-white text-sm">Window Growing</h3>
            <p className="text-xs text-gray-400">No weeks drop off yet</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          The 12-week window is anchored to{' '}
          <strong className="text-blue-300">23 Feb 2026</strong> (mandate start). Each Monday a
          new future week becomes active — nothing drops off until the window is full.
        </p>
        <div className="rounded-lg bg-blue-900/30 border border-blue-700/50 px-3 py-2 text-xs text-blue-200">
          Rolling window begins <strong className="text-blue-100">{rollingLabel}</strong>. After
          that, the oldest week drops off each Monday as normal.
        </div>
      </div>
    );
  }

  const { week, wasCounting, projectedTotal, delta } = dropOff;
  const dateLabel = formatDateRange(week.startDate, week.endDate);
  const daysAfter = Math.max(0, target - projectedTotal);

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        wasCounting
          ? 'border-red-700 bg-red-900/20'
          : 'border-gray-600 bg-gray-800/40'
      }`}
    >
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl">{wasCounting ? '⚠️' : '✅'}</span>
        <div>
          <h3 className="font-bold text-white text-sm">
            {wasCounting ? 'Drop-off Alert' : 'Drop-off: No Impact'}
          </h3>
          <p className="text-xs text-gray-400">What happens next Monday</p>
        </div>
      </div>

      {/* Dropping week details */}
      <div
        className={`rounded-lg px-3 py-2 mb-3 text-sm ${
          wasCounting ? 'bg-red-900/40' : 'bg-gray-700/50'
        }`}
      >
        <span className="text-gray-300 font-mono text-xs">{dateLabel}</span>
        <span className="text-gray-400 text-xs">
          {' '}· {week.daysAttended} day{week.daysAttended !== 1 ? 's' : ''} ·{' '}
        </span>
        <span
          className={`text-xs font-bold uppercase ${
            wasCounting ? 'text-red-400' : 'text-gray-500'
          }`}
        >
          {wasCounting ? 'COUNTING' : 'Dead Weight'}
        </span>
      </div>

      {wasCounting ? (
        <>
          <p className="text-sm text-gray-300 mb-3">
            This week <strong className="text-red-300">counts</strong> toward your Best 8. When
            it drops off, your total will fall from{' '}
            <strong className="text-white">{best8Total}</strong> to{' '}
            <strong className={projectedTotal >= target ? 'text-green-400' : 'text-red-400'}>
              {projectedTotal}
            </strong>
            {delta !== 0 && (
              <span className="text-red-400"> ({delta} days)</span>
            )}
            .
          </p>

          {daysAfter > 0 ? (
            <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2 text-xs text-red-300">
              After drop-off you'll need{' '}
              <strong className="text-red-200">{daysAfter} more day{daysAfter !== 1 ? 's' : ''}</strong>{' '}
              to hit {target}. Act this week to stay ahead.
            </div>
          ) : (
            <div className="rounded-lg bg-green-900/30 border border-green-700/50 px-3 py-2 text-xs text-green-300">
              Even after drop-off you'll still be compliant at {projectedTotal} days.
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-400">
          This week was <strong className="text-gray-300">Dead Weight</strong> — it wasn't
          contributing to your Best 8. Losing it has no impact on your total ({best8Total} days
          stays).
        </p>
      )}
    </div>
  );
}

// ── Sprint card ────────────────────────────────────────────────────────────────

function SprintCard({ sprintScenarios, daysNeeded, target }) {
  if (!sprintScenarios) {
    return (
      <div className="rounded-xl border-2 border-gray-600 bg-gray-800/40 p-4 flex items-center justify-center">
        <p className="text-gray-500 text-sm italic">No current week data available.</p>
      </div>
    );
  }

  const { currentWeek, remainingCapacity, scenarios, minDaysToComply } = sprintScenarios;

  const dateLabel = formatDateRange(currentWeek.startDate, currentWeek.endDate);
  const isAlreadyCompliant = daysNeeded === 0;

  return (
    <div className="rounded-xl border-2 border-amber-600/60 bg-amber-900/20 p-4">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl">⚡</span>
        <div>
          <h3 className="font-bold text-white text-sm">Sprint Guide</h3>
          <p className="text-xs text-gray-400">Current week scenarios</p>
        </div>
      </div>

      {/* Current week status */}
      <div className="rounded-lg bg-gray-800/60 px-3 py-2 mb-3 text-sm">
        <span className="text-gray-300 font-mono text-xs">{dateLabel}</span>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-white">
            <strong>{currentWeek.daysAttended}</strong>
            <span className="text-gray-400">/{currentWeek.maxDays} days logged</span>
          </span>
          <span className="text-amber-400 text-xs">
            {remainingCapacity} day{remainingCapacity !== 1 ? 's' : ''} remaining
          </span>
        </div>
      </div>

      {isAlreadyCompliant && minDaysToComply === null ? (
        <div className="rounded-lg bg-green-900/30 border border-green-700/50 px-3 py-2 text-xs text-green-300 mb-3">
          You're already compliant! Any additional days this week are a buffer.
        </div>
      ) : minDaysToComply !== null ? (
        <div className="rounded-lg bg-amber-900/40 border border-amber-600/50 px-3 py-2 text-xs text-amber-200 mb-3">
          Add <strong className="text-amber-100 text-sm">{minDaysToComply}</strong> more day
          {minDaysToComply !== 1 ? 's' : ''} this week → hit {target} ✓
        </div>
      ) : (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 px-3 py-2 text-xs text-red-300 mb-3">
          Even maxing out this week won't hit {target} alone. Keep going next week too.
        </div>
      )}

      {/* Scenario table */}
      {remainingCapacity > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">If you add…</p>
          {scenarios.map((s) => (
            <div
              key={s.extraDays}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                s.hitsTarget
                  ? 'bg-green-900/40 border border-green-600/40'
                  : 'bg-gray-800/60 border border-gray-700/40'
              }`}
            >
              <span className="text-gray-300">
                +{s.extraDays} day{s.extraDays !== 1 ? 's' : ''} → week total{' '}
                <strong className="text-white">{s.totalDays}</strong>
              </span>
              <span className={s.hitsTarget ? 'text-green-400 font-bold' : 'text-gray-400'}>
                Best 8: {s.newBest8Total}
                {s.hitsTarget ? ' ✓' : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {remainingCapacity === 0 && (
        <p className="text-xs text-gray-500 italic">No capacity remaining this week.</p>
      )}
    </div>
  );
}
