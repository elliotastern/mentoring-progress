/** Stage definitions — worksheet_id opens a private fill-in form (login only). */

function overview(hash, label = "Guide") {
  return { href: `docs/view.html?doc=overview-v8.md#${hash}`, label };
}

function ws(id, label = "Worksheet") {
  return { worksheet_id: id, label };
}

/** Job Search path labels for the Module 4 strip. */
export const STAGE_PATH = [
  { id: "0", short: "Aim" },
  { id: "1", short: "Package" },
  { id: "2", short: "Apply" },
  { id: "3", short: "Interview" },
  { id: "4", short: "Offer" },
];

/**
 * Schema 2: five stages (Aim / Package / Apply / Interview / Offer).
 * Old 0–7 unlock ids map via migrate_progress_stages in gates.js.
 */
export const STAGE_SCHEMA = 2;

export const STAGES = [
  {
    id: "0",
    title: "Stage 0 — Aim",
    unlocks: "1",
    min_checks: 6,
    answer_label: "Answer — my primary title",
    answer_key: "title",
    worksheet: ws("brainstorm", "Worksheet · Next position brainstorm"),
    extra_sheets: [
      ws("tracker-setup", "Worksheet · Tracker setup"),
      ws("linkedin", "Worksheet · LinkedIn"),
    ],
    items: [
      {
        id: "tracker",
        label: "Job tracker ready (company, role, source, status, next follow-up)",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
      },
      {
        id: "primary_title",
        label: "One primary title chosen (and maybe one stretch title)",
        sheet: ws("brainstorm"),
        doc: overview("step-1-job-to-target"),
      },
      {
        id: "constraints",
        label: "Level, remote/hybrid, industry, and comp floor written down",
        sheet: ws("brainstorm"),
        doc: overview("step-1-job-to-target"),
      },
      {
        id: "must_have",
        label: "Must-have vs nice-to-have split from real job posts",
        sheet: ws("brainstorm"),
        doc: overview("step-1-job-to-target"),
      },
      {
        id: "tiers",
        label: "Company list of 10–15: stretch / stepping stone / sandbox",
        sheet: ws("brainstorm"),
        doc: overview("the-numbers-company-list-10-15"),
      },
      {
        id: "li_headline",
        label: "LinkedIn headline matches the chosen title + public proof home noted",
        sheet: ws("linkedin"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
      },
    ],
  },
  {
    id: "1",
    title: "Stage 1 — Package",
    unlocks: "2",
    min_checks: 2,
    answer_label: "Answer — link to my best proof artifact",
    answer_key: "proof_link",
    worksheet: ws("package-match", "Worksheet · Package match"),
    items: [
      {
        id: "projects",
        label: "1–2 proof projects that look like that job’s day-to-day work",
        sheet: ws("package-match"),
        doc: overview("the-numbers-role-specific-proof"),
      },
      {
        id: "artifact",
        label: "One artifact a stranger can open and understand in about 6 seconds",
        sheet: ws("package-match"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
      },
    ],
  },
  {
    id: "2",
    title: "Stage 2 — Apply",
    unlocks: "3",
    unlocks_weekly: true,
    min_checks: 11,
    min_channel_checks: 4,
    answer_label: "Answer — my Chart E total on the last role I reviewed (0–10)",
    answer_key: "chart_e",
    needs_level: true,
    worksheet: ws("chart-e", "Worksheet · Chart E scorecard"),
    extra_sheets: [ws("skills-fork", "Worksheet · Skills fork")],
    items: [
      {
        id: "chart_e_score",
        label: "I score each role with Chart E (0–10) before spending lots of time",
        sheet: ws("chart-e"),
        doc: overview("before-you-apply-chart-e-effort-score-0-10"),
      },
      {
        id: "six_plus",
        label: "I only keep going when Chart E is 6+ (unless I’m practicing on purpose)",
        sheet: ws("chart-e"),
        doc: overview("the-numbers-chart-e"),
      },
      {
        id: "careers_page",
        label: "I check the employer careers page before I apply",
        sheet: ws("chart-e"),
        doc: overview("step-3a-applying"),
      },
      {
        id: "tailor",
        label: "I rewrite my résumé summary + first bullets to match the job duties",
        sheet: ws("chart-e"),
        doc: overview("step-3a-applying"),
      },
      {
        id: "apply_site",
        label: "I apply on the employer site when practical",
        sheet: ws("weekly-loop"),
        doc: overview("this-week"),
      },
      {
        id: "outreach",
        label: "I send one short role-specific outreach on high-fit roles",
        sheet: ws("networking-scripts"),
        doc: overview("templates"),
      },
      {
        id: "tracker_fields",
        label: "Tracker logs employer, role, source, Chart E, stage, follow-up, outcome",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
      },
      {
        id: "wellfound_msg",
        label: "Wellfound-style outreach message drafted and saved",
        sheet: ws("networking-scripts"),
        doc: overview("wellfound-startup"),
      },
      {
        id: "know_row",
        label: "I know my level row (entry / mid / senior)",
        sheet: ws("skills-fork"),
        doc: overview("step-3b-skill-build-by-seniority-chart-d"),
      },
      {
        id: "cap_hours",
        label: "Skill hours are capped to that row (apply stays primary)",
        sheet: ws("skills-fork"),
        doc: overview("the-numbers-chart-d"),
      },
      {
        id: "parallel",
        label: "I apply in parallel with skill work",
        sheet: ws("skills-fork"),
        doc: overview("path"),
      },
    ],
    channel_items: [
      {
        id: "warm",
        label: "Warm / referral: ask someone you know for a specific intro",
        sheet: ws("networking-scripts"),
        doc: overview("channel-reference"),
      },
      {
        id: "li_connect",
        label: "LinkedIn: connect first (no note), message after accept",
        sheet: ws("networking-scripts"),
        doc: overview("the-numbers-chart-a-offers-per-hour"),
      },
      {
        id: "careers_pref",
        label: "Careers page preferred over Easy Apply",
        sheet: ws("weekly-loop"),
        doc: overview("the-numbers-chart-a-offers-per-hour"),
      },
      {
        id: "cold_cap",
        label: "Cold email capped at 5–10/week (never the main channel)",
        sheet: ws("networking-scripts"),
        doc: overview("appendix-cold-email-secondary-only"),
      },
      {
        id: "easy_zero",
        label: "Easy Apply near zero hours",
        sheet: ws("weekly-loop"),
        doc: overview("the-numbers-chart-a-offers-per-hour"),
      },
    ],
    level_items: {
      entry: [
        {
          id: "e1",
          label: "3–4 end-to-end portfolio projects planned or shipping",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
        {
          id: "e2",
          label: "Each project: messy data → ship → README with problem + metric",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
        {
          id: "e3",
          label: "Certificates are not treated as a substitute for proof",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
        {
          id: "e4",
          label: "Python skill shown in a public project / notebook (not just a course)",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
      ],
      mid: [
        {
          id: "m1",
          label: "SQL/Python treated as assumed (not the skill block)",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
        {
          id: "m2",
          label: "One differentiator chosen (LLM/RAG, experiments, or MLOps awareness)",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
      ],
      senior: [
        {
          id: "s1",
          label: "Near-zero tutorial loops",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
        {
          id: "s2",
          label: "Hours go to distribution + interview drills",
          sheet: ws("skills-fork"),
          doc: overview("the-numbers-chart-d"),
        },
      ],
    },
    level_min: { entry: 4, mid: 2, senior: 2 },
  },
  {
    id: "3",
    title: "Stage 3 — Interview",
    unlocks: "4",
    min_checks: 12,
    answer_label: "Answer — companies I’m ready to interview with (2–3 names)",
    answer_key: "next_interview",
    worksheet: ws("interview-drills", "Worksheet · Interview drills"),
    extra_sheets: [ws("loop-ready", "Worksheet · Loop-ready pack")],
    items: [
      {
        id: "sql",
        label: "~2 hours live SQL under a clock in the last 7 days",
        sheet: ws("interview-drills"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "case",
        label: "One case told as a business decision (not a tech dump) this week",
        sheet: ws("interview-drills"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "loop_named",
        label: "I can name the usual 4–6 round loop",
        sheet: ws("interview-drills"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "drills_habit",
        label: "Interview drills habit on (~2 hrs/wk SQL + case while applying)",
        sheet: ws("interview-drills"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "recruiter_story",
        label: "60-second recruiter intro written + practiced aloud",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "tech_ready",
        label: "Timed SQL warm-up set saved and completed once",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "case_ready",
        label: "One case story drafted (problem → method → decision → result)",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "behavioral_ready",
        label: "3 CAR behavioral stories drafted + practiced aloud",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "scripts_ready",
        label: "Why-this-company + project walk-through written + practiced",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "dayof_ready",
        label: "Day-of pre/post checklist done once (JD terms, 3 Qs, win+fix)",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "notes_fields",
        label: "Tracker can log interviews (round, date, went well, fix next)",
        sheet: ws("loop-ready"),
        doc: overview("the-numbers-tracking-fields"),
      },
      {
        id: "after_screen",
        label: "Same-day note + follow-up once at 7–10 business days",
        sheet: ws("loop-ready"),
        doc: overview("this-week"),
      },
    ],
  },
  {
    id: "4",
    title: "Stage 4 — Offer",
    unlocks: null,
    min_checks: 7,
    answer_label: "Answer — my walk-away / must-have offer line",
    answer_key: "walkaway",
    worksheet: ws("comp-planning", "Worksheet · Comp planning"),
    items: [
      {
        id: "comp",
        label: "Comp range researched for my target title + market",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "criteria",
        label: "Must-have vs nice-to-have offer criteria written",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "salary_ready",
        label: "Expected-salary reply written from my floor",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "salary_practiced",
        label: "Expected-salary defence practiced out loud",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "negotiate_ready",
        label: "Offer negotiate script written (ask once on total package)",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "levers_ready",
        label: "Total-comp levers listed (base, bonus, equity, PTO, start, remote)",
        sheet: ws("comp-planning"),
        doc: overview("step-3d-offer"),
      },
      {
        id: "review",
        label: "I review outcomes every 20–30 qualified apps (or monthly) and adjust channels",
        sheet: ws("outcomes-review"),
        doc: overview("step-3a-applying"),
      },
    ],
  },
];

export const WEEKLY = {
  id: "W",
  title: "Weekly Loop",
  min_checks: 6,
  unlock_after_stage: "2",
  worksheet: ws("weekly-loop", "Worksheet · Weekly apply loop"),
  items: [
    {
      id: "w_warm",
      label: "Warm / referral messages sent (specific intros)",
      sheet: ws("weekly-loop"),
      doc: overview("this-week"),
    },
    {
      id: "w_li",
      label: "LinkedIn: connect without a note → message after accept",
      sheet: ws("networking-scripts"),
      doc: overview("the-numbers-chart-a-offers-per-hour"),
    },
    {
      id: "w_apps",
      label: "4–6 tailored careers-page applies (≤48h when possible)",
      sheet: ws("weekly-loop"),
      doc: overview("this-week"),
    },
    {
      id: "w_follow",
      label: "Follow-ups once at 7–10 business days",
      sheet: ws("networking-scripts"),
      doc: overview("this-week"),
    },
    {
      id: "w_easy",
      label: "Easy Apply capped near zero",
      sheet: ws("weekly-loop"),
      doc: overview("the-numbers-chart-a-offers-per-hour"),
    },
    {
      id: "w_interview",
      label: "Interview drills (~2 hrs)",
      sheet: ws("interview-drills"),
      doc: overview("step-3c-interview-bottleneck"),
    },
    {
      id: "w_skill",
      label: "Skill-gap block (0–4 hrs by level)",
      sheet: ws("skills-fork"),
      doc: overview("the-numbers-chart-d"),
    },
    {
      id: "w_skip",
      label: "Mass Easy Apply / course binge skipped",
      sheet: ws("weekly-loop"),
      doc: overview("this-week"),
    },
  ],
  tallies: [
    { id: "t_warm", label: "Warm / referral", goal: "3–5", goal_min: 3, step: 1 },
    {
      id: "t_apps",
      label: "Weekly applying target",
      goal: "4–6",
      goal_min: 4,
      step: 1,
      streak_driver: true,
    },
    { id: "t_outreach", label: "Direct outreach", goal: "3–5", goal_min: 3, step: 1 },
    {
      id: "t_proof",
      label: "Weekly proof building (hrs)",
      goal: "1–2",
      goal_min: 1,
      step: 0.5,
      streak_driver: true,
    },
  ],
};

export const STAGE_ORDER = STAGES.map((s) => s.id);

/** All Job Search stages are listed; locked ones are peek-only until unlocked. */
export function visible_stages(_progress) {
  return STAGES;
}

export function stage_is_locked(stage_id, progress) {
  const current = progress.highest_unlocked || "0";
  return STAGE_ORDER.indexOf(stage_id) > STAGE_ORDER.indexOf(current);
}
