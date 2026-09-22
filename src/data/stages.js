/** Stage definitions — each stage links a fill-in worksheet + Overview/Module guides. */

function overview(hash, label = "Overview") {
  return { href: `docs/view.html?doc=overview-v8.md#${hash}`, label };
}

function sheet(doc, label = "Worksheet") {
  return { href: `docs/view.html?doc=${doc}`, label };
}

function module5(doc, hash, label) {
  const suffix = hash ? `#${hash}` : "";
  return { href: `docs/view.html?doc=${doc}${suffix}`, label };
}

function module6(doc, hash, label) {
  const suffix = hash ? `#${hash}` : "";
  return { href: `docs/view.html?doc=${doc}${suffix}`, label };
}

export const STAGES = [
  {
    id: "0",
    title: "Stage 0 — Setup",
    unlocks: "1",
    min_checks: 3,
    answer_label: "Answer — my tracker link or sheet name",
    answer_key: "tracker",
    worksheet: sheet("ws-tracker-setup.md", "Worksheet · Tracker setup"),
    items: [
      {
        id: "tracker",
        label: "Tracker ready (Teal or Module 4 worksheet) with columns for employer, role, source, stage, follow-up",
        sheet: sheet("ws-tracker-setup.md", "Worksheet"),
        doc: overview("the-numbers-tracking-fields", "Guide"),
      },
      {
        id: "li_headline",
        label: "LinkedIn headline uses draft role keywords (so inbound can find you)",
        sheet: sheet("ws-linkedin.md", "Worksheet"),
        doc: overview("the-numbers-hours-10wk", "Guide"),
      },
      {
        id: "public_proof",
        label: "Public proof home exists (GitHub and/or site URL written down)",
        sheet: sheet("ws-linkedin.md", "Worksheet"),
        doc: overview("step-2-portfolio-resume-for-that-role", "Guide"),
      },
    ],
  },
  {
    id: "1",
    title: "Stage 1 — Target role",
    unlocks: "2",
    min_checks: 4,
    answer_label: "Answer — my primary title",
    answer_key: "title",
    worksheet: sheet("ws-brainstorm.md", "Worksheet · Next position brainstorm"),
    items: [
      {
        id: "primary_title",
        label: "One primary title chosen (+ optional adjacent stretch)",
        sheet: sheet("ws-brainstorm.md", "Worksheet"),
        doc: overview("step-1-job-to-target", "Guide"),
      },
      {
        id: "constraints",
        label: "Level, remote/hybrid, industry, and comp floor written down",
        sheet: sheet("ws-brainstorm.md", "Worksheet"),
        doc: overview("step-1-job-to-target", "Guide"),
      },
      {
        id: "must_have",
        label: "Must-have vs nice-to-have split from real job posts",
        sheet: sheet("ws-brainstorm.md", "Worksheet"),
        doc: overview("step-1-job-to-target", "Guide"),
      },
      {
        id: "tiers",
        label: "Company list of 10–15 named with stretch (~3) / stepping stone (~4–9) / sandbox (~3)",
        sheet: sheet("ws-brainstorm.md", "Worksheet"),
        doc: overview("the-numbers-company-list-1015", "Guide"),
      },
    ],
  },
  {
    id: "2",
    title: "Stage 2 — Package",
    unlocks: "3",
    min_checks: 5,
    answer_label: "Answer — link to my best proof artifact",
    answer_key: "proof_link",
    worksheet: sheet("ws-package-match.md", "Worksheet · Package match"),
    items: [
      {
        id: "resume",
        label: "Resume matched to the target title (summary + top bullets)",
        sheet: sheet("ws-package-match.md", "Worksheet"),
        doc: overview("step-2-portfolio-resume-for-that-role", "Guide"),
      },
      {
        id: "linkedin",
        label: "LinkedIn About + experience matched to that same title",
        sheet: sheet("ws-package-match.md", "Worksheet"),
        doc: overview("step-2-portfolio-resume-for-that-role", "Guide"),
      },
      {
        id: "projects",
        label: "1–2 proof projects that look like that job’s day-to-day work",
        sheet: sheet("ws-package-match.md", "Worksheet"),
        doc: overview("the-numbers-role-specific-proof", "Guide"),
      },
      {
        id: "github",
        label: "GitHub and/or site is public and linked from LinkedIn/resume",
        sheet: sheet("ws-package-match.md", "Worksheet"),
        doc: overview("step-2-portfolio-resume-for-that-role", "Guide"),
      },
      {
        id: "artifact",
        label: "One artifact a stranger in that role can open and understand in ~6 seconds",
        sheet: sheet("ws-package-match.md", "Worksheet"),
        doc: overview("step-2-portfolio-resume-for-that-role", "Guide"),
      },
    ],
  },
  {
    id: "3",
    title: "Stage 3 — Apply system",
    unlocks: "4",
    unlocks_weekly: true,
    min_checks: 7,
    min_channel_checks: 4,
    answer_label: "Answer — my Chart E total on the last role I reviewed (0–10)",
    answer_key: "chart_e",
    worksheet: sheet("ws-chart-e.md", "Worksheet · Chart E scorecard"),
    items: [
      {
        id: "chart_e_score",
        label: "I score each role with Chart E (0–2 × five factors) before investing time",
        sheet: sheet("ws-chart-e.md", "Worksheet"),
        doc: overview("before-you-apply-chart-e-effort-score-010", "Guide"),
      },
      {
        id: "six_plus",
        label: "I only continue when total is 6+ (unless intentional practice)",
        sheet: sheet("ws-chart-e.md", "Worksheet"),
        doc: overview("the-numbers-chart-e", "Guide"),
      },
      {
        id: "careers_page",
        label: "I verify on the employer careers page before applying",
        sheet: sheet("ws-chart-e.md", "Worksheet"),
        doc: overview("step-3a-applying", "Guide"),
      },
      {
        id: "tailor",
        label: "I tailor résumé summary + first bullets to core duties",
        sheet: sheet("ws-chart-e.md", "Worksheet"),
        doc: overview("step-3a-applying", "Guide"),
      },
      {
        id: "apply_site",
        label: "I apply on the employer site when practical",
        sheet: sheet("worksheet-planning.md", "Worksheet · Plan"),
        doc: overview("this-week", "Guide"),
      },
      {
        id: "outreach",
        label: "I send one short role-specific outreach on high-fit roles",
        sheet: sheet("ws-networking-scripts.md", "Worksheet · Scripts"),
        doc: overview("templates", "Guide"),
      },
      {
        id: "tracker_fields",
        label: "Tracker logs employer, role, source, Chart E, stage, follow-up, outcome",
        sheet: sheet("ws-tracker-setup.md", "Worksheet"),
        doc: overview("the-numbers-tracking-fields", "Guide"),
      },
    ],
    channel_items: [
      {
        id: "warm",
        label: "Warm / referral: ask for a specific intro",
        sheet: sheet("ws-networking-scripts.md", "Worksheet · Scripts"),
        doc: overview("channel-reference", "Guide"),
      },
      {
        id: "li_connect",
        label: "LinkedIn: connect first (no note), message after accept",
        sheet: sheet("ws-networking-scripts.md", "Worksheet · Scripts"),
        doc: overview("the-numbers-chart-a-offers-per-hour", "Guide"),
      },
      {
        id: "careers_pref",
        label: "Careers page preferred over Easy Apply",
        sheet: sheet("ws-weekly-loop.md", "Worksheet · Weekly"),
        doc: overview("the-numbers-chart-a-offers-per-hour", "Guide"),
      },
      {
        id: "cold_cap",
        label: "Cold email capped at 5–10/week (never primary)",
        sheet: sheet("ws-networking-scripts.md", "Worksheet · Scripts"),
        doc: overview("appendix-cold-email-secondary-only", "Guide"),
      },
      {
        id: "easy_zero",
        label: "Easy Apply near zero hours",
        sheet: sheet("ws-weekly-loop.md", "Worksheet · Weekly"),
        doc: overview("the-numbers-chart-a-offers-per-hour", "Guide"),
      },
    ],
  },
  {
    id: "4",
    title: "Stage 4 — Skills fork (Chart D)",
    unlocks: "5",
    min_checks: 3,
    answer_label: "Answer — my level + one skill focus this month",
    answer_key: "level_focus",
    needs_level: true,
    worksheet: sheet("ws-skills-fork.md", "Worksheet · Skills fork"),
    items: [
      {
        id: "know_row",
        label: "I know my level row (entry / mid / senior)",
        sheet: sheet("ws-skills-fork.md", "Worksheet"),
        doc: overview("step-3b-skill-build-by-seniority-chart-d", "Guide"),
      },
      {
        id: "cap_hours",
        label: "Skill hours are capped to that row (apply stays primary)",
        sheet: sheet("ws-skills-fork.md", "Worksheet"),
        doc: overview("the-numbers-chart-d", "Guide"),
      },
      {
        id: "parallel",
        label: "I apply in parallel with skill work",
        sheet: sheet("ws-skills-fork.md", "Worksheet"),
        doc: overview("path", "Guide"),
      },
    ],
    level_items: {
      entry: [
        {
          id: "e1",
          label: "3–4 end-to-end portfolio projects planned or shipping",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
        {
          id: "e2",
          label: "Each project: messy data → ship → README with problem + metric",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
        {
          id: "e3",
          label: "Certificates are not treated as a substitute for proof",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
      ],
      mid: [
        {
          id: "m1",
          label: "SQL/Python treated as assumed (not the skill block)",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
        {
          id: "m2",
          label: "One differentiator chosen (LLM/RAG, experiments, or MLOps awareness)",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
      ],
      senior: [
        {
          id: "s1",
          label: "Near-zero tutorial loops",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
        {
          id: "s2",
          label: "Hours go to distribution + interview drills",
          sheet: sheet("ws-skills-fork.md", "Worksheet"),
          doc: overview("the-numbers-chart-d", "Guide"),
        },
      ],
    },
    level_min: { entry: 3, mid: 2, senior: 2 },
  },
  {
    id: "5",
    title: "Stage 5 — Interview drills",
    unlocks: "6",
    min_checks: 4,
    answer_label: "Answer — date of last timed SQL practice",
    answer_key: "sql_date",
    worksheet: sheet("ws-interview-drills.md", "Worksheet · Interview drills"),
    items: [
      {
        id: "sql",
        label: "~2 hours live SQL under a clock in the last 7 days",
        sheet: sheet("ws-interview-drills.md", "Worksheet"),
        doc: overview("step-3c-interview-bottleneck", "Guide"),
      },
      {
        id: "case",
        label: "One case told as a business decision (not a tech dump) this week",
        sheet: sheet("ws-interview-drills.md", "Worksheet"),
        doc: overview("step-3c-interview-bottleneck", "Guide"),
      },
      {
        id: "loop_named",
        label: "I can name the usual 4–6 round loop (recruiter → SQL → stats/ML → case → behavioral)",
        sheet: sheet("ws-interview-drills.md", "Worksheet"),
        doc: overview("step-3c-interview-bottleneck", "Guide"),
      },
      {
        id: "prep_system",
        label: "I have a repeatable Module 5 prep checklist I can run on my own",
        sheet: sheet("ws-interview-prep-checklist.md", "Worksheet · Prep list"),
        doc: module5("module-5-prepare.md", "", "Guide"),
      },
    ],
  },
  {
    id: "6",
    title: "Stage 6 — Loop-ready",
    unlocks: "7",
    min_checks: 4,
    answer_label: "Answer — companies I’m ready to interview with (2–3 names)",
    answer_key: "next_interview",
    worksheet: sheet("ws-loop-ready.md", "Worksheet · Loop-ready pack"),
    items: [
      {
        id: "recruiter_story",
        label: "60-second recruiter intro written (role + proof + ask) — practice out loud",
        sheet: sheet("ws-loop-ready.md", "Worksheet"),
        doc: sheet("ws-interview-prep-script.md", "Prep script"),
      },
      {
        id: "tech_ready",
        label: "Timed SQL warm-up set saved and completed at least once",
        sheet: sheet("ws-loop-ready.md", "Worksheet"),
        doc: module5("module-5-technical.md", "", "Guide"),
      },
      {
        id: "case_ready",
        label: "One case story drafted end-to-end (problem → method → decision → result)",
        sheet: sheet("ws-loop-ready.md", "Worksheet"),
        doc: overview("step-3c-interview-bottleneck", "Guide"),
      },
      {
        id: "notes_fields",
        label: "Tracker has interview-notes fields ready (round, date, what went well, fix next)",
        sheet: sheet("ws-tracker-setup.md", "Worksheet · Tracker"),
        doc: sheet("ws-pre-interview.md", "Pre-interview"),
      },
    ],
  },
  {
    id: "7",
    title: "Stage 7 — Offer ready",
    unlocks: null,
    min_checks: 4,
    answer_label: "Answer — my walk-away / must-have offer line",
    answer_key: "walkaway",
    worksheet: sheet("ws-comp-planning.md", "Worksheet · Comp planning"),
    items: [
      {
        id: "comp",
        label: "Comp range researched for my target title + market",
        sheet: sheet("ws-comp-planning.md", "Worksheet"),
        doc: module6("module-6-comp.md", "", "Guide"),
      },
      {
        id: "criteria",
        label: "Must-have vs nice-to-have offer criteria written",
        sheet: sheet("ws-comp-planning.md", "Worksheet"),
        doc: module6("module-6-overview.md", "", "Guide"),
      },
      {
        id: "negotiate",
        label: "Negotiation talking points drafted (base, bonus, equity, remote, start)",
        sheet: sheet("ws-expected-salary.md", "Worksheet · Expected salary"),
        doc: module6("module-6-negotiations.md", "", "Guide"),
      },
      {
        id: "review",
        label: "I review outcomes every 20–30 qualified apps (or monthly) and adjust channels",
        sheet: sheet("ws-outcomes-review.md", "Worksheet · Outcomes"),
        doc: overview("step-3a-applying", "Guide"),
      },
    ],
  },
];

export const WEEKLY = {
  id: "W",
  title: "Weekly Loop",
  min_checks: 6,
  unlock_after_stage: "3",
  worksheet: sheet("ws-weekly-loop.md", "Worksheet · Weekly apply loop"),
  items: [
    {
      id: "w_warm",
      label: "Warm / referral messages sent (specific intros)",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: sheet("ws-networking-scripts.md", "Scripts"),
    },
    {
      id: "w_li",
      label: "LinkedIn: connect without a note → message after accept",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: sheet("ws-networking-scripts.md", "Scripts"),
    },
    {
      id: "w_apps",
      label: "4–6 tailored careers-page applies (≤48h when possible)",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: sheet("ws-chart-e.md", "Chart E"),
    },
    {
      id: "w_follow",
      label: "Follow-ups once at 7–10 business days",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: sheet("ws-networking-scripts.md", "Scripts"),
    },
    {
      id: "w_easy",
      label: "Easy Apply capped near zero",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: overview("the-numbers-chart-a-offers-per-hour", "Guide"),
    },
    {
      id: "w_interview",
      label: "Interview drills (~2 hrs)",
      sheet: sheet("ws-interview-drills.md", "Worksheet"),
      doc: overview("step-3c-interview-bottleneck", "Guide"),
    },
    {
      id: "w_skill",
      label: "Skill-gap block (0–4 hrs by level)",
      sheet: sheet("ws-skills-fork.md", "Worksheet"),
      doc: overview("the-numbers-chart-d", "Guide"),
    },
    {
      id: "w_skip",
      label: "Mass Easy Apply / course binge skipped",
      sheet: sheet("ws-weekly-loop.md", "Worksheet"),
      doc: overview("this-week", "Guide"),
    },
  ],
  tallies: [
    { id: "t_warm", label: "Warm / referral", goal: "3–5" },
    { id: "t_apps", label: "Targeted apps", goal: "4–6" },
    { id: "t_outreach", label: "Direct outreach", goal: "3–5" },
    { id: "t_proof", label: "Proof + prep (hrs)", goal: "1–2" },
  ],
};

export const STAGE_ORDER = STAGES.map((s) => s.id);

export { overview, sheet };
