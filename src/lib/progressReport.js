import { STAGES, WEEKLY } from "../data/stages.js";
import { MODULES } from "../data/foundations.js";
import { WORKSHEETS, sheet_fillin_stats } from "../data/worksheets.js";
import { stage_pass_status, weekly_open } from "./gates.js";
import { is_search_ready } from "./roleFit.js";
import { sheet_module_stats } from "./checkSync.js";
import { streak_drivers_met, tally_goal_met, tally_number } from "./weeklyStreak.js";

function stage_by_id(id) {
  return STAGES.find((s) => s.id === id);
}

function pct(done, need) {
  if (!need) return 0;
  return Math.round((100 * Math.min(done, need)) / need);
}

function check_line(checks, id, label, fold_id = "") {
  return {
    id,
    label,
    done: Boolean(checks[id]),
    work: { kind: "check", id, fold_id },
  };
}

function field_done(answers, field) {
  if (field.type === "checkbox") return Boolean(answers[field.id]);
  return Boolean(String(answers[field.id] || "").trim());
}

function sheet_content_stats(progress, sheet) {
  const module_stats = sheet_module_stats(progress, sheet.id);
  if (module_stats.total > 0) return module_stats;
  const fill = sheet_fillin_stats(progress, sheet.id);
  if (fill.total > 0) return { done: fill.done, total: fill.total };
  const answers = progress.worksheets?.[sheet.id] || {};
  let done = 0;
  let total = 0;
  for (const section of sheet.sections || []) {
    for (const field of section.fields || []) {
      total += 1;
      if (field_done(answers, field)) done += 1;
    }
  }
  return { done, total };
}

function proof_pillar(progress) {
  const checks = progress.checks || {};
  const stage = stage_by_id("1");
  const status = stage_pass_status(stage, progress);
  // Module 3 owns resume / LinkedIn / public home; Stage 1 Package owns job-matched proof.
  const lines = [
    check_line(checks, "m3_linkedin", "LinkedIn (Module 3)", "mod_m3"),
    check_line(checks, "m3_resume", "Resume (Module 3)", "mod_m3"),
    check_line(checks, "m3_portfolio", "Portfolio / public proof (Module 3)", "mod_m3"),
    check_line(checks, "projects", "Proof projects (Package)", "stage_1"),
    check_line(checks, "artifact", "6-second artifact (Package)", "stage_1"),
  ];
  const m3_ids = ["m3_linkedin", "m3_resume", "m3_portfolio"];
  const proof_ids = ["projects", "artifact"];
  const done =
    m3_ids.filter((id) => checks[id]).length + proof_ids.filter((id) => checks[id]).length;
  const need = m3_ids.length + proof_ids.length;
  return {
    id: "proof",
    label: "Portfolio",
    short_label: "Portfolio",
    percent: pct(done, need),
    done,
    need,
    lines,
    groups: [
      {
        title: "From Module 3",
        lines: lines.filter((l) => m3_ids.includes(l.id)),
      },
      {
        title: "Package match",
        lines: lines.filter((l) => proof_ids.includes(l.id)),
      },
    ],
    detail: `${status.core_done}/${status.core_need} package proof`,
  };
}

function skills_pillar(progress) {
  const checks = progress.checks || {};
  const stage = stage_by_id("4");
  const level = progress.skill_level || "";
  const lines = [];
  let done = 0;
  let need = 0;

  if (level && stage.level_items?.[level]) {
    for (const item of stage.level_items[level]) {
      lines.push(check_line(checks, item.id, item.label, "stage_4"));
      need += 1;
      if (checks[item.id]) done += 1;
    }
  } else {
    // Until a level is chosen, send people to Stage 4 core (always in DOM).
    lines.push(
      check_line(checks, "know_row", "Pick level in Stage 4", "stage_4"),
    );
    need = 1;
    done = checks.know_row ? 1 : 0;
  }

  return {
    id: "skills",
    label: "Skills",
    percent: pct(done, need),
    done,
    need,
    lines,
    detail: level ? `${level} row` : "pick level in Stage 4",
  };
}

function application_pillar(progress) {
  const checks = progress.checks || {};
  const strategy_ids = [
    { id: "chart_e_score", label: "Strategy laid out (Chart E)" },
    { id: "six_plus", label: "Only continue at Chart E 6+" },
    { id: "careers_page", label: "Careers page before apply" },
    { id: "tailor", label: "Tailor résumé to duties" },
    { id: "apply_site", label: "Apply on employer site" },
    { id: "outreach", label: "Role-specific outreach" },
    { id: "tracker_fields", label: "Tracker fields logged" },
    { id: "wellfound_msg", label: "Wellfound message done" },
  ];
  const lines = strategy_ids.map((row) =>
    check_line(checks, row.id, row.label, "stage_3"),
  );
  const done = lines.filter((l) => l.done).length;
  const need = lines.length;
  return {
    id: "application",
    label: "Application Strategy",
    short_label: "Apply",
    percent: pct(done, need),
    done,
    need,
    lines,
    detail: `${done}/${need} apply checks`,
  };
}

function weekly_pillar(progress) {
  const tallies = progress.weekly_tallies || {};
  const drivers = WEEKLY.tallies.filter((t) => t.streak_driver);
  const lines = drivers.map((t) => {
    const value = tally_number(tallies, t.id);
    const met = tally_goal_met(tallies, t);
    return {
      id: t.id,
      label: t.label,
      done: met,
      value,
      goal: t.goal_min,
      detail: `${value} / ${t.goal_min}+`,
      work: { kind: "weekly", id: t.id },
    };
  });
  const goals_hit = lines.filter((l) => l.done).length;
  const streak = Number(progress.weekly_streak) || 0;
  const streak_points = Math.min(2, streak > 0 ? 1 + (streak >= 3 ? 1 : 0) : 0);
  const done = goals_hit + streak_points;
  const need = drivers.length + 2;
  return {
    id: "weekly",
    label: "Weekly Progress",
    percent: pct(done, need),
    done,
    need,
    lines,
    streak,
    best_streak: Number(progress.weekly_best_streak) || 0,
    drivers_met: streak_drivers_met(tallies),
    unlocked: weekly_open(progress),
    detail: streak > 0 ? `${streak} wk streak` : "build a streak",
  };
}

function module_number(foundation_id) {
  const m = String(foundation_id || "").match(/^m(\d+)$/i);
  return m ? m[1] : null;
}

function sheet_line(progress, sheet) {
  const stats = sheet_content_stats(progress, sheet);
  if (!stats.total) return null;
  return {
    id: `ws_${sheet.id}`,
    label: sheet.title,
    done: stats.done >= stats.total,
    detail: `${stats.done}/${stats.total}`,
    work: { kind: "worksheet", id: sheet.id },
    _done_count: Math.min(stats.done, stats.total),
    _need_count: stats.total,
  };
}

function doc_line(checks, item, fold_id, label) {
  const done = Boolean(checks[item.id]);
  return {
    id: `doc_${item.id}`,
    label,
    done,
    work: {
      kind: "doc",
      check_id: item.id,
      href: item.doc.href || "",
      sheet_id: item.sheet?.worksheet_id || "",
      fold_id,
    },
  };
}

function docs_worksheets_pillar(progress) {
  const checks = progress.checks || {};
  const skip_m2 = is_search_ready(progress);
  const sheets_by_id = Object.fromEntries(WORKSHEETS.map((s) => [s.id, s]));
  const used_sheet_ids = new Set();
  const lines = [];
  const groups = [];
  let doc_done = 0;
  let doc_need = 0;
  let sheet_done = 0;
  let sheet_need = 0;

  function take_sheet(sheet_id) {
    if (!sheet_id || used_sheet_ids.has(sheet_id)) return null;
    if (skip_m2 && sheet_id === "module-exit-2") return null;
    const sheet = sheets_by_id[sheet_id];
    if (!sheet) return null;
    const line = sheet_line(progress, sheet);
    if (!line) return null;
    used_sheet_ids.add(sheet_id);
    sheet_need += line._need_count;
    sheet_done += line._done_count;
    delete line._done_count;
    delete line._need_count;
    return line;
  }

  for (const f of MODULES) {
    if (skip_m2 && f.id === "m2") continue;
    const mod = module_number(f.id);
    const group_lines = [];
    let step = 0;
    for (const item of f.items || []) {
      if (!item.doc) continue;
      step += 1;
      doc_need += 1;
      const done = Boolean(checks[item.id]);
      if (done) doc_done += 1;
      const label = mod
        ? `${mod}.${step} (${item.label})`
        : item.label;
      const line = doc_line(checks, item, `mod_${f.id}`, label);
      group_lines.push(line);
      lines.push(line);
    }
    const exit_id = f.worksheet?.worksheet_id;
    const exit_line = take_sheet(exit_id);
    if (exit_line) {
      group_lines.push(exit_line);
      lines.push(exit_line);
    }
    if (group_lines.length) {
      groups.push({ title: f.title, lines: group_lines });
    }
  }

  const stage_lines = [];
  function add_stage_docs(items, fold_id) {
    for (const item of items || []) {
      if (!item.doc) continue;
      doc_need += 1;
      const done = Boolean(checks[item.id]);
      if (done) doc_done += 1;
      const line = doc_line(checks, item, fold_id, item.label);
      stage_lines.push(line);
      lines.push(line);
    }
  }
  for (const s of STAGES) {
    add_stage_docs(s.items, `stage_${s.id}`);
    add_stage_docs(s.portfolio_items, `stage_${s.id}`);
    add_stage_docs(s.channel_items, `stage_${s.id}`);
  }
  if (stage_lines.length) {
    groups.push({ title: "Job search guides", lines: stage_lines });
  }

  const other_sheets = [];
  for (const sheet of WORKSHEETS) {
    if (used_sheet_ids.has(sheet.id)) continue;
    if (skip_m2 && sheet.id === "module-exit-2") continue;
    const line = take_sheet(sheet.id);
    if (!line) continue;
    other_sheets.push(line);
    lines.push(line);
  }
  if (other_sheets.length) {
    groups.push({ title: "Other worksheets", lines: other_sheets });
  }

  const done = doc_done + sheet_done;
  const need = doc_need + sheet_need;
  return {
    id: "docs",
    label: "Modules",
    short_label: "Modules",
    percent: pct(done, need),
    done,
    need,
    lines,
    groups,
    detail: `${sheet_done}/${sheet_need || 0} worksheet · ${doc_done}/${doc_need || 0} guides`,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * Pick 1 / 2 / 3 week baseline — prefer a real gain, then 2 weeks, then closest snap.
 */
function find_delta_baseline(snapshots, overall, now = Date.now()) {
  if (!Array.isArray(snapshots) || !snapshots.length) return null;

  const candidates = [];
  for (const weeks of [1, 2, 3]) {
    const ideal_age = weeks * WEEK_MS;
    let best = null;
    let best_dist = Infinity;
    for (const snap of snapshots) {
      const at = Date.parse(snap.at || "");
      if (!Number.isFinite(at)) continue;
      const age = now - at;
      if (age < ideal_age - 3.5 * DAY_MS) continue;
      if (age > ideal_age + 5 * DAY_MS) continue;
      const dist = Math.abs(age - ideal_age);
      if (dist < best_dist) {
        best_dist = dist;
        best = snap;
      }
    }
    if (!best) continue;
    const prior = Number(best.overall);
    if (!Number.isFinite(prior)) continue;
    const delta = Math.max(0, Math.round(overall - prior));
    candidates.push({ snap: best, weeks, delta, dist: best_dist });
  }

  if (!candidates.length) {
    let oldest = null;
    for (const snap of snapshots) {
      const at = Date.parse(snap.at || "");
      if (!Number.isFinite(at) || now - at < 3 * DAY_MS) continue;
      if (!oldest || at < Date.parse(oldest.at)) oldest = snap;
    }
    if (!oldest) return null;
    const prior = Number(oldest.overall);
    if (!Number.isFinite(prior)) return null;
    const weeks = Math.max(1, Math.min(3, Math.round((now - Date.parse(oldest.at)) / WEEK_MS)));
    return {
      snap: oldest,
      weeks,
      delta: Math.max(0, Math.round(overall - prior)),
    };
  }

  candidates.sort((a, b) => {
    if ((b.delta > 0) !== (a.delta > 0)) return b.delta > 0 ? 1 : -1;
    if (b.delta !== a.delta) return b.delta - a.delta;
    const pref = (w) => Math.abs(w - 2);
    if (pref(a.weeks) !== pref(b.weeks)) return pref(a.weeks) - pref(b.weeks);
    return a.dist - b.dist;
  });
  return candidates[0];
}

/** Hero progress: equal-weight pillar average + recent gain over 1–3 weeks.
 * Weekly is shown as its own pillar + streak chip, but not in the overall % —
 * it’s a resetting habit loop, not cumulative career progress.
 */
export function progress_report(progress) {
  const pillars = [
    proof_pillar(progress),
    skills_pillar(progress),
    application_pillar(progress),
    weekly_pillar(progress),
    docs_worksheets_pillar(progress),
  ];
  const scored = pillars.filter((p) => p.id !== "weekly");
  const avg = scored.reduce((sum, p) => sum + p.percent, 0) / scored.length;
  const overall = Math.min(100, Math.round(avg));

  const baseline = find_delta_baseline(progress.progress_snapshots, overall);
  const delta = Math.min(baseline?.delta || 0, overall);
  const base_fill = Math.max(0, overall - delta);
  const delta_weeks = baseline?.weeks || 0;
  const delta_text =
    delta > 0 && delta_weeks
      ? delta_weeks === 1
        ? `(+${delta}% this week)`
        : `(+${delta}% past ${delta_weeks} weeks)`
      : "";

  return {
    overall,
    base_fill,
    delta,
    delta_weeks,
    delta_text,
    delta_label: delta_text ? `${overall}% ${delta_text}` : `${overall}%`,
    pillars,
    foundations: { bonus: 0, done: 0, need: 0 },
  };
}

/** Flatten all report lines that have a work target (for tests / tooling). */
export function all_work_lines(progress) {
  const report = progress_report(progress || {});
  const out = [];
  for (const pillar of report.pillars) {
    const lines = pillar.groups?.length
      ? pillar.groups.flatMap((g) => g.lines)
      : pillar.lines || [];
    for (const line of lines) {
      if (!line.work) continue;
      out.push({
        pillar_id: pillar.id,
        line_id: line.id,
        label: line.label,
        work: line.work,
      });
    }
  }
  return out;
}

function snapshot_entry(progress) {
  const report = progress_report(progress);
  return {
    at: new Date().toISOString(),
    overall: report.overall,
    pillars: Object.fromEntries(report.pillars.map((p) => [p.id, p.percent])),
  };
}

/** Daily snapshot upsert — keeps ~4 weeks so 1/2/3-week deltas work. */
export function maybe_snapshot_progress(progress) {
  const history = Array.isArray(progress.progress_snapshots)
    ? [...progress.progress_snapshots]
    : [];
  const entry = snapshot_entry(progress);
  const today = entry.at.slice(0, 10);
  const last = history[history.length - 1];
  if (last && String(last.at || "").slice(0, 10) === today) {
    history[history.length - 1] = entry;
  } else {
    history.push(entry);
  }
  return history.slice(-28);
}

/** Snapshot current report for delta tracking (call on week reset). */
export function snapshot_progress_report(progress) {
  return maybe_snapshot_progress(progress);
}
