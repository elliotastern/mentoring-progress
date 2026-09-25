import { STAGES, WEEKLY, STAGE_ORDER, STAGE_SCHEMA } from "../data/stages.js";
import { FOUNDATIONS } from "../data/foundations.js";
import { sheet_fillin_stats, sheet_fillins_complete } from "../data/worksheets.js";
import { role_track_chosen, search_path_chosen, is_search_ready } from "./roleFit.js";

/** Map pre–schema-2 highest_unlocked (old Stages 0–7) → Aim/Package/Apply/Interview/Offer. */
const OLD_UNLOCK_TO_NEW = {
  "0": "0",
  "1": "0",
  "2": "1",
  "3": "2",
  "4": "2",
  "5": "3",
  "6": "3",
  "7": "4",
};

export function migrate_progress_stages(progress) {
  if (!progress || (progress.stage_schema || 0) >= STAGE_SCHEMA) return progress;
  const old = String(progress.highest_unlocked ?? "0");
  let mapped = OLD_UNLOCK_TO_NEW[old];
  if (mapped === undefined) {
    mapped = STAGE_ORDER.includes(old) ? old : "0";
  }
  return {
    ...progress,
    highest_unlocked: mapped,
    stage_schema: STAGE_SCHEMA,
  };
}

function count_checked(checks, items) {
  return items.filter((item) => checks[item.id]).length;
}

/** Portfolio: github OR personal_site counts as one public-home credit. */
function portfolio_check_status(checks, portfolio_items) {
  if (!portfolio_items?.length) {
    return { done: 0, need: 0, ok: true };
  }
  let done = 0;
  for (const item of portfolio_items) {
    if (item.id === "github" || item.id === "personal_site") continue;
    if (checks[item.id]) done += 1;
  }
  if (checks.github || checks.personal_site) done += 1;
  const need = portfolio_items.filter(
    (item) => item.id !== "github" && item.id !== "personal_site",
  ).length + 1;
  return { done, need, ok: done >= need };
}

function answer_ok(answers, key) {
  return Boolean(String(answers[key] || "").trim());
}

function is_foundation(stage) {
  return FOUNDATIONS.some((f) => f.id === stage.id);
}

export function stage_pass_status(stage, progress) {
  const checks = progress.checks || {};
  const answers = progress.answers || {};
  const core_done = count_checked(checks, stage.items);
  const core_ok = core_done >= stage.min_checks;
  const answer_filled = !stage.answer_key || answer_ok(answers, stage.answer_key);

  let channel_ok = true;
  let channel_done = 0;
  if (stage.channel_items) {
    channel_done = count_checked(checks, stage.channel_items);
    channel_ok = channel_done >= (stage.min_channel_checks || 0);
  }

  const portfolio = portfolio_check_status(checks, stage.portfolio_items);
  const portfolio_need = stage.min_portfolio_checks || portfolio.need;
  const portfolio_ok = !stage.portfolio_items || portfolio.done >= portfolio_need;

  let level_ok = true;
  let level_done = 0;
  let level_need = 0;
  if (stage.needs_level) {
    const level = progress.skill_level;
    if (!level || !stage.level_items[level]) {
      level_ok = false;
    } else {
      level_need = stage.level_min[level];
      level_done = count_checked(checks, stage.level_items[level]);
      level_ok = level_done >= level_need;
    }
  }

  let fillins_ok = true;
  let fillin_done = 0;
  let fillin_need = 0;
  const sheet_id = stage.worksheet?.worksheet_id;
  if (is_foundation(stage) && sheet_id) {
    const fill = sheet_fillin_stats(progress, sheet_id);
    fillin_done = fill.done;
    fillin_need = fill.total;
    fillins_ok = sheet_fillins_complete(progress, sheet_id);
  }

  const passed = core_ok && channel_ok && portfolio_ok && level_ok && answer_filled && fillins_ok;
  return {
    passed,
    core_done,
    core_need: stage.min_checks,
    channel_done,
    channel_need: stage.min_channel_checks || 0,
    portfolio_done: portfolio.done,
    portfolio_need,
    level_done,
    level_need,
    answer_filled,
    fillin_done,
    fillin_need,
    fillins_ok,
  };
}

export function weekly_pass_status(progress) {
  const checks = progress.checks || {};
  const tallies = progress.weekly_tallies || {};
  const core_done = count_checked(checks, WEEKLY.items);
  const core_ok = core_done >= WEEKLY.min_checks;
  const tallies_ok = WEEKLY.tallies.every((t) => String(tallies[t.id] || "").trim());
  return {
    passed: core_ok && tallies_ok,
    core_done,
    core_need: WEEKLY.min_checks,
    tallies_ok,
  };
}

/** Module 0–3 exit worksheets complete (ignores role track / path). */
export function modules_foundations_passed(progress) {
  if (progress.foundations_complete) return true;
  const skip_m2 = is_search_ready(progress);
  return FOUNDATIONS.every((f) => {
    if (skip_m2 && f.id === "m2") return true;
    return stage_pass_status(f, progress).passed;
  });
}

export function foundations_passed(progress) {
  const unlocked = progress.highest_unlocked || "0";
  const order = STAGES.map((s) => s.id);
  // Grandfather mentees already past Stage 0
  if (order.indexOf(unlocked) > 0) return true;
  return (
    modules_foundations_passed(progress) &&
    role_track_chosen(progress) &&
    search_path_chosen(progress)
  );
}

export function mark_foundations_if_ready(progress) {
  if (progress.foundations_complete) return progress;
  const skip_m2 = is_search_ready(progress);
  const modules_ok = FOUNDATIONS.every((f) => {
    if (skip_m2 && f.id === "m2") return true;
    return stage_pass_status(f, progress).passed;
  });
  if (!modules_ok) return progress;
  return { ...progress, foundations_complete: true };
}

export function highest_unlocked(progress) {
  return progress.highest_unlocked || "0";
}

export function is_stage_open(stage_id, progress) {
  const current = progress.highest_unlocked || "0";
  const idx = STAGE_ORDER.indexOf(stage_id);
  const cur = STAGE_ORDER.indexOf(current);
  if (idx < 0 || cur < 0) return stage_id === "0";
  return idx <= cur + 1;
}

export function weekly_open(progress) {
  const after = WEEKLY.unlock_after_stage || "2";
  const cur = STAGE_ORDER.indexOf(progress.highest_unlocked || "0");
  const need = STAGE_ORDER.indexOf(after);
  return cur >= 0 && need >= 0 && cur >= need;
}

export function unlock_next(stage, progress) {
  const status = stage_pass_status(stage, progress);
  if (!status.passed) return { ok: false, reason: "Finish required checks and the answer first." };
  if (!stage.unlocks) {
    return {
      ok: true,
      next: progress.highest_unlocked,
      message: "Offer stage complete.",
    };
  }
  const current_idx = STAGE_ORDER.indexOf(progress.highest_unlocked || "0");
  const next_idx = STAGE_ORDER.indexOf(stage.unlocks);
  const highest = next_idx > current_idx ? stage.unlocks : progress.highest_unlocked;
  return { ok: true, next: highest, message: `Unlocked ${stage.unlocks}.` };
}

/** Advance as far as checks/answers allow — no mentor meeting or Unlock click. */
export function auto_unlock_progress(progress) {
  let next = migrate_progress_stages(progress);
  next = mark_foundations_if_ready(next);
  if (!foundations_passed(next)) return next;

  let highest = next.highest_unlocked || "0";
  let guard = 0;
  while (guard < STAGES.length) {
    guard += 1;
    const stage = stage_by_id(highest);
    if (!stage || !stage.unlocks) break;
    if (!stage_pass_status(stage, next).passed) break;
    highest = stage.unlocks;
  }
  if (highest === (next.highest_unlocked || "0") && next === progress) return progress;
  if (highest === (next.highest_unlocked || "0")) return next;
  return { ...next, highest_unlocked: highest };
}

export function empty_progress() {
  return {
    highest_unlocked: "0",
    stage_schema: STAGE_SCHEMA,
    foundations_complete: false,
    checks: {},
    answers: {},
    worksheets: {},
    skill_level: "",
    weekly_tallies: {},
    weekly_of: "",
    weekly_streak: 0,
    weekly_best_streak: 0,
    weekly_history: [],
    progress_snapshots: [],
    updated_at: null,
  };
}

export function stage_by_id(id) {
  return STAGES.find((s) => s.id === id);
}

/** Overall journey progress for the animated header bar. */
export function overall_progress(progress) {
  let done = 0;
  let total = 0;

  function add_stage(stage) {
    const status = stage_pass_status(stage, progress);
    done += Math.min(status.core_done, status.core_need);
    total += status.core_need;
    if (stage.channel_items) {
      done += Math.min(status.channel_done, status.channel_need);
      total += status.channel_need;
    }
    if (stage.portfolio_items) {
      done += Math.min(status.portfolio_done, status.portfolio_need);
      total += status.portfolio_need;
    }
    if (stage.needs_level && progress.skill_level && stage.level_min?.[progress.skill_level]) {
      const need = stage.level_min[progress.skill_level];
      done += Math.min(status.level_done, need);
      total += need;
    }
    if (stage.answer_key && !(is_foundation(stage) && status.fillin_need > 0)) {
      total += 1;
      if (status.answer_filled) done += 1;
    }
    if (is_foundation(stage) && status.fillin_need > 0) {
      total += status.fillin_need;
      done += Math.min(status.fillin_done, status.fillin_need);
    }
  }

  FOUNDATIONS.forEach(add_stage);
  STAGES.forEach(add_stage);

  if (weekly_open(progress) || weekly_pass_status(progress).passed) {
    const w = weekly_pass_status(progress);
    done += Math.min(w.core_done, w.core_need);
    total += w.core_need;
    total += WEEKLY.tallies.length;
    if (w.tallies_ok) done += WEEKLY.tallies.length;
  }

  const percent = total === 0 ? 0 : Math.round((100 * done) / total);
  return { done, total, percent };
}
