/** Weekly Application Dashboard: Channel payoff ranks + greedy minute allocation. */

import { portfolio_package_complete } from "./portfolioFinal.js";

export const PREREQS = [
  {
    id: "know_role",
    label: "I know my job target",
    sync_sheet: "search-ready",
    sync_field: "know_role",
    href: "/",
    doc: "docs/view.html?doc=overview-v8.md#step-1-job-to-target",
  },
  {
    id: "know_companies",
    label: "I know my target companies",
    sync_sheet: "search-ready",
    sync_field: "know_companies",
    href: "?ws=company-fit",
    doc: "docs/view.html?doc=target-companies.md",
  },
  {
    id: "portfolio_optimized",
    label: "Portfolio final submitted (LinkedIn, resume, GitHub, personal site)",
    sync_sheet: "search-ready",
    sync_field: "portfolio_optimized",
    href: "?ws=module-exit-3",
    doc: "docs/view.html?doc=portfolio-package.md",
  },
];

/** Weekly Channel payoff ranks. max_attempts are week caps so high ranks fill a 5-10 hr band first. */
export const STRATEGIES = [
  {
    id: "warm",
    rank: 1,
    name: "Warm lead / referral",
    time_per_attempt: 22,
    time_label: "15-30 min",
    roi: "10/10",
    capacity: "Low-medium",
    max_attempts: 5,
    how: "Ask for a specific intro (role + company), not a vague \"keep me in mind.\" Log each ask as one attempt.",
    details:
      "Referred candidates are hired at about 11 times the rate of standard inbound applicants, and referrals are about 16% of hiring. You only have so many people you know, especially when breaking into an industry, so this runs out quickly. Use alumni, coworkers, clients, classmates, and same-function employees.",
  },
  {
    id: "wellfound",
    rank: 2,
    name: "Wellfound rapid apply + short note",
    time_per_attempt: 3.5,
    time_label: "2-5 min",
    roi: "9.5/10",
    capacity: "High",
    max_attempts: 20,
    how: "Draft a few messages for different job types. Set an email alert and check. Once templates exist, discovery stays short; remaining time buys more applies. Verify on the employer careers page.",
    details:
      "Wellfound / Otta response rates of about 18% to 25% when the note is strong, often routing to founders, engineering leads, or hiring managers rather than a generalist recruiter queue.",
    craft:
      "Low Job effort score fit: 2-3 sentence note. High Job effort score fit: about 6 sentences, value first, then why this company. Template: Hi [Name]. I'm interested in [role] because [specific company/problem reason]. I've built [related system/analysis] and achieved [result]. That could help your team [outcome]. Portfolio: [link]. Still verify on the employer careers page.",
  },
  {
    id: "portfolio",
    rank: 3,
    name: "Updating your portfolio",
    time_per_attempt: 10,
    time_label: "~10 min",
    roi: "9.5/10",
    capacity: "Low / uncontrolled",
    max_attempts: 10,
    baseline_attempts: 3,
    how: "Ship one small proof update: README metric, LinkedIn headline, or site project blurb. Aim for a few short refreshes across the week.",
    details:
      "About 20% of jobs come from inbound, so updating your portfolio raises recruiter outreach and also lifts other applying strategies. Spare time after ranks 1-2 can add more 10-minute blocks.",
  },
  {
    id: "careers",
    rank: 4,
    name: "Careers-page apply + human contact",
    time_per_attempt: 30,
    time_label: "20-40 min",
    roi: "8.5/10",
    capacity: "Medium",
    max_attempts: 6,
    how: "Score with Job effort score, tailor the résumé top, apply on the employer site, send one short human note. Prefer postings within 48 hours when you can.",
    details:
      "Around 6.87% careers-page interview rate in tracked applications. Direct site applies beat mass board clicks; pair each apply with one human contact when you can.",
  },
  {
    id: "agency",
    rank: 5,
    name: "Agency / contract pipeline",
    time_per_attempt: 15,
    time_label: "Low after onboarding",
    roi: "8.5/10 Data Analyst; 8/10 Data Scientist",
    capacity: "Medium",
    max_attempts: 2,
    after_ranks: ["warm", "wellfound", "portfolio", "careers"],
    how: "Look into it after ranks 1-4 are capped for the week (or you cannot fit another higher attempt). Prefer agencies that specialize in your target role.",
    details:
      "Strong when role and agency specialize correctly. Best for data analyst / career switchers (contract-to-hire, project, consulting). Return touches cost less after onboarding.",
  },
  {
    id: "linkedin",
    rank: 6,
    name: "LinkedIn connect → message",
    time_per_attempt: 12,
    time_label: "8-15 min",
    roi: "7.5/10",
    capacity: "Medium",
    max_attempts: 8,
    how: "Connect without a note. After accept, send a custom first line plus role relevance. Cap volume; quality beats spam.",
    details:
      "Mainly creates conversations rather than immediate interviews. Custom first line plus role relevance still beats a cold blast when done well.",
  },
  {
    id: "hm_cold",
    rank: 7,
    name: "Hiring-manager cold outreach",
    time_per_attempt: 22,
    time_label: "15-30 min",
    roi: "7/10",
    capacity: "Medium",
    max_attempts: 5,
    how: "Email the hiring manager or data lead on a live, high-fit role. Keep it short: who you are, one proof line, one ask.",
    details:
      "Highly variable. Better after warm, Wellfound, and careers-page capacity for the week are used, or when you have a clear named lead.",
  },
  {
    id: "selective",
    rank: 8,
    name: "Selective LinkedIn / Indeed apply",
    time_per_attempt: 12,
    time_label: "8-15 min",
    roi: "5-6/10",
    capacity: "High",
    max_attempts: 10,
    how: "Only high-fit posts. Tailor enough to clear the screen. Prefer employer careers page when the same role is listed there.",
    details:
      "Lower conversion than careers-page plus human contact. In one tracked dataset: LinkedIn about 1.95%, Indeed about 2.92%. Use after higher ranks are full, not as the default.",
  },
  {
    id: "easy_apply",
    rank: 9,
    name: "Mass Easy Apply",
    time_per_attempt: 3.5,
    time_label: "2-5 min",
    roi: "3.5/10",
    capacity: "Very high",
    max_attempts: 25,
    opt_in_only: true,
    how: "Only if you opted in: niche / low-competition roles, or top-fit + apply within ~24 hours via alerts.",
    details:
      "Low conversion and high competition. For about 90% of candidates this is not the best strategy. It can work when (1) the role is low-competition (niche, non-tech, small institution), or (2) you are a top-fit candidate and apply within ~24 hours of posting via job alerts.",
  },
];

function strategy_by_id(id) {
  return STRATEGIES.find((s) => s.id === id);
}

export function tried_field_key(strategy_id) {
  return `tried_${strategy_id}`;
}

export function done_field_key(strategy_id) {
  return `done_${strategy_id}`;
}

export function tried_from_worksheet(sheet) {
  const out = {};
  for (const s of STRATEGIES) {
    const raw = sheet?.[tried_field_key(s.id)];
    const n = Number(raw);
    out[s.id] = Number.isFinite(n) && n > 0 ? n : 0;
  }
  return out;
}

export function channel_done_from_worksheet(sheet) {
  const out = {};
  for (const s of STRATEGIES) {
    out[s.id] = Boolean(sheet?.[done_field_key(s.id)]);
  }
  return out;
}

/** Effective tried for room/caps: warm-leads-exhausted treats warm as at max_attempts. */
export function room_tried(tried, channel_done) {
  const out = { ...tried };
  if (channel_done?.warm) {
    const warm = STRATEGIES.find((s) => s.id === "warm");
    out.warm = warm?.max_attempts || 0;
  }
  return out;
}

export function prereqs_from_progress(progress) {
  const sheets = progress?.worksheets || {};
  const checks = progress?.checks || {};
  return PREREQS.map((p) => {
    const from_sheet = Boolean(sheets[p.sync_sheet]?.[p.sync_field]);
    const from_check =
      p.sync_field === "know_role"
        ? Boolean(checks.m4_know_role)
        : p.sync_field === "know_companies"
          ? Boolean(checks.m4_know_companies)
          : p.sync_field === "portfolio_optimized"
            ? portfolio_package_complete(progress) || Boolean(checks.m4_portfolio_ready)
            : false;
    return { ...p, done: from_sheet || from_check };
  });
}

export function prereqs_complete(prereq_rows) {
  return prereq_rows.every((p) => p.done);
}

function tried_count(tried, id) {
  const n = Number(tried?.[id]);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function room_left(strategy, tried, planned) {
  const done = tried_count(tried, strategy.id);
  const extra = planned[strategy.id] || 0;
  return Math.max(0, (strategy.max_attempts || 0) - done - extra);
}

function total_used(strategy, tried, planned) {
  return tried_count(tried, strategy.id) + (planned[strategy.id] || 0);
}

function caps_full(strategy, tried, planned) {
  return total_used(strategy, tried, planned) >= (strategy.max_attempts || 0);
}

function spent_minutes(tried) {
  let spent = 0;
  for (const s of STRATEGIES) {
    spent += tried_count(tried, s.id) * s.time_per_attempt;
  }
  return spent;
}

function make_row(strategy, tried, planned_more, channel_done) {
  const done = tried_count(tried, strategy.id);
  const planned_min =
    Math.round(planned_more * strategy.time_per_attempt * 10) / 10;
  const warm_exhausted = Boolean(channel_done?.warm);
  const exhausted =
    strategy.id === "warm"
      ? warm_exhausted || done >= (strategy.max_attempts || 0)
      : done >= (strategy.max_attempts || 0);
  return {
    id: strategy.id,
    rank: strategy.rank,
    name: strategy.name,
    done,
    channel_done: strategy.id === "warm" ? warm_exhausted : false,
    exhausted,
    planned_more,
    planned_min,
    attempts: planned_more,
    time_label: strategy.time_label,
    time_per_attempt: strategy.time_per_attempt,
    roi: strategy.roi,
    capacity: strategy.capacity,
    how: strategy.how,
    details: strategy.details,
    craft: strategy.craft || "",
    max_attempts: strategy.max_attempts,
    opt_in_only: Boolean(strategy.opt_in_only),
  };
}

/** Active (not exhausted) first by Channel payoff rank; exhausted list stays Channel payoff ranks order. */
export function split_plan_rows(rows) {
  const active = rows
    .filter((r) => !r.exhausted)
    .sort((a, b) => a.rank - b.rank);
  const done = rows
    .filter((r) => r.exhausted)
    .sort((a, b) => a.rank - b.rank);
  return { active, done };
}

/** @deprecated Prefer split_plan_rows. Keeps exhausted after active. */
export function sort_plan_rows(rows) {
  const { active, done } = split_plan_rows(rows);
  return [...active, ...done];
}

/**
 * Allocate remaining weekly minutes across Channel payoff ranks.
 * Depletes capacity from attempts already tried this week.
 * Channel-done flags cap room without inventing spent minutes.
 * @param {{
 *   hours_this_week: number,
 *   tried?: Record<string, number>,
 *   channel_done?: Record<string, boolean>,
 *   include_easy_apply?: boolean,
 *   prereqs_ok?: boolean,
 * }} opts
 */
export function allocate_week(opts) {
  const hours_this_week = Number(opts.hours_this_week) || 0;
  const tried = opts.tried || {};
  const channel_done = opts.channel_done || {};
  const include_easy = Boolean(opts.include_easy_apply);
  const prereqs_ok = opts.prereqs_ok !== false;
  const budget_min = Math.round(hours_this_week * 60 * 10) / 10;
  const raw_spent = spent_minutes(tried);
  const spent_min = Math.min(raw_spent, budget_min);
  const for_room = room_tried(tried, channel_done);

  const empty = {
    ok: false,
    reason: "",
    rows: [],
    active_rows: [],
    done_rows: [],
    leftover_min: 0,
    budget_min,
    spent_min,
    include_easy_apply: include_easy,
  };

  if (!prereqs_ok) {
    return { ...empty, reason: "prereqs", leftover_min: budget_min - spent_min };
  }
  if (hours_this_week <= 0) {
    return { ...empty, reason: "no_time" };
  }

  const warm = strategy_by_id("warm");
  const wf = strategy_by_id("wellfound");
  const port = strategy_by_id("portfolio");
  const careers = strategy_by_id("careers");
  const agency = strategy_by_id("agency");
  const li = strategy_by_id("linkedin");
  const hm = strategy_by_id("hm_cold");
  const selective = strategy_by_id("selective");
  const easy = strategy_by_id("easy_apply");

  const planned = {};
  let remaining = budget_min - spent_min;

  function add_attempts(strategy, count) {
    if (!strategy || count <= 0 || remaining <= 0) return 0;
    if (strategy.opt_in_only && !include_easy) return 0;
    const cost = strategy.time_per_attempt;
    const max_fit = Math.floor(remaining / cost + 1e-9);
    const room = room_left(strategy, for_room, planned);
    const n = Math.min(count, max_fit, room);
    if (n <= 0) return 0;
    planned[strategy.id] = (planned[strategy.id] || 0) + n;
    remaining -= n * cost;
    return n;
  }

  const port_done = tried_count(for_room, "portfolio");
  const port_baseline_need = Math.max(0, (port.baseline_attempts || 1) - port_done);
  const port_reserve = Math.min(remaining, port_baseline_need * port.time_per_attempt);
  remaining -= port_reserve;

  add_attempts(warm, room_left(warm, for_room, planned));
  add_attempts(wf, room_left(wf, for_room, planned));

  remaining += port_reserve;
  add_attempts(port, port_baseline_need);

  add_attempts(careers, room_left(careers, for_room, planned));

  const ranks_1_4_capped =
    caps_full(warm, for_room, planned) &&
    caps_full(wf, for_room, planned) &&
    caps_full(careers, for_room, planned) &&
    total_used(port, for_room, planned) >= (port.baseline_attempts || 1);

  const cannot_fit_higher =
    (room_left(warm, for_room, planned) <= 0 || remaining < warm.time_per_attempt) &&
    (room_left(wf, for_room, planned) <= 0 || remaining < wf.time_per_attempt) &&
    (room_left(careers, for_room, planned) <= 0 || remaining < careers.time_per_attempt);

  if (ranks_1_4_capped || (cannot_fit_higher && remaining >= agency.time_per_attempt)) {
    add_attempts(agency, room_left(agency, for_room, planned));
  }

  add_attempts(li, room_left(li, for_room, planned));
  add_attempts(hm, room_left(hm, for_room, planned));
  add_attempts(selective, room_left(selective, for_room, planned));

  if (caps_full(warm, for_room, planned) && caps_full(wf, for_room, planned)) {
    add_attempts(port, room_left(port, for_room, planned));
  }

  if (include_easy) {
    add_attempts(easy, room_left(easy, for_room, planned));
  }

  const visible = STRATEGIES.filter((s) => !s.opt_in_only || include_easy);
  const rows = sort_plan_rows(
    visible.map((s) => make_row(s, tried, planned[s.id] || 0, channel_done)),
  );
  const { active, done } = split_plan_rows(rows);

  return {
    ok: true,
    reason: "",
    rows,
    active_rows: active,
    done_rows: done,
    leftover_min: Math.round(remaining * 10) / 10,
    budget_min,
    spent_min: Math.round(spent_min * 10) / 10,
    include_easy_apply: include_easy,
  };
}

/** @deprecated Prefer allocate_week. Thin wrapper for old call sites. */
export function allocate_day(opts) {
  const minutes = Number(opts.minutes_today) || 0;
  return allocate_week({
    hours_this_week: minutes / 60,
    tried: opts.tried || {},
    channel_done: opts.channel_done || {},
    include_easy_apply: opts.include_easy_apply,
    prereqs_ok: opts.prereqs_ok,
  });
}

export function format_minutes(n) {
  if (n == null || Number.isNaN(n)) return "0 min";
  const v = Math.round(Number(n) * 10) / 10;
  if (v === Math.floor(v)) return `${v} min`;
  return `${v} min`;
}

export function format_hours(minutes) {
  const m = Number(minutes) || 0;
  const h = Math.round((m / 60) * 10) / 10;
  if (h === Math.floor(h)) return `${h}h`;
  return `${h}h`;
}
