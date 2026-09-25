/** Pure progress merge helpers (no Vite env) — safe for node smokes. */

export function progress_signal(progress) {
  if (!progress || typeof progress !== "object") return 0;
  const checks = progress.checks || {};
  const check_n = Object.values(checks).filter(Boolean).length;
  const answers = progress.answers || {};
  const answer_n = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;
  let sheet_n = 0;
  for (const sheet of Object.values(progress.worksheets || {})) {
    if (!sheet || typeof sheet !== "object") continue;
    sheet_n += Object.values(sheet).filter(Boolean).length;
  }
  return check_n * 10 + sheet_n * 2 + answer_n;
}

function true_check_count(progress) {
  return Object.values(progress?.checks || {}).filter(Boolean).length;
}

/** Detect wholesale wipe (tests / seed / pagehide race) vs normal edits. */
export function looks_like_wipe(prev, next) {
  if (!prev || !next) return false;
  const prev_n = true_check_count(prev);
  const next_n = true_check_count(next);
  if (prev_n >= 5 && next_n + 3 < prev_n) return true;
  if (progress_signal(prev) >= 40 && progress_signal(next) + 30 < progress_signal(prev) && next_n <= 3) {
    return true;
  }
  const keys = Object.keys(next.checks || {});
  if (prev_n >= 5 && keys.length <= 2 && keys.every((k) => k.startsWith("_test"))) return true;
  return false;
}

function merge_sheet_maps(prev_map, next_map, protect) {
  const out = { ...(prev_map || {}) };
  for (const [sid, sheet] of Object.entries(next_map || {})) {
    if (!sheet || typeof sheet !== "object") continue;
    if (protect) {
      const base = { ...(out[sid] || {}) };
      for (const [fid, val] of Object.entries(sheet)) {
        if (val === true || val === false) {
          if (val === true) base[fid] = true;
          continue;
        }
        if (String(val || "").trim()) base[fid] = val;
      }
      out[sid] = base;
    } else {
      out[sid] = { ...(out[sid] || {}), ...sheet };
    }
  }
  return out;
}

/**
 * Merge progress so a thinner overwrite cannot erase checked items.
 * Normal edits (including unchecking) still win when not a wipe.
 */
export function merge_progress_never_lose(prev, next) {
  if (!next) return prev || next;
  if (!prev) return next;
  const protect = looks_like_wipe(prev, next);
  let checks;
  if (protect) {
    checks = { ...(prev.checks || {}) };
    for (const [id, val] of Object.entries(next.checks || {})) {
      if (val) checks[id] = true;
    }
  } else {
    checks = { ...(prev.checks || {}), ...(next.checks || {}) };
  }

  const answers = { ...(prev.answers || {}) };
  for (const [k, v] of Object.entries(next.answers || {})) {
    if (protect) {
      if (Array.isArray(v) ? v.length : String(v || "").trim()) answers[k] = v;
    } else {
      answers[k] = v;
    }
  }

  const worksheets = merge_sheet_maps(prev.worksheets, next.worksheets, protect);

  let highest = next.highest_unlocked ?? prev.highest_unlocked ?? "0";
  const a = String(prev.highest_unlocked || "0");
  const b = String(next.highest_unlocked || "0");
  if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
    highest = Number(a) >= Number(b) ? a : b;
  } else if (protect) {
    highest = a;
  }

  return {
    ...prev,
    ...next,
    checks,
    answers,
    worksheets,
    highest_unlocked: highest,
    stage_schema: next.stage_schema ?? prev.stage_schema,
    foundations_complete: Boolean(prev.foundations_complete || next.foundations_complete),
    skill_level: next.skill_level || prev.skill_level || "",
    weekly_tallies: next.weekly_tallies || prev.weekly_tallies || {},
    progress_snapshots: next.progress_snapshots?.length
      ? next.progress_snapshots
      : prev.progress_snapshots || [],
  };
}
