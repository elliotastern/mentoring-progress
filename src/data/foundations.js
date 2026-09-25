/** Module 0–3 — must pass before Module 4 (Job Search) stages open.
 *  MODULES = Foundations + Module 4 for the UI list.
 *  Expanded cards show the full exit worksheet (guides + fill-ins) inline.
 */

function ws(id, label = "Worksheet") {
  return { worksheet_id: id, label };
}

/** Modules that gate Job Search stages (not including Module 4). */
export const FOUNDATIONS = [
  {
    id: "m0",
    title: "Module 0 — Onboard",
    min_checks: 4,
    worksheet: ws("module-exit-0", "Open Module 0 exit worksheet"),
    items: [
      {
        id: "m0_overview",
        label: "Completed Module & Mentorship Overview",
        doc: { href: "docs/view.html?doc=m0-welcome.md", label: "Guide" },
      },
      {
        id: "m0_provided",
        label: "Read What Is Provided In This Mentorship",
        doc: { href: "docs/view.html?doc=m0-provided.md", label: "Guide" },
      },
      {
        id: "m0_expectations",
        label: "Expectations guide done; hours + success filled in",
        doc: { href: "docs/view.html?doc=m0-expectations.md", label: "Guide" },
      },
      {
        id: "m0_communicate",
        label: "Read How To Communicate",
        doc: { href: "docs/view.html?doc=m0-communicate.md", label: "Guide" },
      },
    ],
  },
  {
    id: "m1",
    title: "Module 1 — Path",
    min_checks: 7,
    answer_label: "Answer — my primary goal this quarter (one line)",
    answer_key: "m1_goal",
    worksheet: ws("module-exit-1", "Open Module 1 exit worksheet"),
    items: [
      {
        id: "m1_overview",
        label: "Module 1 overview",
        doc: { href: "docs/view.html?doc=m1-overview.md", label: "Guide" },
      },
      {
        id: "m1_principles",
        label: "Principles & Values",
        doc: { href: "docs/view.html?doc=m1-principles.md", label: "Guide" },
      },
      {
        id: "m1_bumps",
        label: "Bumps Ahead",
        doc: { href: "docs/view.html?doc=m1-bumps.md", label: "Guide" },
      },
      {
        id: "m1_goals",
        label: "Goals Planning",
        doc: { href: "docs/view.html?doc=m1-goals.md", label: "Guide" },
      },
      {
        id: "m1_roadmap",
        label: "Roadmap assessment for your track",
        doc: { href: "docs/view.html?doc=m1-roadmap.md", label: "Guide" },
      },
      {
        id: "m1_next",
        label: "To Start Learning/Practicing",
        doc: { href: "docs/view.html?doc=m1-next.md", label: "Guide" },
      },
      {
        id: "m1_time",
        label: "Time & Energy management",
        doc: { href: "docs/view.html?doc=m1-time.md", label: "Guide" },
      },
      {
        id: "m1_habits",
        label: "Habits plan",
        doc: { href: "docs/view.html?doc=m1-habits.md", label: "Guide" },
      },
      {
        id: "m1_optimal",
        label: "Creating the Optimal Roadmap",
        doc: { href: "docs/view.html?doc=m1-optimal.md", label: "Guide" },
      },
    ],
  },
  {
    id: "m2",
    title: "Project (optional)",
    min_checks: 4,
    answer_label: "Answer — my proof name + repo link (or N/A if Search-ready)",
    answer_key: "m2_project",
    worksheet: ws("module-exit-2", "Open Project exit worksheet"),
    items: [
      {
        id: "m2_why",
        label: "Why build role-specific portfolio proof",
        doc: { href: "docs/view.html?doc=m2-why.md", label: "Guide" },
      },
      {
        id: "m2_plan",
        label: "Mentorship Project Plan",
        doc: { href: "docs/view.html?doc=m2-plan.md", label: "Guide" },
      },
      {
        id: "m2_steps",
        label: "Project Step-by-Step",
        doc: { href: "docs/view.html?doc=m2-steps.md", label: "Guide" },
      },
      {
        id: "m2_worksheet",
        label: "Project planning worksheet (or skip noted)",
        doc: { href: "docs/view.html?doc=m2-planning-ws.md", label: "Guide" },
      },
      {
        id: "m2_repo",
        label: "Proof repo setup on GitHub (or skip noted)",
        doc: { href: "docs/view.html?doc=m2-repo.md", label: "Guide" },
      },
      {
        id: "m2_habit",
        label: "Upskilling habit started (project/school/work, 30+ mins daily)",
      },
    ],
  },
  {
    id: "m3",
    title: "Module 3 — Portfolio",
    min_checks: 7,
    answer_label: "Answer — my product one-liner",
    answer_key: "m3_oneliner",
    worksheet: ws("module-exit-3", "Open Module 3 exit worksheet"),
    items: [
      {
        id: "m3_overview",
        label: "Module 3 overview",
        doc: { href: "docs/view.html?doc=m3-overview.md", label: "Guide" },
      },
      {
        id: "m3_design",
        label: "Designing Yourself As A Product",
        doc: { href: "docs/view.html?doc=m3-design.md", label: "Guide" },
      },
      {
        id: "m3_selling",
        label: "Selling Yourself As A Product",
        doc: { href: "docs/view.html?doc=m3-selling.md", label: "Guide" },
      },
      {
        id: "m3_impact",
        label: "How To Measure Impact",
        doc: { href: "docs/view.html?doc=m3-impact.md", label: "Guide" },
      },
      {
        id: "m3_linkedin",
        label: "Maximize LinkedIn",
        doc: { href: "docs/view.html?doc=m3-linkedin.md", label: "Guide" },
      },
      {
        id: "m3_portfolio",
        label: "Maximize Portfolio",
        doc: { href: "docs/view.html?doc=m3-portfolio.md", label: "Guide" },
      },
      {
        id: "m3_resume",
        label: "Maximize Resume",
        doc: { href: "docs/view.html?doc=m3-resume.md", label: "Guide" },
      },
      {
        id: "m3_cover",
        label: "Maximize Cover Letter",
        doc: { href: "docs/view.html?doc=m3-cover.md", label: "Guide" },
      },
      {
        id: "m3_habit",
        label: "Portfolio Touch-Up habit started (30 mins daily)",
      },
    ],
  },
];

/** Module 4: always listed; all Job Search stages are visible (locked stages are peek-only). */
export const MODULE_4 = {
  id: "m4",
  title: "Module 4 — Job Search",
  min_checks: 0,
  items: [
    {
      id: "m4_overview",
      label: "Job Search Overview — start with This week",
      doc: { href: "docs/view.html?doc=overview-v8.md#this-week", label: "Guide" },
    },
  ],
};

/** All modules shown under Foundations: M0–M3 + Module 4. */
export const MODULES = [...FOUNDATIONS, MODULE_4];
