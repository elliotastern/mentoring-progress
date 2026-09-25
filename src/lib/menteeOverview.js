/**
 * Compact mentee snapshot for the Modules “Overview” panel.
 */
import { STAGE_PATH } from "../data/stages.js";
import { FOUNDATIONS } from "../data/foundations.js";
import { stage_pass_status, highest_unlocked, stage_by_id } from "./gates.js";
import {
  selected_role_tracks,
  role_track_labels,
  SEARCH_PATHS,
  SKILL_OPTIONS,
  is_search_ready,
  format_job_by_label,
} from "./roleFit.js";

function answer(progress, key) {
  return String(progress.answers?.[key] || "").trim();
}

function format_job_by(raw) {
  return format_job_by_label(raw) || "—";
}

function format_hours_week(raw) {
  const value = String(raw || "").trim();
  if (!value) return "—";
  return /hr/i.test(value) ? value : `${value} hrs/week`;
}

function sheet(progress, sheet_id, field_id) {
  return String(progress.worksheets?.[sheet_id]?.[field_id] || "").trim();
}

function mark(ok) {
  return ok ? "pass" : "fail";
}

function skill_rank(value) {
  const i = SKILL_OPTIONS.indexOf(value);
  return i < 0 ? 0 : i;
}

/** Strongest RoleFit skills (Solid / Strong), ranked. */
function best_skills(answers) {
  const rows = [
    { id: "sql", label: "SQL", value: answers.role_sql },
    { id: "python", label: "Python", value: answers.role_python },
    { id: "r", label: "R", value: answers.role_r },
  ]
    .map((row) => ({ ...row, rank: skill_rank(row.value) }))
    .filter((row) => row.rank >= 2)
    .sort((a, b) => b.rank - a.rank);
  return rows.map((row) => ({
    label: row.label,
    value: row.value || "—",
  }));
}

function portfolio_rows(checks) {
  const public_home = Boolean(
    checks.m3_portfolio || checks.github || checks.personal_site,
  );
  return [
    { id: "m3_resume", label: "Resume (Module 3)", ok: Boolean(checks.m3_resume) },
    { id: "m3_linkedin", label: "LinkedIn (Module 3)", ok: Boolean(checks.m3_linkedin) },
    {
      id: "public_home",
      label: "Public proof (Module 3)",
      ok: public_home,
    },
    { id: "projects", label: "Proof projects (Package)", ok: Boolean(checks.projects) },
    { id: "artifact", label: "6-second artifact (Package)", ok: Boolean(checks.artifact) },
  ].map((row) => ({ ...row, status: mark(row.ok) }));
}

function module_rows(progress) {
  const skip_m2 = is_search_ready(progress);
  return FOUNDATIONS.map((f) => {
    if (skip_m2 && f.id === "m2") {
      return { id: f.id, label: f.title, ok: true, note: "skipped (Search-ready)", status: "pass" };
    }
    const ok = stage_pass_status(f, progress).passed;
    return { id: f.id, label: f.title, ok, note: "", status: mark(ok) };
  });
}

export function build_mentee_overview(progress) {
  const answers = progress.answers || {};
  const checks = progress.checks || {};
  const tracks = selected_role_tracks(progress);
  const path_id = answer(progress, "search_path");
  const path = SEARCH_PATHS.find((p) => p.id === path_id);
  const title =
    answer(progress, "title") ||
    sheet(progress, "brainstorm", "primary_title") ||
    "";
  const current_id = highest_unlocked(progress);
  const current_stage = stage_by_id(current_id);
  const path_short =
    STAGE_PATH.find((s) => s.id === current_id)?.short || current_stage?.title || current_id;

  const skills_all = [
    { label: "SQL", value: answers.role_sql || "—" },
    { label: "Python", value: answers.role_python || "—" },
    { label: "R", value: answers.role_r || "—" },
  ];

  return {
    job_target: {
      tracks: role_track_labels(tracks),
      title: title || "—",
      path: path?.label || "—",
      years: answers.role_years || "—",
      hours_week: format_hours_week(answers.target_hours_week),
      job_by: format_job_by(answers.job_by),
    },
    skills: {
      best: best_skills(answers),
      all: skills_all,
      level: progress.skill_level || "—",
      focus: answer(progress, "level_focus") || "—",
    },
    portfolio: portfolio_rows(checks),
    modules: module_rows(progress),
    search: {
      stage: path_short,
      stage_title: current_stage?.title || `Stage ${current_id}`,
    },
  };
}
