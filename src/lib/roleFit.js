/** Transparent role-fit heuristic — suggestion only; mentee/mentor picks a pill. */

export const ROLE_TRACKS = [
  { id: "da", label: "Data Analyst" },
  { id: "ds", label: "Data Scientist" },
  { id: "mle", label: "ML Engineer" },
  { id: "de", label: "Data Engineer" },
  { id: "ai_research", label: "AI Researcher" },
];

/** Module 2 proof type by role track. */
export const PROOF_BY_TRACK = {
  da: "dashboard / BI proof",
  ds: "analysis + modeling notebook",
  mle: "served model / inference API",
  de: "pipeline / warehouse job",
  ai_research: "reproducible experiment",
};

export const SEARCH_PATHS = [
  {
    id: "search_ready",
    label: "Search-ready",
    hint: "Skip heavy project build — Module 2 optional",
  },
  {
    id: "build_proof",
    label: "Build-proof",
    hint: "Complete Module 2 with role-specific proof",
  },
];

export const YEARS_OPTIONS = ["0–1", "1–3", "3–5", "5+"];
export const SKILL_OPTIONS = ["None", "Basic", "Solid", "Strong"];

export function proof_label_for_track(track_id) {
  return PROOF_BY_TRACK[track_id] || "role-specific portfolio proof";
}

export function search_path_chosen(progress) {
  const path = String(progress?.answers?.search_path || "").trim();
  return path === "search_ready" || path === "build_proof";
}

export function is_search_ready(progress) {
  return String(progress?.answers?.search_path || "").trim() === "search_ready";
}

const TIE_ORDER = ["da", "ds", "de", "mle", "ai_research"];

const KEYWORD_BOOSTS = [
  { re: /\banalyst\b|tableau|power\s*bi|looker|metrics?\b/i, add: { da: 3 } },
  { re: /\bpipeline\b|\betl\b|spark|airflow|dbt|warehouse/i, add: { de: 4 } },
  { re: /\bmlops\b|deploy|serving|inference|kubernetes/i, add: { mle: 4 } },
  { re: /\bresearch\b|\bphd\b|\bpaper\b|arxiv/i, add: { ai_research: 4 } },
  { re: /\bmodel\b|xgboost|pytorch|tensorflow|sklearn/i, add: { ds: 2, mle: 2 } },
];

function skill_level(value) {
  const i = SKILL_OPTIONS.indexOf(value);
  return i < 0 ? 0 : i;
}

function empty_scores() {
  return { da: 0, ds: 0, mle: 0, de: 0, ai_research: 0 };
}

function apply_skills(scores, python, sql, r) {
  const py = skill_level(python);
  const sq = skill_level(sql);
  const rr = skill_level(r);
  if (sq >= 2) {
    scores.da += sq;
    scores.de += sq;
  }
  if (py >= 2) {
    scores.ds += py;
    scores.mle += py;
    scores.de += py - 1;
  }
  if (rr >= 2) {
    scores.da += rr;
    scores.ds += rr;
  }
}

function apply_years(scores, years) {
  if (years === "3–5") {
    scores.de += 1;
    scores.mle += 1;
    scores.ai_research += 1;
  }
  if (years === "5+") {
    scores.de += 2;
    scores.mle += 2;
    scores.ai_research += 2;
    scores.ds += 1;
  }
  if (years === "0–1" || years === "1–3") {
    scores.da += 1;
  }
}

function apply_keywords(scores, past_jobs) {
  const text = String(past_jobs || "");
  for (const row of KEYWORD_BOOSTS) {
    if (!row.re.test(text)) continue;
    for (const [id, n] of Object.entries(row.add)) scores[id] += n;
  }
}

function reason_bits(inputs, winner) {
  const bits = [];
  if (skill_level(inputs.role_sql) >= 2) bits.push("SQL");
  if (skill_level(inputs.role_python) >= 2) bits.push("Python");
  if (skill_level(inputs.role_r) >= 2) bits.push("R");
  const past = String(inputs.role_past_jobs || "").toLowerCase();
  if (/pipeline|etl|spark|airflow|dbt/.test(past)) bits.push("pipelines");
  if (/analyst|tableau|power bi|looker/.test(past)) bits.push("analytics");
  if (/mlops|deploy|serving/.test(past)) bits.push("ML systems");
  if (/research|phd|paper/.test(past)) bits.push("research");
  if (/model|pytorch|xgboost/.test(past)) bits.push("modeling");
  if (inputs.role_years === "5+" || inputs.role_years === "3–5") bits.push("experience");
  if (!bits.length) bits.push("a balanced starter profile");
  const label = ROLE_TRACKS.find((t) => t.id === winner)?.label || winner;
  return `Suggested: ${label} (based on ${bits.slice(0, 3).join(" + ")})`;
}

/** @returns {{ id: string|null, reason: string, scores: object, ready: boolean }} */
export function suggest_role_track(inputs) {
  const years = inputs.role_years || "";
  const python = inputs.role_python || "";
  const sql = inputs.role_sql || "";
  const r = inputs.role_r || "";
  const ready = Boolean(years && python && sql && r);
  if (!ready) {
    return {
      id: null,
      reason: "Add years + Python / SQL / R to see a suggestion.",
      scores: empty_scores(),
      ready: false,
    };
  }
  const scores = empty_scores();
  apply_skills(scores, python, sql, r);
  apply_years(scores, years);
  apply_keywords(scores, inputs.role_past_jobs);

  let best = TIE_ORDER[0];
  let best_score = -1;
  for (const id of TIE_ORDER) {
    if (scores[id] > best_score) {
      best_score = scores[id];
      best = id;
    }
  }
  return {
    id: best,
    reason: reason_bits(inputs, best),
    scores,
    ready: true,
  };
}

export function role_track_chosen(progress) {
  return Boolean(String(progress?.answers?.role_track || "").trim());
}
