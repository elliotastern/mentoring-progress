/** Stage definitions — worksheet_id opens a private fill-in form (login only). */

function overview(hash, label = "Guide") {
  return { href: `docs/view.html?doc=overview-v8.md#${hash}`, label };
}

function module5(doc, label = "Guide") {
  return { href: `docs/view.html?doc=${doc}`, label };
}

function module6(doc, label = "Guide") {
  return { href: `docs/view.html?doc=${doc}`, label };
}

function ws(id, label = "Worksheet") {
  return { worksheet_id: id, label };
}

export const STAGES = [
  {
    id: "0",
    title: "Stage 0 — Setup",
    unlocks: "1",
    min_checks: 3,
    answer_label: "Answer — my tracker link or sheet name",
    answer_key: "tracker",
    worksheet: ws("tracker-setup", "Worksheet · Tracker setup"),
    items: [
      {
        id: "tracker",
        label: "Tracker ready with columns for employer, role, source, stage, follow-up",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
      },
      {
        id: "li_headline",
        label: "LinkedIn headline uses draft role keywords (so inbound can find you)",
        sheet: ws("linkedin"),
        doc: overview("the-numbers-hours-10wk"),
      },
      {
        id: "public_proof",
        label: "Public proof home exists (GitHub and/or site URL written down)",
        sheet: ws("linkedin"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
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
    worksheet: ws("brainstorm", "Worksheet · Next position brainstorm"),
    items: [
      {
        id: "primary_title",
        label: "One primary title chosen (+ optional adjacent stretch)",
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
        label: "Company list of 10–15 named with stretch (~3) / stepping stone (~4–9) / sandbox (~3)",
        sheet: ws("brainstorm"),
        doc: overview("the-numbers-company-list-1015"),
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
    worksheet: ws("package-match", "Worksheet · Package match"),
    items: [
      {
        id: "resume",
        label: "Resume matched to the target title (summary + top bullets)",
        sheet: ws("package-match"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
      },
      {
        id: "linkedin",
        label: "LinkedIn About + experience matched to that same title",
        sheet: ws("package-match"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
      },
      {
        id: "projects",
        label: "1–2 proof projects that look like that job’s day-to-day work",
        sheet: ws("package-match"),
        doc: overview("the-numbers-role-specific-proof"),
      },
      {
        id: "github",
        label: "GitHub and/or site is public and linked from LinkedIn/resume",
        sheet: ws("package-match"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
      },
      {
        id: "artifact",
        label: "One artifact a stranger in that role can open and understand in ~6 seconds",
        sheet: ws("package-match"),
        doc: overview("step-2-portfolio-resume-for-that-role"),
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
    worksheet: ws("chart-e", "Worksheet · Chart E scorecard"),
    items: [
      {
        id: "chart_e_score",
        label: "I score each role with Chart E (0–2 × five factors) before investing time",
        sheet: ws("chart-e"),
        doc: overview("before-you-apply-chart-e-effort-score-010"),
      },
      {
        id: "six_plus",
        label: "I only continue when total is 6+ (unless intentional practice)",
        sheet: ws("chart-e"),
        doc: overview("the-numbers-chart-e"),
      },
      {
        id: "careers_page",
        label: "I verify on the employer careers page before applying",
        sheet: ws("chart-e"),
        doc: overview("step-3a-applying"),
      },
      {
        id: "tailor",
        label: "I tailor résumé summary + first bullets to core duties",
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
    ],
    channel_items: [
      {
        id: "warm",
        label: "Warm / referral: ask for a specific intro",
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
        label: "Cold email capped at 5–10/week (never primary)",
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
  },
  {
    id: "4",
    title: "Stage 4 — Skills fork (Chart D)",
    unlocks: "5",
    min_checks: 3,
    answer_label: "Answer — my level + one skill focus this month",
    answer_key: "level_focus",
    needs_level: true,
    worksheet: ws("skills-fork", "Worksheet · Skills fork"),
    items: [
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
    level_min: { entry: 3, mid: 2, senior: 2 },
  },
  {
    id: "5",
    title: "Stage 5 — Interview drills",
    unlocks: "6",
    min_checks: 4,
    answer_label: "Answer — date of last timed SQL practice",
    answer_key: "sql_date",
    worksheet: ws("interview-drills", "Worksheet · Interview drills"),
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
        label: "I can name the usual 4–6 round loop (recruiter → SQL → stats/ML → case → behavioral)",
        sheet: ws("interview-drills"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "prep_system",
        label: "I have a repeatable Module 5 prep checklist I can run on my own",
        sheet: ws("interview-drills"),
        doc: module5("module-5-prepare.md"),
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
    worksheet: ws("loop-ready", "Worksheet · Loop-ready pack"),
    items: [
      {
        id: "recruiter_story",
        label: "60-second recruiter intro written (role + proof + ask) — practice out loud",
        sheet: ws("loop-ready"),
        doc: module5("module-5-prepare.md"),
      },
      {
        id: "tech_ready",
        label: "Timed SQL warm-up set saved and completed at least once",
        sheet: ws("loop-ready"),
        doc: module5("module-5-technical.md"),
      },
      {
        id: "case_ready",
        label: "One case story drafted end-to-end (problem → method → decision → result)",
        sheet: ws("loop-ready"),
        doc: overview("step-3c-interview-bottleneck"),
      },
      {
        id: "notes_fields",
        label: "Tracker has interview-notes fields ready (round, date, what went well, fix next)",
        sheet: ws("tracker-setup"),
        doc: overview("the-numbers-tracking-fields"),
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
    worksheet: ws("comp-planning", "Worksheet · Comp planning"),
    items: [
      {
        id: "comp",
        label: "Comp range researched for my target title + market",
        sheet: ws("comp-planning"),
        doc: module6("module-6-comp.md"),
      },
      {
        id: "criteria",
        label: "Must-have vs nice-to-have offer criteria written",
        sheet: ws("comp-planning"),
        doc: module6("module-6-overview.md"),
      },
      {
        id: "negotiate",
        label: "Negotiation talking points drafted (base, bonus, equity, remote, start)",
        sheet: ws("comp-planning"),
        doc: module6("module-6-negotiations.md"),
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
  unlock_after_stage: "3",
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
    { id: "t_warm", label: "Warm / referral", goal: "3–5" },
    { id: "t_apps", label: "Targeted apps", goal: "4–6" },
    { id: "t_outreach", label: "Direct outreach", goal: "3–5" },
    { id: "t_proof", label: "Proof + prep (hrs)", goal: "1–2" },
  ],
};

export const STAGE_ORDER = STAGES.map((s) => s.id);
