/** Bidirectional sync between progress.checks and progress.worksheets checkboxes. */

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
    asked_feedback: "m3_slack",
    portfolio_habit: "m3_habit",
  },
  "module-exit-5": {
    prep_script: "prep_system",
    prep_list: "prep_system",
    habit: "m5_habit",
    ready: "m5_exit",
    pre: "m5_pre_post",
    post: "m5_pre_post",
  },
  "module-exit-6": {
    comp_ws: "comp",
    daily_practice: "negotiate",
  },
  "tracker-setup": {
    done_columns: "tracker",
    done_row: "tracker",
  },
  linkedin: {
    github_live: "public_proof",
    site_live: "public_proof",
  },
  "package-match": {
    resume_skills: "resume",
    li_headline: "linkedin",
    public_links: "github",
  },
  "chart-e": {
    verified: "chart_e_score",
    tailored: "tailor",
    applied: "careers_page",
    outreach: "outreach",
    logged: "tracker_fields",
  },
  "skills-fork": {
    apply_parallel: "parallel",
    entry_readme: "e1",
    entry_certs: "e2",
    mid_assumed: "m1",
    senior_no_tutorials: "s1",
    senior_distribution: "s2",
  },
  "interview-drills": {
    case_aloud: "case",
    prep_ready: "prep_system",
  },
  "loop-ready": {
    intro_aloud: "recruiter_story",
    notes_fields: "notes_fields",
  },
  "weekly-loop": {
    c_warm: "warm",
    c_li: "li_connect",
    c_careers: "careers_pref",
    c_easy: "easy_zero",
    c_follow: "outreach",
  },
};

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

export function toggle_main_check(progress, check_id, value) {
  const checks = { ...(progress.checks || {}), [check_id]: value };
  let worksheets = { ...(progress.worksheets || {}) };
  for (const { sheet_id, field_id } of REVERSE[check_id] || []) {
    worksheets = set_sheet_field(worksheets, sheet_id, field_id, value);
  }
  return { ...progress, checks, worksheets };
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
  return { ...progress, checks, worksheets };
}

/** OR-merge so either side being true promotes both. */
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

  if (!changed) return progress;
  return { ...progress, checks, worksheets };
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
