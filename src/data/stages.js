/** Stage definitions — worksheet_id opens a private fill-in form (login only).
 *
 * Deferred Job Search pieces (Interview, Offer, Weekly Loop, Aim/Apply extras)
 * live in repo-root later/ and are not shown on the site. See later/README.md.
 */

function overview(hash, label = "Guide") {
  return { href: `docs/view.html?doc=overview-v8.md#${hash}`, label };
}

function ws(id, label = "Worksheet") {
  return { worksheet_id: id, label };
}

/** Job Search path labels for the Module 4 strip (live stages only). */
export const STAGE_PATH = [
  { id: "0", short: "Setup" },
  { id: "1", short: "Apply" },
];

/**
 * Schema 4: Aim / Apply live on site. Interview / Offer ids still reserved in
 * STAGE_ORDER for unlock migration; stage defs live in later/job-search.js.
 */
export const STAGE_SCHEMA = 4;

export const STAGES = [
  {
    id: "0",
    title: "Aim",
    unlocks: "1",
    min_checks: 1,
    /** Brainstorm lives under Module 4 Setup / Pre Requirements. */
    worksheet: ws("brainstorm", "Worksheet · Next position brainstorm"),
    extra_sheets: [],
    items: [
      {
        id: "tracker",
        label: "Job tracker ready (company, role, source, status, next follow-up)",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
      },
    ],
  },
  {
    id: "1",
    title: "Apply",
    unlocks: null,
    unlocks_weekly: false,
    min_checks: 5,
    /** Sheets + checks render flat under Module 4 Apply loop. */
    worksheet: ws("company-fit", "Worksheet · Company Fit (includes Job effort)"),
    extra_sheets: [
      ws("job-optimizer", "Worksheet · Weekly Application Dashboard"),
      ws("networking-scripts", "Worksheet · Networking scripts"),
    ],
    items: [
      {
        id: "job_optimizer_plan",
        label: "Open Weekly Application Dashboard and set this week's hours",
        sheet: ws("job-optimizer"),
        doc: overview("the-numbers-chart-a-practical-payoff"),
      },
      {
        id: "find_posting",
        label: "Find a posting on a ranked channel",
        doc: overview("apply-loop"),
      },
      {
        id: "verify_careers",
        label: "Verify posting on the employer careers page",
        doc: overview("apply-loop"),
      },
      {
        id: "score_effort",
        label: "Score Job effort (6+ to continue)",
        sheet: ws("company-fit"),
        doc: overview("before-you-apply-chart-e-effort-score-0-10"),
      },
      {
        id: "tailor_apply",
        label: "Tailor resume top + apply on careers page",
        doc: overview("apply-loop"),
      },
      {
        id: "human_note",
        label: "Send one human note",
        sheet: ws("networking-scripts"),
        doc: overview("apply-loop"),
      },
      {
        id: "tracker_fields",
        label: "Log company, role, source, Job effort score, stage, and follow-up",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
      },
    ],
  },
];

/**
 * Empty Weekly stub so gates / progressReport keep importing without showing UI.
 * Full Weekly Loop definition: later/job-search.js → WEEKLY_LOOP.
 */
export const WEEKLY = {
  id: "W",
  title: "Weekly Loop",
  min_checks: 0,
  unlock_after_stage: null,
  items: [],
  tallies: [],
};

/** Unlock order includes deferred Interview/Offer so old progress does not clamp to Aim. */
export const STAGE_ORDER = ["0", "1", "2", "3"];

/** All live Job Search stages; locked ones are peek-only until unlocked. */
export function visible_stages(_progress) {
  return STAGES;
}

export function stage_is_locked(stage_id, progress) {
  const current = progress.highest_unlocked || "0";
  const cur = STAGE_ORDER.indexOf(current);
  const idx = STAGE_ORDER.indexOf(stage_id);
  if (idx < 0) return true;
  // Deferred stages (2–3) stay locked while not in STAGES.
  if (!STAGES.some((s) => s.id === stage_id)) return true;
  return idx > cur;
}
