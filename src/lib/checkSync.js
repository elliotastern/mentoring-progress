/** Bidirectional sync between progress.checks and progress.worksheets checkboxes.
 *  Foundation fill-ins also derive card-only checks + answers.m*_ keys.
 */

import { sheet_fillin_stats } from "../data/worksheets.js";

export const SYNC_MAP = {
  "module-exit-0": {
    overview: "m0_overview",
    provided: "m0_provided",
    expectations_ws: "m0_expectations",
    communicate: "m0_communicate",
  },
  "module-exit-1": {
    overview: "m1_overview",
    principles: "m1_principles",
    bumps: "m1_bumps",
    goals: "m1_goals",
    roadmap_assess: "m1_roadmap",
    next_steps: "m1_next",
    time_energy: "m1_time",
    habits: "m1_habits",
    optimal: "m1_optimal",
  },
  "module-exit-2": {
    why: "m2_why",
    plan_doc: "m2_plan",
    step_by_step: "m2_steps",
    planning_ws: "m2_worksheet",
    upskill_habit: "m2_habit",
  },
  "module-exit-3": {
    overview: "m3_overview",
    design: "m3_design",
    selling: "m3_selling",
    impact: "m3_impact",
    li_max: "m3_linkedin",
    port_max: "m3_portfolio",
    resume_max: "m3_resume",
    cover_max: "m3_cover",
    portfolio_habit: "m3_habit",
  },
  "community-later": {
    asked_feedback: "m3_slack",
  },
  "tracker-setup": {
    done_columns: "tracker",
    done_row: "tracker",
  },
  linkedin: {
    github_live: "public_proof",
    site_live: "public_proof",
    li_headline: "li_headline",
  },
  "package-match": {
    projects_done: "projects",
    artifact_done: "artifact",
    resume_skills: "resume",
    resume_ats: "resume_ats",
    li_headline: "linkedin",
    github_live: "github",
    site_live: "personal_site",
  },
  "chart-e": {
    verified: "chart_e_score",
    tailored: "tailor",
    applied: "careers_page",
    outreach: "outreach",
    logged: "tracker_fields",
  },
  "networking-scripts": {
    wellfound_done: "wellfound_msg",
  },
  "skills-fork": {
    apply_parallel: "parallel",
    entry_readme: "e1",
    entry_certs: "e2",
    entry_python: "e4",
    mid_assumed: "m1",
    senior_no_tutorials: "s1",
    senior_distribution: "s2",
  },
  "interview-drills": {
    sql_done: "sql",
    case_aloud: "case",
    loop_named: "loop_named",
    drills_habit: "drills_habit",
  },
  "loop-ready": {
    intro_aloud: "recruiter_story",
    sql_set_done: "tech_ready",
    case_story_done: "case_ready",
    car_aloud: "behavioral_ready",
    scripts_aloud: "scripts_ready",
    dayof_done: "dayof_ready",
    notes_fields: "notes_fields",
    note_same_day: "after_screen",
    followup_habit: "after_screen",
  },
  "comp-planning": {
    comp_done: "comp",
    criteria_done: "criteria",
    salary_ready: "salary_ready",
    salary_practiced: "salary_practiced",
    negotiate_done: "negotiate_ready",
    levers_done: "levers_ready",
  },
  "weekly-loop": {
    c_warm: "warm",
    c_li: "li_connect",
    c_careers: "careers_pref",
    c_easy: "easy_zero",
    c_follow: "outreach",
  },
};

/** Checks derived from worksheet fill-ins (community-later is optional / ungated). */
const FILLIN_CHECK_RULES = [
  {
    sheet_id: "community-later",
    check_id: "m0_slack_intro",
    require_all: ["slack_replies", "intro_draft"],
  },
  {
    sheet_id: "community-later",
    check_id: "m5_mock",
    require_all: ["mock_peers"],
  },
  {
    sheet_id: "module-exit-0",
    check_id: "m0_expectations",
    require_all: ["hours_week", "success_outcome"],
  },
  {
    sheet_id: "module-exit-2",
    check_id: "m2_repo",
    require_any: ["project_name", "skip_reason"],
  },
];

function build_reverse() {
  const reverse = {};
  for (const [sheet_id, fields] of Object.entries(SYNC_MAP)) {
    for (const [field_id, check_id] of Object.entries(fields)) {
      if (!reverse[check_id]) reverse[check_id] = [];
      reverse[check_id].push({ sheet_id, field_id });
    }
  }
  return reverse;
}

const REVERSE = build_reverse();

function set_sheet_field(worksheets, sheet_id, field_id, value) {
  return {
    ...worksheets,
    [sheet_id]: {
      ...(worksheets[sheet_id] || {}),
      [field_id]: value,
    },
  };
}

function field_filled(sheet, field_id) {
  return Boolean(String(sheet?.[field_id] || "").trim());
}

function peers_all_true(worksheets, check_id, override) {
  const peers = REVERSE[check_id] || [];
  if (!peers.length) return false;
  return peers.every(({ sheet_id, field_id }) => {
    if (override && override.sheet_id === sheet_id && override.field_id === field_id) {
      return Boolean(override.value);
    }
    return Boolean(worksheets[sheet_id]?.[field_id]);
  });
}

function rule_satisfied(sheet, rule) {
  if (rule.require_all) {
    return rule.require_all.every((id) => field_filled(sheet, id));
  }
  if (rule.require_any) {
    return rule.require_any.some((id) => field_filled(sheet, id));
  }
  return false;
}

function derive_m2_project_answer(sheet) {
  const skip = String(sheet.skip_reason || "").trim();
  if (skip) return skip;
  const name = String(sheet.project_name || "").trim();
  const repo = String(sheet.repo_url || "").trim();
  if (name || repo) return [name, repo].filter(Boolean).join(" — ");
  return "";
}

/** Derive foundation checks + answer_keys from exit worksheet fill-ins. */
export function apply_fillin_derived(progress) {
  const worksheets = progress.worksheets || {};
  const checks = { ...(progress.checks || {}) };
  const answers = { ...(progress.answers || {}) };
  let changed = false;

  for (const rule of FILLIN_CHECK_RULES) {
    const sheet = worksheets[rule.sheet_id] || {};
    const next = rule_satisfied(sheet, rule);
    if (Boolean(checks[rule.check_id]) !== next) {
      checks[rule.check_id] = next;
      changed = true;
    }
  }

  const m1 = worksheets["module-exit-1"] || {};
  const goal = String(m1.primary_goal || "").trim();
  if ((answers.m1_goal || "") !== goal) {
    answers.m1_goal = goal;
    changed = true;
  }

  const m2 = worksheets["module-exit-2"] || {};
  const project = derive_m2_project_answer(m2);
  if ((answers.m2_project || "") !== project) {
    answers.m2_project = project;
    changed = true;
  }

  const m3 = worksheets["module-exit-3"] || {};
  const oneliner = String(m3.one_liner || "").trim();
  if ((answers.m3_oneliner || "") !== oneliner) {
    answers.m3_oneliner = oneliner;
    changed = true;
  }

  const brainstorm = worksheets.brainstorm || {};
  const title = String(brainstorm.primary_title || "").trim();
  if (title && (answers.title || "") !== title) {
    answers.title = title;
    changed = true;
  }
  // Do not auto-tick Aim "primary_title" from answers.title / brainstorm text.
  // Mentee checks that box (or a future worksheet Done checkbox) on purpose.

  // Package stage no longer re-gates Module 3 work: mirror M3 into package check ids
  // so Progress report / worksheets stay consistent without a second checklist.
  if (checks.m3_resume && !checks.resume) {
    checks.resume = true;
    changed = true;
  }
  if (checks.m3_linkedin && !checks.linkedin) {
    checks.linkedin = true;
    changed = true;
  }
  if (checks.m3_portfolio && !checks.github && !checks.personal_site) {
    checks.github = true;
    changed = true;
  }

  const package_match = worksheets["package-match"] || {};
  const proof = String(package_match.best_artifact || "").trim();
  if (proof && (answers.proof_link || "") !== proof) {
    answers.proof_link = proof;
    changed = true;
  }

  const drills = worksheets["interview-drills"] || {};
  const sql_date = String(drills.sql_last_date || "").trim();
  if (sql_date && (answers.sql_date || "") !== sql_date) {
    answers.sql_date = sql_date;
    changed = true;
  }

  const loop = worksheets["loop-ready"] || {};
  const companies = [loop.company_1, loop.company_2, loop.company_3]
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .join(", ");
  if (companies && (answers.next_interview || "") !== companies) {
    answers.next_interview = companies;
    changed = true;
  }

  const comp = worksheets["comp-planning"] || {};
  const walkaway = String(comp.walkaway || "").trim();
  if (walkaway && (answers.walkaway || "") !== walkaway) {
    answers.walkaway = walkaway;
    changed = true;
  }

  if (!changed) return progress;
  return { ...progress, checks, answers, worksheets };
}

export function toggle_main_check(progress, check_id, value) {
  const checks = { ...(progress.checks || {}), [check_id]: value };
  let worksheets = { ...(progress.worksheets || {}) };
  for (const { sheet_id, field_id } of REVERSE[check_id] || []) {
    worksheets = set_sheet_field(worksheets, sheet_id, field_id, value);
  }
  return apply_fillin_derived({ ...progress, checks, worksheets });
}

export function toggle_worksheet_check(progress, sheet_id, field_id, value) {
  let worksheets = set_sheet_field(progress.worksheets || {}, sheet_id, field_id, value);
  const checks = { ...(progress.checks || {}) };
  const check_id = SYNC_MAP[sheet_id]?.[field_id];
  if (check_id) {
    checks[check_id] = peers_all_true(worksheets, check_id, {
      sheet_id,
      field_id,
      value,
    });
  }
  return apply_fillin_derived({ ...progress, checks, worksheets });
}

/** Set a text/textarea worksheet field and derive checks + answers. */
export function set_worksheet_text(progress, sheet_id, field_id, value) {
  const worksheets = set_sheet_field(progress.worksheets || {}, sheet_id, field_id, value);
  return apply_fillin_derived({ ...progress, worksheets });
}

/** OR-merge so either side being true promotes both; then derive fill-ins. */
export function reconcile_checks(progress) {
  let checks = { ...(progress.checks || {}) };
  let worksheets = { ...(progress.worksheets || {}) };
  let changed = false;

  for (const [check_id, peers] of Object.entries(REVERSE)) {
    const main_on = Boolean(checks[check_id]);
    const any_sheet = peers.some(({ sheet_id, field_id }) =>
      Boolean(worksheets[sheet_id]?.[field_id]),
    );
    const should_on = main_on || any_sheet;
    if (should_on !== main_on) {
      checks[check_id] = should_on;
      changed = true;
    }
    if (should_on) {
      for (const { sheet_id, field_id } of peers) {
        if (!worksheets[sheet_id]?.[field_id]) {
          worksheets = set_sheet_field(worksheets, sheet_id, field_id, true);
          changed = true;
        }
      }
    }
  }

  const merged = changed ? { ...progress, checks, worksheets } : progress;
  return apply_fillin_derived(merged);
}

export function sheet_sync_stats(progress, sheet_id) {
  const fields = SYNC_MAP[sheet_id];
  if (!fields) return { done: 0, total: 0 };
  const entries = Object.entries(fields);
  const seen = new Set();
  let done = 0;
  let total = 0;
  for (const [, check_id] of entries) {
    if (seen.has(check_id)) continue;
    seen.add(check_id);
    total += 1;
    if (progress.checks?.[check_id]) done += 1;
  }
  return { done, total };
}

export function reverse_peers(check_id) {
  return REVERSE[check_id] || [];
}

/** Combined check + fill-in progress for a foundation exit worksheet. */
export function sheet_module_stats(progress, sheet_id) {
  const sync = sheet_sync_stats(progress, sheet_id);
  const fill = sheet_fillin_stats(progress, sheet_id);
  return {
    done: sync.done + fill.done,
    total: sync.total + fill.total,
    sync,
    fill,
  };
}
