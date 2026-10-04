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

function merge_sheet_field(prev_val, next_val, protect) {
  if (typeof next_val === "boolean") {
    if (protect) return next_val === true ? true : prev_val;
    return next_val;
  }
  if (Array.isArray(next_val)) {
    if (protect) {
      // Wipe heal: keep the richer previous rows/traits.
      if (Array.isArray(prev_val) && prev_val.length > 0) return prev_val;
      return next_val.length > 0 ? next_val : prev_val;
    }
    if (next_val.length > 0) return next_val;
    if (Array.isArray(prev_val) && prev_val.length > 0) return prev_val;
    return next_val;
  }
  if (next_val && typeof next_val === "object") {
    return { ...(prev_val || {}), ...next_val };
  }
  const next_text = String(next_val ?? "").trim();
  const prev_text = String(prev_val ?? "").trim();
  if (protect) {
    // Wipe heal: keep previous non-empty text fields.
    if (prev_text) return prev_val;
    return next_text ? next_val : prev_val;
  }
  return next_val;
}

function merge_sheet_maps(prev_map, next_map, protect) {
  const out = { ...(prev_map || {}) };
  for (const [sid, sheet] of Object.entries(next_map || {})) {
    if (!sheet || typeof sheet !== "object") continue;
    const base = { ...(out[sid] || {}) };
    for (const [fid, val] of Object.entries(sheet)) {
      base[fid] = merge_sheet_field(base[fid], val, protect);
    }
    out[sid] = base;
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
    if (k === "role_tracks") {
      const prev_tracks = Array.isArray(answers.role_tracks) ? answers.role_tracks : [];
      const next_tracks = Array.isArray(v) ? v : [];
      if (protect) {
        // Wipe heal only: keep every prior track id (thin seed must not erase AI Researcher).
        // Normal toggles/deselection use next as-is below.
        const seen = new Set();
        const union = [];
        for (const id of [...prev_tracks, ...next_tracks]) {
          const key = String(id || "").trim();
          if (!key || seen.has(key)) continue;
          seen.add(key);
          union.push(key);
        }
        answers.role_tracks = union;
      } else {
        answers.role_tracks = next_tracks;
      }
      continue;
    }
    if (protect) {
      if (Array.isArray(v) ? v.length : String(v || "").trim()) answers[k] = v;
    } else {
      answers[k] = v;
    }
  }

  const worksheets = merge_sheet_maps(prev.worksheets, next.worksheets, protect);

  const schema = Math.max(
    Number(prev.stage_schema) || 0,
    Number(next.stage_schema) || 0,
    4,
  );
  const rank_unlock = (id, from_schema) => {
    let u = String(id ?? "0");
    let sch = Number(from_schema) || 0;
    if (sch < 2) {
      const old = {
        "0": "0",
        "1": "0",
        "2": "2",
        "3": "2",
        "4": "2",
        "5": "3",
        "6": "3",
        "7": "4",
      };
      u = old[u] ?? u;
      sch = 2;
    }
    if (sch < 3 && u === "1") u = "2";
    if (sch < 4) {
      const s3 = { "0": "0", "1": "1", "2": "1", "3": "2", "4": "3" };
      u = s3[u] ?? u;
    }
    const order = ["0", "1", "2", "3"];
    const idx = order.indexOf(u);
    return { id: order.includes(u) ? u : "0", rank: idx < 0 ? 0 : idx };
  };
  const a = rank_unlock(prev.highest_unlocked, prev.stage_schema);
  const b = rank_unlock(next.highest_unlocked, next.stage_schema);
  let highest = b.rank >= a.rank ? b.id : a.id;
  if (protect && a.rank > b.rank) highest = a.id;

  return {
    ...prev,
    ...next,
    checks,
    answers,
    worksheets,
    highest_unlocked: highest,
    stage_schema: Math.max(
      Number(prev.stage_schema) || 0,
      Number(next.stage_schema) || 0,
      schema,
    ),
    foundations_complete: Boolean(prev.foundations_complete || next.foundations_complete),
    skill_level: next.skill_level || prev.skill_level || "",
    weekly_tallies: next.weekly_tallies || prev.weekly_tallies || {},
    progress_snapshots: next.progress_snapshots?.length
      ? next.progress_snapshots
      : prev.progress_snapshots || [],
  };
}
