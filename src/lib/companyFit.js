/** Weighted company-fit scores from personal trait priorities. */

import { COMPANY_LIST_TIERS } from "../data/companyList.js";

export const COMPANY_FIT_SHEET_ID = "company-fit";

export const DEFAULT_TRAITS = [
  { id: "wlb", label: "Work/life balance", weight: 5 },
  { id: "culture", label: "Culture", weight: 4 },
  { id: "growth", label: "Career growth", weight: 3 },
  { id: "comp", label: "Compensation", weight: 3 },
  { id: "remote", label: "Remote", weight: 2 },
];

export const SCORE_MIN = 1;
export const SCORE_MAX = 5;
export const WEIGHT_MIN = 1;
export const WEIGHT_MAX = 5;

export const TIER_IDS = ["stretch", "stepping", "sandbox"];
export const TIER_LABELS = {
  stretch: "Stretch",
  stepping: "Stepping",
  sandbox: "Sandbox",
};

export function new_fit_id(prefix = "r") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export const EFFORT_MIN = 0;
export const EFFORT_MAX = 2;

export const EFFORT_ACTIONS = {
  skip: "Skip",
  note: "Apply + one note",
  full: "Full effort",
};

export function empty_effort() {
  return {
    core: "",
    proof: "",
    access: "",
    logistics: "",
  };
}

export function empty_fit_row(company = "") {
  return {
    id: new_fit_id("r"),
    company,
    role: "",
    scores: {},
    interest: "",
    green_flag: "",
    red_flag: "",
    url: "",
    notes: "",
    tier_mode: "auto",
    fit_override: null,
    effort: empty_effort(),
  };
}

function clamp_int(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

const TRAIT_LABEL_ALIASES = {
  comp: "Compensation",
  pay: "Compensation",
  wlb: "Work/life balance",
};

function display_trait_label(id, label, fallback_label) {
  const trimmed = String(label ?? "").trim();
  const short = trimmed.toLowerCase();
  if (id === "comp" || short === "comp" || short === "pay") {
    return "Compensation";
  }
  if (id === "wlb" || short === "wlb") {
    return "Work/life balance";
  }
  if (TRAIT_LABEL_ALIASES[id] && (!trimmed || short === id)) {
    return TRAIT_LABEL_ALIASES[id];
  }
  return trimmed || fallback_label || "Trait";
}

export function normalize_trait(raw, index = 0) {
  const fallback = DEFAULT_TRAITS[index] || DEFAULT_TRAITS[0];
  const id = String(raw?.id || fallback.id || new_fit_id("t"));
  return {
    id,
    label: display_trait_label(id, raw?.label, fallback.label),
    weight: clamp_int(raw?.weight, WEIGHT_MIN, WEIGHT_MAX, fallback.weight ?? 3),
  };
}

function normalize_tier_mode(raw) {
  const mode = String(raw || "auto").trim().toLowerCase();
  if (mode === "auto" || !mode) return "auto";
  if (TIER_IDS.includes(mode)) return mode;
  return "auto";
}

function parse_effort_part(raw) {
  if (raw === undefined || raw === null || raw === "") return "";
  const n = Number(raw);
  if (!Number.isFinite(n)) return "";
  return clamp_int(n, EFFORT_MIN, EFFORT_MAX, EFFORT_MIN);
}

export function normalize_effort(raw) {
  const src = raw && typeof raw === "object" ? raw : {};
  return {
    core: parse_effort_part(src.core),
    proof: parse_effort_part(src.proof),
    access: parse_effort_part(src.access),
    logistics: parse_effort_part(src.logistics),
  };
}

export function normalize_row(raw) {
  const scores = {};
  const incoming = raw?.scores && typeof raw.scores === "object" ? raw.scores : {};
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined || value === null || value === "") continue;
    const n = Number(value);
    if (!Number.isFinite(n)) continue;
    scores[key] = clamp_int(n, SCORE_MIN, SCORE_MAX, SCORE_MIN);
  }
  return {
    id: String(raw?.id || new_fit_id("r")),
    company: String(raw?.company || ""),
    role: String(raw?.role || ""),
    scores,
    interest: String(raw?.interest || ""),
    green_flag: String(raw?.green_flag || ""),
    red_flag: String(raw?.red_flag || ""),
    url: String(raw?.url || ""),
    notes: String(raw?.notes || ""),
    tier_mode: normalize_tier_mode(raw?.tier_mode),
    fit_override: parse_fit_override(raw?.fit_override),
    effort: normalize_effort(raw?.effort),
  };
}

/** Map Interest text (high / med / low) or a 0-2 number to Job effort Interest. */
export function interest_to_effort(interest_text) {
  const raw = String(interest_text || "").trim().toLowerCase();
  if (!raw) return null;
  if (/^(2|high|strongly|want|love)/.test(raw)) return 2;
  if (/^(1|med|medium|ok|acceptable)/.test(raw)) return 1;
  if (/^(0|low|skip|no)/.test(raw)) return 0;
  const n = Number(raw);
  if (Number.isFinite(n)) return clamp_int(n, EFFORT_MIN, EFFORT_MAX, 0);
  return null;
}

/** Map a 1-5 trait score to 0-2 logistics. */
export function trait_to_effort_part(score) {
  if (score === undefined || score === null || score === "") return null;
  const n = Number(score);
  if (!Number.isFinite(n)) return null;
  if (n >= 4) return 2;
  if (n >= 3) return 1;
  return 0;
}

/** Auto Logistics from Compensation / Remote traits only (ignores explicit override). */
export function logistics_auto_from_traits(row, traits) {
  const ids = new Set(["comp", "remote", "pay"]);
  const parts = [];
  for (const trait of traits || []) {
    if (!ids.has(trait.id) && !/pay|remote|comp/i.test(trait.label || "")) continue;
    const mapped = trait_to_effort_part(row?.scores?.[trait.id]);
    if (mapped !== null) parts.push(mapped);
  }
  if (!parts.length) return null;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/** Logistics 0-2: explicit effort field, else average of Compensation + Remote traits. */
export function logistics_effort(row, traits) {
  const explicit = row?.effort?.logistics;
  if (explicit !== "" && explicit !== undefined && explicit !== null) {
    return Number(explicit);
  }
  return logistics_auto_from_traits(row, traits);
}

/** Dropdown label for Logistics Auto, showing the resolved 0-2 from traits. */
export function logistics_auto_label(row, traits) {
  const auto = logistics_auto_from_traits(row, traits);
  if (auto === null) return "Auto (0 · score Compensation/Remote traits)";
  return `Auto (${auto} from Compensation/Remote)`;
}

/** Five Job effort parts (null = not set / Auto with no traits). */
export function effort_parts(row, traits) {
  const effort = normalize_effort(row?.effort);
  return {
    interest: interest_to_effort(row?.interest),
    core: effort.core === "" ? null : Number(effort.core),
    proof: effort.proof === "" ? null : Number(effort.proof),
    access: effort.access === "" ? null : Number(effort.access),
    logistics: logistics_effort(row, traits),
  };
}

/**
 * Job effort 0-10 for a posting row.
 * Interest from Interest text; Core / Proof / Access / Logistics from effort fields
 * (Logistics can fall back to Compensation/Remote traits).
 * Returns null until at least one job-only score is filled.
 */
export function job_effort_score(row, traits) {
  const parts = effort_parts(row, traits);
  const job_only = [parts.core, parts.proof, parts.access].filter((v) => v !== null);
  if (!job_only.length) return null;
  let total = 0;
  for (const part of [parts.interest, parts.core, parts.proof, parts.access, parts.logistics]) {
    total += part === null ? 0 : part;
  }
  return total;
}

export function effort_action(total) {
  if (total === null || total === undefined) return "";
  if (total >= 8) return "full";
  if (total >= 6) return "note";
  return "skip";
}

export function effort_action_label(total) {
  const id = effort_action(total);
  return id ? EFFORT_ACTIONS[id] : "";
}

/** Chip text when Interest is set but Core/Proof/Access are still empty. */
export function effort_incomplete_label(row) {
  if (interest_to_effort(row?.interest) === null) return "";
  const effort = normalize_effort(row?.effort);
  if (effort.core !== "" || effort.proof !== "" || effort.access !== "") return "";
  return "Incomplete · set Core, Proof, or Human access";
}

/** Live part math once a score exists: Interest N + Core N + ... = total/10 · action. */
export function format_effort_breakdown(row, traits) {
  const total = job_effort_score(row, traits);
  if (total === null) return "";
  const parts = effort_parts(row, traits);
  const n = (value) => (value === null ? 0 : value);
  const action = effort_action_label(total);
  return `Interest ${n(parts.interest)} + Core ${n(parts.core)} + Proof ${n(parts.proof)} + Access ${n(parts.access)} + Logistics ${n(parts.logistics)} = ${total}/10 · ${action}`;
}

/** Highest Job effort on any named row (for Apply answer). */
export function latest_job_effort(sheet) {
  let best = null;
  for (const row of sheet?.rows || []) {
    if (!String(row.company || "").trim() && !String(row.role || "").trim()) continue;
    const total = job_effort_score(row, sheet.traits);
    if (total === null) continue;
    if (best === null || total > best) best = total;
  }
  return best;
}

/**
 * Named postings with Job effort 6+, high→low for the weekly apply queue.
 * Each item: id, company, role, url, total, action, action_label.
 */
export function high_effort_jobs(sheet) {
  const traits = sheet?.traits || [];
  const items = [];
  for (const row of sheet?.rows || []) {
    const company = String(row.company || "").trim();
    const role = String(row.role || "").trim();
    if (!company && !role) continue;
    const total = job_effort_score(row, traits);
    if (total === null || total < 6) continue;
    items.push({
      id: row.id,
      company,
      role,
      url: String(row.url || "").trim(),
      total,
      action: effort_action(total),
      action_label: effort_action_label(total),
    });
  }
  items.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.company.localeCompare(b.company);
  });
  return items;
}

export function sync_effort_to_apply(progress) {
  const sheet = company_fit_from_progress(progress);
  const total = latest_job_effort(sheet);
  const answers = { ...(progress.answers || {}) };
  const checks = { ...(progress.checks || {}) };
  if (total !== null) {
    answers.chart_e = String(total);
    if (total >= 6) checks.chart_e_score = true;
  }
  return { ...progress, answers, checks };
}

export function default_company_fit() {
  return {
    traits: DEFAULT_TRAITS.map((t) => ({ ...t })),
    rows: [],
  };
}

export function normalize_company_fit(raw) {
  const traits =
    Array.isArray(raw?.traits) && raw.traits.length > 0
      ? raw.traits.map((t, i) => normalize_trait(t, i))
      : DEFAULT_TRAITS.map((t) => ({ ...t }));
  const rows = Array.isArray(raw?.rows) ? raw.rows.map(normalize_row) : [];
  return { traits, rows };
}

export function company_fit_from_progress(progress) {
  return normalize_company_fit(progress?.worksheets?.[COMPANY_FIT_SHEET_ID]);
}

/**
 * Weighted average of scored traits only.
 * Missing / blank scores are ignored. Returns null if nothing scored.
 */
export function fit_score(row, traits) {
  let weighted = 0;
  let weight_sum = 0;
  for (const trait of traits || []) {
    const raw = row?.scores?.[trait.id];
    if (raw === undefined || raw === null || raw === "") continue;
    const score = Number(raw);
    if (!Number.isFinite(score)) continue;
    const weight = Number(trait.weight);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    weighted += score * weight;
    weight_sum += weight;
  }
  if (weight_sum <= 0) return null;
  return Math.round((weighted / weight_sum) * 10) / 10;
}

/** Manual Fit value (1-5ish). null = use weighted auto Fit. */
export function parse_fit_override(raw) {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 10) / 10;
}

/** Fit used for sort / tiers: manual override wins, else trait average. */
export function row_fit_score(row, traits) {
  const override = parse_fit_override(row?.fit_override);
  if (override !== null) return override;
  return fit_score(row, traits);
}

export function format_fit_score(score) {
  if (score === null || score === undefined) return "";
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

/** Stable high→low sort; unscored rows sink; ties keep relative order. */
export function sorted_rows(rows, traits) {
  return (rows || [])
    .map((row, index) => ({ row, index, score: row_fit_score(row, traits) }))
    .sort((a, b) => {
      const a_null = a.score === null;
      const b_null = b.score === null;
      if (a_null && b_null) return a.index - b.index;
      if (a_null) return 1;
      if (b_null) return -1;
      if (b.score !== a.score) return b.score - a.score;
      return a.index - b.index;
    })
    .map((entry) => entry.row);
}

/**
 * Auto tiers among named companies:
 * - Scored (high→low): top ~3 Stretch, bottom ~3 Sandbox, middle Stepping
 * - Named but unscored: Stepping (provisional) until scored or overridden
 * Returns Map row_id → tier id.
 */
export function assign_auto_tiers(rows, traits) {
  const map = new Map();
  const named = (rows || []).filter((r) => String(r.company || "").trim());
  const scored = sorted_rows(named, traits).filter((r) => row_fit_score(r, traits) !== null);
  const unscored = named.filter((r) => row_fit_score(r, traits) === null);

  const n = scored.length;
  if (n) {
    let stretch_count = Math.min(3, n);
    let sandbox_count = n <= stretch_count ? 0 : Math.min(3, n - stretch_count);
    if (n <= 3) {
      stretch_count = n;
      sandbox_count = 0;
    } else if (n <= 6) {
      stretch_count = Math.min(2, n);
      sandbox_count = Math.min(2, n - stretch_count);
    }
    scored.forEach((row, index) => {
      if (index < stretch_count) map.set(row.id, "stretch");
      else if (index >= n - sandbox_count) map.set(row.id, "sandbox");
      else map.set(row.id, "stepping");
    });
  }

  for (const row of unscored) {
    map.set(row.id, "stepping");
  }
  return map;
}

export function effective_tier(row, auto_map) {
  const mode = normalize_tier_mode(row?.tier_mode);
  if (mode !== "auto") return mode;
  return auto_map?.get(row.id) || "";
}

export function rank_summary(rows, traits) {
  const auto_map = assign_auto_tiers(rows, traits);
  const buckets = { stretch: [], stepping: [], sandbox: [] };
  for (const row of sorted_rows(rows, traits)) {
    const name = String(row.company || "").trim();
    if (!name) continue;
    const tier = effective_tier(row, auto_map);
    if (!tier || !buckets[tier]) continue;
    buckets[tier].push(name);
  }
  return buckets;
}

export function tiers_to_brainstorm_text(rows, traits) {
  const buckets = rank_summary(rows, traits);
  return {
    stretch: buckets.stretch.join("\n"),
    stepping: buckets.stepping.join("\n"),
    sandbox: buckets.sandbox.join("\n"),
  };
}

function tier_has_line(value) {
  return String(value || "")
    .split(/\r?\n/)
    .some((line) => line.trim().length > 0);
}

export function sync_fit_tiers_to_brainstorm(progress) {
  const sheet = company_fit_from_progress(progress);
  const named = (sheet.rows || []).some((r) => String(r.company || "").trim());
  if (!named) return progress;

  const tiers = tiers_to_brainstorm_text(sheet.rows, sheet.traits);
  const brainstorm = {
    ...(progress.worksheets?.brainstorm || {}),
    stretch: tiers.stretch,
    stepping: tiers.stepping,
    sandbox: tiers.sandbox,
  };
  const worksheets = {
    ...(progress.worksheets || {}),
    brainstorm,
  };
  const checks = { ...(progress.checks || {}) };
  if (
    tier_has_line(brainstorm.stretch) &&
    tier_has_line(brainstorm.stepping) &&
    tier_has_line(brainstorm.sandbox)
  ) {
    worksheets["search-ready"] = {
      ...(worksheets["search-ready"] || {}),
      know_companies: true,
    };
    checks.m4_know_companies = true;
  }
  return { ...progress, worksheets, checks };
}

export function company_names_from_brainstorm(brainstorm) {
  const names = [];
  const seen = new Set();
  for (const tier of COMPANY_LIST_TIERS) {
    for (const line of String(brainstorm?.[tier.id] || "").split(/\r?\n/)) {
      const name = line.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
  }
  return names;
}

export function seed_rows_from_names(names) {
  return (names || []).map((company) => empty_fit_row(company));
}

export function can_seed_from_brainstorm(progress, sheet) {
  const has_rows = (sheet?.rows || []).some((r) => String(r.company || "").trim());
  if (has_rows) return false;
  return company_names_from_brainstorm(progress?.worksheets?.brainstorm).length > 0;
}

export function with_company_fit(progress, sheet_data, resort = true) {
  const normalized = normalize_company_fit(sheet_data);
  const rows = resort
    ? sorted_rows(normalized.rows, normalized.traits)
    : normalized.rows;
  let next = {
    ...progress,
    worksheets: {
      ...(progress.worksheets || {}),
      [COMPANY_FIT_SHEET_ID]: {
        traits: normalized.traits,
        rows,
      },
    },
  };
  next = sync_fit_tiers_to_brainstorm(next);
  next = sync_effort_to_apply(next);
  return next;
}
