/**
 * rtoCompliance.js – Pure logic module for RTO "Best 8 of 12" compliance.
 *
 * Architecture note: All functions are pure (no side effects, no React imports).
 * To plug in real badge-in data, replace `getMockData()` in rtoMockData.js with
 * a real data-fetching adapter. This module never needs to change.
 */

export const WINDOW_SIZE = 12;
export const BEST_N = 8;

/** The Monday the RTO mandate officially began. Week 1 is always anchored here. */
export const MANDATE_START = '2026-02-23';

/**
 * Returns true while we are still within the first 12 weeks of the mandate.
 * During this period the window grows week-by-week rather than dropping the oldest week.
 */
export function isWindowAnchored(today = new Date()) {
  const d = new Date(today);
  d.setHours(12, 0, 0, 0);
  const dow = d.getDay();
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(d);
  thisMonday.setDate(d.getDate() - daysToMon);

  const mandateMonday = new Date(MANDATE_START + 'T12:00:00');
  const rollingStart = new Date(thisMonday);
  rollingStart.setDate(thisMonday.getDate() - (WINDOW_SIZE - 1) * 7);

  return mandateMonday > rollingStart;
}

/**
 * Week shape:
 * {
 *   id:           string,   // unique key, ISO date of Monday (e.g. "2025-12-08")
 *   startDate:    string,   // ISO "YYYY-MM-DD"
 *   endDate:      string,   // ISO "YYYY-MM-DD"
 *   daysAttended: number,   // 0–5
 *   maxDays:      number,   // max possible office days (default 5; reduce for bank holidays)
 *   isCurrent:    boolean,  // week is in-progress (today falls within it)
 *   isFuture:     boolean,  // week hasn't started yet (not used in base window)
 *   windowPosition: number, // 1 = oldest, 12 = current
 * }
 *
 * ComplianceResult shape: see return value below.
 */

/**
 * Core engine: compute compliance status for a 12-week window.
 *
 * @param {Week[]} weeks  – Exactly 12 weeks, oldest (index 0) → current (index 11)
 * @param {number} target – Compliance target (e.g. 20 or 24)
 * @returns {ComplianceResult}
 */
export function computeCompliance(weeks, target) {
  if (weeks.length !== WINDOW_SIZE) {
    throw new Error(`computeCompliance expects exactly ${WINDOW_SIZE} weeks; got ${weeks.length}`);
  }

  // ── 1. Rank weeks: highest daysAttended first; more-recent breaks ties ──────
  const ranked = weeks
    .map((w, origIndex) => ({ ...w, origIndex }))
    .sort((a, b) =>
      b.daysAttended !== a.daysAttended
        ? b.daysAttended - a.daysAttended
        : b.origIndex - a.origIndex   // more recent index wins ties
    );

  const best8 = ranked.slice(0, BEST_N);
  const deadWeight = ranked.slice(BEST_N);
  const best8Ids = new Set(best8.map((w) => w.id));
  const best8Total = best8.reduce((sum, w) => sum + w.daysAttended, 0);

  // The "boundary" is the attendance count of the 8th-best week (the last one
  // that's still counting). A Dead Weight week needs to exceed this to be promoted.
  const boundaryDays = best8[BEST_N - 1]?.daysAttended ?? 0;

  const daysNeeded = Math.max(0, target - best8Total);
  const isCompliant = best8Total >= target;

  // ── 2. Annotate each week with a visual status ──────────────────────────────
  const annotated = weeks.map((week) => {
    const inBest8 = best8Ids.has(week.id);
    let status;

    if (week.isFuture) {
      status = 'FUTURE';
    } else if (week.isCurrent) {
      // Current week is a SPRINT target unless you're already compliant AND counting
      status = inBest8 && isCompliant ? 'ON_TRACK' : 'SPRINT';
    } else {
      status = inBest8 ? 'COUNTING' : 'DEAD_WEIGHT';
    }

    return { ...week, inBest8, status };
  });

  // ── 3. Drop-off projection ──────────────────────────────────────────────────
  // The oldest week (weeks[0]) will drop off at the start of next week.
  // We simulate replacing it with a brand-new week (0 days) to show impact.
  const droppingWeek = annotated[0];
  const droppingInBest8 = best8Ids.has(droppingWeek.id);

  let dropOff;
  if (droppingInBest8) {
    // Simulate: remove oldest, add fresh week (0 days)
    const simWeeks = [
      ...weeks.slice(1),
      { id: '__incoming__', daysAttended: 0 },
    ].sort((a, b) => b.daysAttended - a.daysAttended);
    const projectedTotal = simWeeks
      .slice(0, BEST_N)
      .reduce((s, w) => s + w.daysAttended, 0);

    dropOff = {
      week: droppingWeek,
      wasCounting: true,
      projectedTotal,
      delta: projectedTotal - best8Total, // negative = loss
    };
  } else {
    dropOff = {
      week: droppingWeek,
      wasCounting: false,
      projectedTotal: best8Total,
      delta: 0,
    };
  }

  // ── 4. Sprint scenario analysis for the current week ───────────────────────
  const currentWeek = annotated.find((w) => w.isCurrent) ?? null;
  let sprintScenarios = null;

  if (currentWeek) {
    const remainingCapacity = currentWeek.maxDays - currentWeek.daysAttended;
    const scenarios = [];

    for (let extra = 1; extra <= remainingCapacity; extra++) {
      // Rebuild the 12-week set with this week boosted by `extra` days
      const sim = weeks.map((w) =>
        w.id === currentWeek.id
          ? { ...w, daysAttended: w.daysAttended + extra }
          : w
      );
      const simBest8Total = sim
        .map((w) => w.daysAttended)
        .sort((a, b) => b - a)
        .slice(0, BEST_N)
        .reduce((s, d) => s + d, 0);

      scenarios.push({
        extraDays: extra,
        totalDays: currentWeek.daysAttended + extra,
        newBest8Total: simBest8Total,
        hitsTarget: simBest8Total >= target,
        delta: simBest8Total - best8Total,
      });
    }

    sprintScenarios = {
      currentWeek,
      remainingCapacity,
      scenarios,
      // Minimum extra days needed to hit target this week
      minDaysToComply: scenarios.find((s) => s.hitsTarget)?.extraDays ?? null,
    };
  }

  return {
    weeks: annotated,
    best8Total,
    best8Ids,
    daysNeeded,
    isCompliant,
    target,
    boundaryDays,
    deadWeightCount: deadWeight.length,
    dropOff,
    sprintScenarios,
  };
}

// ── Date utilities ─────────────────────────────────────────────────────────────

export function formatShortDate(isoStr) {
  const d = new Date(isoStr + 'T12:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export function formatDateRange(startISO, endISO) {
  return `${formatShortDate(startISO)} – ${formatShortDate(endISO)}`;
}

/**
 * Build a fresh 12-week rolling window anchored to `today`.
 *
 * Week 1 is always the week of MANDATE_START (2026-02-23) for the first 12 weeks.
 * Once 12 full weeks have elapsed from the mandate start, the window becomes a
 * standard rolling window (oldest week drops off each Monday as usual).
 *
 * Future weeks (after the current week) are included to pad the array to 12 and
 * are marked isFuture: true with daysAttended: 0.
 *
 * To add bank-holiday awareness: populate `maxDays` per week from an external
 * holiday calendar before calling `computeCompliance`.
 */
export function generateRollingWindow(today = new Date()) {
  const d = new Date(today);
  d.setHours(12, 0, 0, 0);

  // Find the Monday of the current week
  const dow = d.getDay(); // 0=Sun
  const daysToMon = dow === 0 ? 6 : dow - 1;
  const thisMonday = new Date(d);
  thisMonday.setDate(d.getDate() - daysToMon);

  const toISO = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const mandateMonday = new Date(MANDATE_START + 'T12:00:00');

  // Rolling window would start here if there were no mandate anchor
  const rollingStart = new Date(thisMonday);
  rollingStart.setDate(thisMonday.getDate() - (WINDOW_SIZE - 1) * 7);

  // Use the mandate start as week 1 until the rolling window overtakes it
  const windowStart = mandateMonday > rollingStart ? mandateMonday : rollingStart;

  const weeks = [];
  for (let i = 0; i < WINDOW_SIZE; i++) {
    const start = new Date(windowStart);
    start.setDate(windowStart.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 4); // Friday

    const isFuture = start > thisMonday;
    const isCurrent = toISO(start) === toISO(thisMonday);

    weeks.push({
      id: toISO(start),
      startDate: toISO(start),
      endDate: toISO(end),
      daysAttended: 0,
      maxDays: 5,
      isCurrent,
      isFuture,
      windowPosition: i + 1, // 1 = oldest (mandate start), 12 = newest
    });
  }

  return weeks;
}
