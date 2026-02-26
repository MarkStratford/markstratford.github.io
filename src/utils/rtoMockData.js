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
 * Realistic scenario for today (2026-02-26, Thursday):
 *
 *  Window: 2025-12-08 (Mon) → 2026-02-27 (Fri)
 *
 *  W01  Dec 08–12   3 days  ← COUNTING but drops off next Monday!
 *  W02  Dec 15–19   2 days  ← Dead Weight
 *  W03  Dec 22–26   1 day   ← Dead Weight (Christmas)
 *  W04  Dec 29–Jan2 1 day   ← Dead Weight (New Year)
 *  W05  Jan 05–09   2 days  ← Dead Weight
 *  W06  Jan 12–16   3 days  ← Counting
 *  W07  Jan 19–23   3 days  ← Counting
 *  W08  Jan 26–30   4 days  ← Counting (best week)
 *  W09  Feb 02–06   3 days  ← Counting
 *  W10  Feb 09–13   2 days  ← Dead Weight (borderline)
 *  W11  Feb 16–20   3 days  ← Counting
 *  W12  Feb 23–27   1 day   ← SPRINT (current week, 1 day in so far)
 *
 *  Best 8: W08(4) + W01(3)+W06(3)+W07(3)+W09(3)+W11(3) + W02(2)+W05(2) ... wait
 *  Let me recalculate properly in the engine.
 *
 *  Sorted: 4,3,3,3,3,3,2,2,2,1,1,1
 *  Best 8: 4+3+3+3+3+3+2+2 = 23
 *  Dead Weight: 2,1,1,1
 *
 *  For target 20 → COMPLIANT (23 ≥ 20)
 *  For target 24 → NEED 1 MORE DAY
 *
 *  Drop-off drama: W01 (3 days, COUNTING) drops off next Monday.
 *  After drop-off (assuming new week = 0 days):
 *    New Best 8: 4+3+3+3+3+2+2+2 = 22  (−1 day)
 *    For target 24 → NEED 2 MORE DAYS (got harder!)
 *
 *  Sprint: current week has 4 capacity remaining (Tue–Fri, 1 day logged Mon).
 *  Add 2 more days this week → W12=3 → Best 8 = 24 ✓
 */
const MOCK_ATTENDANCE = [3, 2, 1, 1, 2, 3, 3, 4, 3, 2, 3, 1];
//                       ^W1                               W12^
//                       oldest                          current

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
