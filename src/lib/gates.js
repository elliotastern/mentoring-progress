import { STAGES, WEEKLY } from "../data/stages.js";
import { FOUNDATIONS } from "../data/foundations.js";

function count_checked(checks, items) {
  return items.filter((item) => checks[item.id]).length;
}

function answer_ok(answers, key) {
  return Boolean(String(answers[key] || "").trim());
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

  const passed = core_ok && channel_ok && level_ok && answer_filled;
  return {
    passed,
    core_done,
    core_need: stage.min_checks,
    channel_done,
    channel_need: stage.min_channel_checks || 0,
    level_done,
    level_need,
    answer_filled,
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

export function foundations_passed(progress) {
  if (progress.foundations_complete) return true;
  const unlocked = progress.highest_unlocked || "0";
  const order = STAGES.map((s) => s.id);
  // Grandfather mentees already past Stage 0
  if (order.indexOf(unlocked) > 0) return true;
  return FOUNDATIONS.every((f) => stage_pass_status(f, progress).passed);
}

export function mark_foundations_if_ready(progress) {
  if (progress.foundations_complete) return progress;
  if (!FOUNDATIONS.every((f) => stage_pass_status(f, progress).passed)) return progress;
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
