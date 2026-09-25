import { WEEKLY } from "../data/stages.js";

export function tally_number(tallies, id) {
  const raw = tallies?.[id];
  if (raw === "" || raw == null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export function tally_goal_met(tallies, tally) {
  const min = tally.goal_min ?? 0;
  return tally_number(tallies, tally.id) >= min;
}

export function streak_drivers_met(tallies) {
  return WEEKLY.tallies
    .filter((t) => t.streak_driver)
    .every((t) => tally_goal_met(tallies, t));
}

export function format_tally_value(value, step = 1) {
  const n = Number(value) || 0;
  if (step < 1) {
    const rounded = Math.round(n * 2) / 2;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
  return String(Math.round(n));
}

export function bump_tally(tallies, tally, delta) {
  const step = tally.step ?? 1;
  const cur = tally_number(tallies, tally.id);
  const next = Math.max(0, Math.round((cur + delta * step) * 100) / 100);
  return { ...tallies, [tally.id]: format_tally_value(next, step) };
}

/** Apply streak rules when starting a fresh week. Returns patched progress fields. */
export function apply_week_reset(progress) {
  const tallies = progress.weekly_tallies || {};
  const hit = streak_drivers_met(tallies);
  const prev_streak = Number(progress.weekly_streak) || 0;
  const next_streak = hit ? prev_streak + 1 : 0;
  const best = Math.max(Number(progress.weekly_best_streak) || 0, next_streak);
  const history = Array.isArray(progress.weekly_history)
    ? [...progress.weekly_history]
    : [];

  if (progress.weekly_of || Object.keys(tallies).length) {
    history.push({
      week_of: progress.weekly_of || "",
      tallies: { ...tallies },
      streak_hit: hit,
      passed_at: new Date().toISOString(),
    });
  }

  const next_checks = { ...(progress.checks || {}) };
  WEEKLY.items.forEach((item) => {
    delete next_checks[item.id];
  });

  return {
    checks: next_checks,
    weekly_tallies: {},
    weekly_of: "",
    weekly_streak: next_streak,
    weekly_best_streak: best,
    weekly_history: history.slice(-52),
  };
}
