/** Portfolio final package: LinkedIn, resume, GitHub, personal site with submit dates. */

export const PORTFOLIO_FINAL_SHEET = "module-exit-3";

export const PORTFOLIO_PIECES = [
  {
    id: "linkedin",
    label: "LinkedIn",
    flat_url: "linkedin_url",
    shot_check: "shot_linkedin",
    placeholder: "https://www.linkedin.com/in/…",
  },
  {
    id: "resume",
    label: "Resume",
    flat_url: "resume_link",
    shot_check: "shot_resume",
    placeholder: "Google Doc or PDF link",
  },
  {
    id: "github",
    label: "GitHub",
    flat_url: "github_url",
    shot_check: "shot_github",
    placeholder: "https://github.com/…",
  },
  {
    id: "site",
    label: "Personal site",
    flat_url: "site_url",
    shot_check: "shot_site",
    placeholder: "https://…",
  },
];

export function empty_piece() {
  return { url: "", note: "", submitted_at: "" };
}

export function empty_portfolio_final() {
  return {
    linkedin: empty_piece(),
    resume: empty_piece(),
    github: empty_piece(),
    site: empty_piece(),
    package_submitted_at: "",
  };
}

function trim(value) {
  return String(value || "").trim();
}

/** Merge nested portfolio_final with flat URL fields from older saves. */
export function portfolio_final_from_sheet(sheet) {
  const base = empty_portfolio_final();
  const raw = sheet?.portfolio_final && typeof sheet.portfolio_final === "object"
    ? sheet.portfolio_final
    : {};
  const next = {
    ...base,
    package_submitted_at: trim(raw.package_submitted_at),
  };
  for (const piece of PORTFOLIO_PIECES) {
    const nested = raw[piece.id] && typeof raw[piece.id] === "object" ? raw[piece.id] : {};
    const url = trim(nested.url) || trim(sheet?.[piece.flat_url]);
    next[piece.id] = {
      url,
      note: trim(nested.note),
      submitted_at: trim(nested.submitted_at),
    };
  }
  if (!next.package_submitted_at && all_pieces_submitted(next)) {
    const stamps = PORTFOLIO_PIECES.map((p) => next[p.id].submitted_at).filter(Boolean);
    next.package_submitted_at = stamps.sort().slice(-1)[0] || "";
  }
  return next;
}

export function all_pieces_submitted(pf) {
  return PORTFOLIO_PIECES.every((p) => trim(pf?.[p.id]?.submitted_at));
}

export function all_piece_urls_filled(pf) {
  return PORTFOLIO_PIECES.every((p) => trim(pf?.[p.id]?.url));
}

export function portfolio_package_complete(progress) {
  const sheet = progress?.worksheets?.[PORTFOLIO_FINAL_SHEET] || {};
  const pf = portfolio_final_from_sheet(sheet);
  return Boolean(trim(pf.package_submitted_at)) || all_pieces_submitted(pf);
}

export function format_submit_date(iso) {
  const raw = trim(iso);
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function now_iso() {
  return new Date().toISOString();
}

/**
 * Apply draft edits for one piece (url/note) without stamping submitted_at.
 * Syncs flat URL field.
 */
export function with_piece_draft(progress, piece_id, draft) {
  const worksheets = { ...(progress.worksheets || {}) };
  const sheet = { ...(worksheets[PORTFOLIO_FINAL_SHEET] || {}) };
  const pf = portfolio_final_from_sheet(sheet);
  const piece_meta = PORTFOLIO_PIECES.find((p) => p.id === piece_id);
  if (!piece_meta) return progress;

  const url = trim(draft.url);
  const note = trim(draft.note);
  pf[piece_id] = {
    ...pf[piece_id],
    url,
    note,
  };
  sheet.portfolio_final = pf;
  sheet[piece_meta.flat_url] = url;
  worksheets[PORTFOLIO_FINAL_SHEET] = sheet;
  return { ...progress, worksheets };
}

/**
 * Submit one piece: stamp submitted_at, sync flat fields + shot check.
 * When all four are submitted, set package_submitted_at and portfolio gates.
 */
export function submit_portfolio_piece(progress, piece_id, draft) {
  let next = with_piece_draft(progress, piece_id, draft);
  const worksheets = { ...(next.worksheets || {}) };
  const sheet = { ...(worksheets[PORTFOLIO_FINAL_SHEET] || {}) };
  const pf = portfolio_final_from_sheet(sheet);
  const piece_meta = PORTFOLIO_PIECES.find((p) => p.id === piece_id);
  if (!piece_meta) return progress;

  const url = trim(pf[piece_id].url);
  if (!url) return next;

  const stamp = now_iso();
  pf[piece_id] = {
    ...pf[piece_id],
    url,
    note: trim(pf[piece_id].note),
    submitted_at: stamp,
  };
  sheet[piece_meta.flat_url] = url;
  sheet[piece_meta.shot_check] = true;

  if (all_pieces_submitted(pf)) {
    pf.package_submitted_at = stamp;
  }
  sheet.portfolio_final = pf;
  worksheets[PORTFOLIO_FINAL_SHEET] = sheet;
  next = { ...next, worksheets };

  return apply_portfolio_gate_checks(next);
}

/** Submit all four when every URL is filled. Refresh any missing stamps. */
export function submit_portfolio_all(progress, drafts) {
  let next = progress;
  const stamp = now_iso();
  for (const piece of PORTFOLIO_PIECES) {
    const draft = drafts?.[piece.id] || {};
    next = with_piece_draft(next, piece.id, draft);
  }
  const worksheets = { ...(next.worksheets || {}) };
  const sheet = { ...(worksheets[PORTFOLIO_FINAL_SHEET] || {}) };
  const pf = portfolio_final_from_sheet(sheet);
  if (!all_piece_urls_filled(pf)) return next;

  for (const piece of PORTFOLIO_PIECES) {
    const url = trim(pf[piece.id].url);
    pf[piece.id] = {
      ...pf[piece.id],
      url,
      note: trim(pf[piece.id].note),
      submitted_at: stamp,
    };
    sheet[piece.flat_url] = url;
    sheet[piece.shot_check] = true;
  }
  pf.package_submitted_at = stamp;
  sheet.portfolio_final = pf;
  worksheets[PORTFOLIO_FINAL_SHEET] = sheet;
  next = { ...next, worksheets };
  return apply_portfolio_gate_checks(next);
}

/** Set or clear Job Search portfolio gate from package completeness. */
export function apply_portfolio_gate_checks(progress) {
  const complete = portfolio_package_complete(progress);
  const checks = { ...(progress.checks || {}) };
  const worksheets = { ...(progress.worksheets || {}) };
  const search = { ...(worksheets["search-ready"] || {}) };
  const exit = { ...(worksheets[PORTFOLIO_FINAL_SHEET] || {}) };

  checks.m4_portfolio_ready = complete;
  search.portfolio_optimized = complete;
  if (complete) {
    search.m3_linkedin_done = true;
    search.m3_resume_done = true;
    search.m3_portfolio_done = true;
    checks.m3_linkedin = true;
    checks.m3_resume = true;
    checks.m3_portfolio = true;
  }

  worksheets["search-ready"] = search;
  worksheets[PORTFOLIO_FINAL_SHEET] = exit;
  return { ...progress, checks, worksheets };
}
