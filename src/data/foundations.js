/** Module 0–3 end checklists — must pass before Stage 0 (job search) opens.
 *  No mentor meeting required; self-attest + fill-in worksheet.
 */

function ws(id, label = "Worksheet") {
  return { worksheet_id: id, label };
}

export const FOUNDATIONS = [
  {
    id: "m0",
    title: "Module 0 — Onboard (end checklist)",
    min_checks: 5,
    worksheet: ws("module-exit-0", "Module 0 exit worksheet"),
    items: [
      {
        id: "m0_overview",
        label: "Completed Module & Mentorship Overview",
        sheet: ws("module-exit-0"),
        doc: { href: "docs/view.html?doc=m0-welcome.md", label: "Guide" },
      },
      {
        id: "m0_provided",
        label: "Read What Is Provided In This Mentorship",
        sheet: ws("module-exit-0"),
        doc: { href: "docs/view.html?doc=m0-provided.md", label: "Guide" },
      },
      {
        id: "m0_expectations",
        label: "Expectations worksheet completed and saved in shared folder",
        sheet: ws("module-exit-0"),
        doc: { href: "docs/view.html?doc=m0-expectations.md", label: "Guide" },
      },
      {
        id: "m0_communicate",
        label: "Read How To Communicate",
        sheet: ws("module-exit-0"),
        doc: { href: "docs/view.html?doc=m0-communicate.md", label: "Guide" },
      },
      {
        id: "m0_slack_intro",
        label: "Introduced myself in Slack #0-overview-introduction and replied to 2–3 others",
        sheet: ws("module-exit-0"),
      },
      {
        id: "m0_habit",
        label: "Started one health habit (sleep 7+ / exercise 30m / water 3L)",
        sheet: ws("module-exit-0"),
      },
    ],
  },
  {
    id: "m1",
    title: "Module 1 — Path (end checklist)",
    min_checks: 7,
    answer_label: "Answer — my primary goal this quarter (one line)",
    answer_key: "m1_goal",
    worksheet: ws("module-exit-1", "Module 1 exit worksheet"),
    items: [
      {
        id: "m1_overview",
        label: "Module 1 overview done (Chrome reader + Loom installed if needed)",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_principles",
        label: "Principles & Values worksheet completed and saved",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_bumps",
        label: "Bumps Ahead reviewed (worksheet optional)",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_goals",
        label: "Goals Planning done",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_roadmap",
        label: "Roadmap To Data Science assessment checklist done",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_next",
        label: "To Start Learning/Practicing — next action steps written",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_time",
        label: "Time & Energy management reviewed; time wasters cut plan written",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_habits",
        label: "Habits plan set (incl. coding practice 30 mins daily)",
        sheet: ws("module-exit-1"),
      },
      {
        id: "m1_optimal",
        label: "Creating the Optimal Roadmap worksheet completed and saved",
        sheet: ws("module-exit-1"),
      },
    ],
  },
  {
    id: "m2",
    title: "Module 2 — Project (end checklist)",
    min_checks: 4,
    answer_label: "Answer — my project name + repo link (or N/A if skipping to portfolio)",
    answer_key: "m2_project",
    worksheet: ws("module-exit-2", "Module 2 exit worksheet"),
    items: [
      {
        id: "m2_why",
        label: "Read Why Build Full-Stack Portfolio Project",
        sheet: ws("module-exit-2"),
      },
      {
        id: "m2_plan",
        label: "Mentorship Project Plan + next steps written",
        sheet: ws("module-exit-2"),
      },
      {
        id: "m2_steps",
        label: "Project Step-by-Step reviewed",
        sheet: ws("module-exit-2"),
      },
      {
        id: "m2_worksheet",
        label: "Data Related Project Planning worksheet completed and saved (or skipped with reason)",
        sheet: ws("module-exit-2"),
      },
      {
        id: "m2_repo",
        label: "Project repo set up (cookie-cutter / end-to-end structure) or skip noted",
        sheet: ws("module-exit-2"),
      },
      {
        id: "m2_habit",
        label: "Upskilling habit started (project/school/work, 30+ mins daily)",
        sheet: ws("module-exit-2"),
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3 — Portfolio (end checklist)",
    min_checks: 7,
    answer_label: "Answer — my product one-liner",
    answer_key: "m3_oneliner",
    worksheet: ws("module-exit-3", "Module 3 exit worksheet"),
    items: [
      {
        id: "m3_overview",
        label: "Module 3 overview done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_design",
        label: "Designing Yourself As A Product done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_selling",
        label: "Selling Yourself As A Product + worksheet saved",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_impact",
        label: "How To Measure Impact done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_linkedin",
        label: "How to Maximize Your LinkedIn checklist done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_portfolio",
        label: "How to Maximize Portfolio checklist done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_resume",
        label: "How to Maximize Your Resume checklist done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_cover",
        label: "How to Maximize Your Cover Letter checklist done",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_slack",
        label: "Posted product summary + one-liner in #3-optimizing-portfolio and asked for feedback",
        sheet: ws("module-exit-3"),
      },
      {
        id: "m3_habit",
        label: "Portfolio Touch-Up habit started (30 mins daily)",
        sheet: ws("module-exit-3"),
      },
    ],
  },
];
