/** Stage definitions — gates must match what is needed to open the next stage.
 *  Each item can include `doc` pointing at public/docs (Overview v8 + modules).
 */

function overview(hash, label = "Overview") {
  return { href: `docs/view.html?doc=overview-v8.md#${hash}`, label };
}

function worksheet(label = "Planning worksheet") {
  return { href: "docs/view.html?doc=worksheet-planning.md", label };
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
    items: [
      {
        id: "tracker",
        label: "Tracker ready (Teal or Module 4 worksheet) with columns for employer, role, source, stage, follow-up",
        doc: overview("the-numbers-tracking-fields", "Overview · tracking fields"),
      },
      {
        id: "li_headline",
        label: "LinkedIn headline uses draft role keywords (so inbound can find you)",
        doc: overview("the-numbers-hours-10wk", "Overview · LinkedIn setup"),
      },
      {
        id: "public_proof",
        label: "Public proof home exists (GitHub and/or site URL written down)",
        doc: overview("step-2-portfolio-resume-for-that-role", "Overview · Step 2"),
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
    items: [
      {
        id: "primary_title",
        label: "One primary title chosen (+ optional adjacent stretch)",
        doc: overview("step-1-job-to-target", "Overview · Step 1"),
      },
      {
        id: "constraints",
        label: "Level, remote/hybrid, industry, and comp floor written down",
        doc: overview("step-1-job-to-target", "Overview · Step 1"),
      },
      {
        id: "must_have",
        label: "Must-have vs nice-to-have split from real job posts",
        doc: overview("step-1-job-to-target", "Overview · Step 1"),
      },
      {
        id: "tiers",
        label: "Company list of 10–15 named with stretch (~3) / stepping stone (~4–9) / sandbox (~3)",
        doc: overview("the-numbers-company-list-1015", "Overview · company list"),
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
    items: [
      {
        id: "resume",
        label: "Resume matched to the target title (summary + top bullets)",
        doc: overview("step-2-portfolio-resume-for-that-role", "Overview · Step 2"),
      },
      {
        id: "linkedin",
        label: "LinkedIn About + experience matched to that same title",
        doc: overview("step-2-portfolio-resume-for-that-role", "Overview · Step 2"),
      },
      {
        id: "projects",
        label: "1–2 proof projects that look like that job’s day-to-day work",
        doc: overview("the-numbers-role-specific-proof", "Overview · proof"),
      },
      {
        id: "github",
        label: "GitHub and/or site is public and linked from LinkedIn/resume",
        doc: overview("step-2-portfolio-resume-for-that-role", "Overview · Step 2"),
      },
      {
        id: "artifact",
        label: "One artifact a stranger in that role can open and understand in ~6 seconds",
        doc: overview("step-2-portfolio-resume-for-that-role", "Overview · Step 2"),
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
    items: [
      {
        id: "chart_e_score",
        label: "I score each role with Chart E (0–2 × five factors) before investing time",
        doc: overview("before-you-apply-chart-e-effort-score-010", "Overview · Chart E"),
      },
      {
        id: "six_plus",
        label: "I only continue when total is 6+ (unless intentional practice)",
        doc: overview("the-numbers-chart-e", "Overview · Chart E table"),
      },
      {
        id: "careers_page",
        label: "I verify on the employer careers page before applying",
        doc: overview("step-3a-applying", "Overview · Step 3a"),
      },
      {
        id: "tailor",
        label: "I tailor résumé summary + first bullets to core duties",
        doc: overview("step-3a-applying", "Overview · Step 3a"),
      },
      {
        id: "apply_site",
        label: "I apply on the employer site when practical",
        doc: overview("this-week", "Overview · This week"),
      },
      {
        id: "outreach",
        label: "I send one short role-specific outreach on high-fit roles",
        doc: overview("templates", "Overview · Templates"),
      },
      {
        id: "tracker_fields",
        label: "Tracker logs employer, role, source, Chart E, stage, follow-up, outcome",
        doc: overview("the-numbers-tracking-fields", "Overview · tracking"),
      },
    ],
    channel_items: [
      {
        id: "warm",
        label: "Warm / referral: ask for a specific intro",
        doc: overview("channel-reference", "Overview · Channels"),
      },
      {
        id: "li_connect",
        label: "LinkedIn: connect first (no note), message after accept",
        doc: overview("the-numbers-chart-a-offers-per-hour", "Overview · Chart A"),
      },
      {
        id: "careers_pref",
        label: "Careers page preferred over Easy Apply",
        doc: overview("the-numbers-chart-a-offers-per-hour", "Overview · Chart A"),
      },
      {
        id: "cold_cap",
        label: "Cold email capped at 5–10/week (never primary)",
        doc: overview("appendix-cold-email-secondary-only", "Overview · Cold email"),
      },
      {
        id: "easy_zero",
        label: "Easy Apply near zero hours",
        doc: overview("the-numbers-chart-a-offers-per-hour", "Overview · Chart A"),
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
    items: [
      {
        id: "know_row",
        label: "I know my level row (entry / mid / senior)",
        doc: overview("step-3b-skill-build-by-seniority-chart-d", "Overview · Chart D"),
      },
      {
        id: "cap_hours",
        label: "Skill hours are capped to that row (apply stays primary)",
        doc: overview("the-numbers-chart-d", "Overview · Chart D table"),
      },
      {
        id: "parallel",
        label: "I apply in parallel with skill work",
        doc: overview("path", "Overview · Path"),
      },
    ],
    level_items: {
      entry: [
        {
          id: "e1",
          label: "3–4 end-to-end portfolio projects planned or shipping",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
        {
          id: "e2",
          label: "Each project: messy data → ship → README with problem + metric",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
        {
          id: "e3",
          label: "Certificates are not treated as a substitute for proof",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
      ],
      mid: [
        {
          id: "m1",
          label: "SQL/Python treated as assumed (not the skill block)",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
        {
          id: "m2",
          label: "One differentiator chosen (LLM/RAG, experiments, or MLOps awareness)",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
      ],
      senior: [
        {
          id: "s1",
          label: "Near-zero tutorial loops",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
        },
        {
          id: "s2",
          label: "Hours go to distribution + interview drills",
          doc: overview("the-numbers-chart-d", "Overview · Chart D"),
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
    items: [
      {
        id: "sql",
        label: "~2 hours live SQL under a clock in the last 7 days",
        doc: overview("step-3c-interview-bottleneck", "Overview · Step 3c"),
      },
      {
        id: "case",
        label: "One case told as a business decision (not a tech dump) this week",
        doc: overview("step-3c-interview-bottleneck", "Overview · Step 3c"),
      },
      {
        id: "loop_named",
        label: "I can name the usual 4–6 round loop (recruiter → SQL → stats/ML → case → behavioral)",
        doc: overview("step-3c-interview-bottleneck", "Overview · Step 3c"),
      },
      {
        id: "prep_system",
        label: "I have a repeatable Module 5 prep checklist I can run on my own",
        doc: module5("module-5-prepare.md", "", "Module 5 · Prep"),
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
    items: [
      {
        id: "recruiter_story",
        label: "60-second recruiter intro written (role + proof + ask) — practice out loud",
        doc: module5("module-5-prepare.md", "", "Module 5 · Prepare"),
      },
      {
        id: "tech_ready",
        label: "Timed SQL warm-up set saved and completed at least once",
        doc: module5("module-5-technical.md", "", "Module 5 · Technical"),
      },
      {
        id: "case_ready",
        label: "One case story drafted end-to-end (problem → method → decision → result)",
        doc: overview("step-3c-interview-bottleneck", "Overview · Step 3c"),
      },
      {
        id: "notes_fields",
        label: "Tracker has interview-notes fields ready (round, date, what went well, fix next)",
        doc: overview("the-numbers-tracking-fields", "Overview · tracking"),
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
    items: [
      {
        id: "comp",
        label: "Comp range researched for my target title + market",
        doc: module6("module-6-comp.md", "", "Module 6 · Comp package"),
      },
      {
        id: "criteria",
        label: "Must-have vs nice-to-have offer criteria written",
        doc: module6("module-6-overview.md", "", "Module 6 · Overview"),
      },
      {
        id: "negotiate",
        label: "Negotiation talking points drafted (base, bonus, equity, remote, start)",
        doc: module6("module-6-negotiations.md", "", "Module 6 · Negotiations"),
      },
      {
        id: "review",
        label: "I review outcomes every 20–30 qualified apps (or monthly) and adjust channels",
        doc: overview("step-3a-applying", "Overview · Step 3a"),
      },
    ],
  },
];

export const WEEKLY = {
  id: "W",
  title: "Weekly Loop",
  min_checks: 6,
  unlock_after_stage: "3",
  items: [
    {
      id: "w_warm",
      label: "Warm / referral messages sent (specific intros)",
      doc: overview("this-week", "Overview · This week"),
    },
    {
      id: "w_li",
      label: "LinkedIn: connect without a note → message after accept",
      doc: overview("the-numbers-chart-a-offers-per-hour", "Overview · Chart A"),
    },
    {
      id: "w_apps",
      label: "4–6 tailored careers-page applies (≤48h when possible)",
      doc: overview("this-week", "Overview · This week"),
    },
    {
      id: "w_follow",
      label: "Follow-ups once at 7–10 business days",
      doc: overview("this-week", "Overview · This week"),
    },
    {
      id: "w_easy",
      label: "Easy Apply capped near zero",
      doc: overview("the-numbers-chart-a-offers-per-hour", "Overview · Chart A"),
    },
    {
      id: "w_interview",
      label: "Interview drills (~2 hrs)",
      doc: overview("step-3c-interview-bottleneck", "Overview · Step 3c"),
    },
    {
      id: "w_skill",
      label: "Skill-gap block (0–4 hrs by level)",
      doc: overview("the-numbers-chart-d", "Overview · Chart D"),
    },
    {
      id: "w_skip",
      label: "Mass Easy Apply / course binge skipped",
      doc: overview("this-week", "Overview · This week"),
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

export { overview, worksheet };
