import { STAGES, WEEKLY } from "../data/stages.js";
import { FOUNDATIONS } from "../data/foundations.js";
import { sheet_fillin_stats, sheet_fillins_complete } from "../data/worksheets.js";
import { role_track_chosen, search_path_chosen, is_search_ready } from "./roleFit.js";

function count_checked(checks, items) {
  return items.filter((item) => checks[item.id]).length;
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

  const passed = core_ok && channel_ok && level_ok && answer_filled && fillins_ok;
  return {
    passed,
    core_done,
    core_need: stage.min_checks,
    channel_done,
    channel_need: stage.min_channel_checks || 0,
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
  if (!foundations_passed(progress)) return false;
  const order = STAGES.map((s) => s.id);
  const unlocked = highest_unlocked(progress);
  return order.indexOf(stage_id) <= order.indexOf(unlocked);
}

export function weekly_open(progress) {
  if (!foundations_passed(progress)) return false;
  const unlocked = highest_unlocked(progress);
  const order = STAGES.map((s) => s.id);
  return order.indexOf(unlocked) >= order.indexOf("4");
}

export function unlock_next(stage, progress) {
  const status = stage_pass_status(stage, progress);
  if (!status.passed) return { ok: false, reason: "Finish required checks and the answer first." };
  if (!stage.unlocks) {
    return {
      ok: true,
      next: progress.highest_unlocked,
      message: "Stage 7 complete.",
    };
  }
  const order = STAGES.map((s) => s.id);
  const current_idx = order.indexOf(progress.highest_unlocked || "0");
  const next_idx = order.indexOf(stage.unlocks);
  const highest = next_idx > current_idx ? stage.unlocks : progress.highest_unlocked;
  return { ok: true, next: highest, message: `Unlocked ${stage.unlocks}.` };
}

/** Advance as far as checks/answers allow — no mentor meeting or Unlock click. */
export function auto_unlock_progress(progress) {
  let next = mark_foundations_if_ready(progress);
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
    foundations_complete: false,
    checks: {},
    answers: {},
    worksheets: {},
    skill_level: "",
    weekly_tallies: {},
    weekly_of: "",
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
