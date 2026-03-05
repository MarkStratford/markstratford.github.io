/**
 * rtoMockData.js – Mock data adapter.
 *
 * ARCHITECTURE NOTE:
 * This is the only file you need to replace when connecting real badge-in data.
 * Swap `getMockData()` with a function that fetches from your HR/access-control
 * system and maps the response to the Week shape defined in rtoCompliance.js.
 *
 * Real data adapter interface:
 *   async function getRealData(today?: Date): Promise<Week[]>
 *   – Must return exactly 12 week objects, oldest first.
 *   – Set isCurrent=true for the week containing today.
 *   – Populate maxDays per week from a bank-holiday calendar for accuracy.
 */

import { generateRollingWindow } from './rtoCompliance';

/**
 * Realistic scenario anchored to the mandate start (2026-02-23, Week 1).
 * Today: 2026-03-04 (Wednesday), so we are in Week 2 of the mandate.
 *
 *  Window: 2026-02-23 (Mon) → 2026-05-15 (Fri)   [first 12 weeks of mandate]
 *
 *  W01  Feb 23–27   3 days  ← COUNTING (completed)
 *  W02  Mar 02–06   1 day   ← SPRINT (current week, Mon logged so far)
 *  W03  Mar 09–13   0 days  ← FUTURE
 *  W04  Mar 16–20   0 days  ← FUTURE
 *  W05  Mar 23–27   0 days  ← FUTURE
 *  W06  Mar 30–Apr3 0 days  ← FUTURE
 *  W07  Apr 06–10   0 days  ← FUTURE
 *  W08  Apr 13–17   0 days  ← FUTURE
 *  W09  Apr 20–24   0 days  ← FUTURE
 *  W10  Apr 27–May1 0 days  ← FUTURE
 *  W11  May 04–08   0 days  ← FUTURE
 *  W12  May 11–15   0 days  ← FUTURE
 *
 *  Best 8 so far: 3+1+0+0+0+0+0+0 = 4  (early days — window grows each week)
 *  Rolling window begins: 2026-05-18 (after 12 weeks have elapsed)
 */
const MOCK_ATTENDANCE = [3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
//                       ^W1 W2  W3→W12 (future)
//                       oldest                          current+future

export function getMockData(today = new Date()) {
  const weeks = generateRollingWindow(today);

  if (weeks.length !== MOCK_ATTENDANCE.length) {
    // Fallback: zero-fill if lengths don't match (shouldn't happen)
    return weeks;
  }

  return weeks.map((week, i) => ({
    ...week,
    daysAttended: MOCK_ATTENDANCE[i],
  }));
}

/**
 * Factory for custom scenarios – useful for testing edge cases.
 * @param {number[]} attendance  Array of 12 day counts (oldest first)
 * @param {Date}     today
 */
export function buildScenario(attendance, today = new Date()) {
  const weeks = generateRollingWindow(today);
  return weeks.map((week, i) => ({
    ...week,
    daysAttended: attendance[i] ?? 0,
  }));
}
