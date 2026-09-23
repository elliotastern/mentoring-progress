/** Private fill-in worksheets — answers live in progress.worksheets[id] (login only). */

function text(id, label, placeholder = "") {
  return { id, type: "text", label, placeholder };
}

function area(id, label, placeholder = "") {
  return { id, type: "textarea", label, placeholder };
}

function check(id, label, opts = {}) {
  const field = { id, type: "checkbox", label };
  if (opts.href) field.href = opts.href;
  if (opts.doc) field.doc = opts.doc;
  return field;
}

export const WORKSHEETS = [
  {
    id: "tracker-setup",
    title: "Tracker Setup",
    stage: "0",
    blurb: "One place to log every qualified role.",
    sections: [
      {
        title: "Where I track",
        fields: [
          text("tool", "Tool (Teal / Google Sheet / Module 4 .xlsx)", "e.g. Teal"),
          text("link", "Link or file name", "Paste URL or sheet name"),
          check("open_fast", "I can open it in under 10 seconds"),
        ],
      },
      {
        title: "Required columns (check when the column exists)",
        fields: [
          check("col_employer", "Employer"),
          check("col_role", "Role / title"),
          check("col_subtype", "DS or DA subtype"),
          check("col_url", "URL (careers page preferred)"),
          check("col_posted", "Date posted"),
          check("col_applied", "Date applied"),
          check("col_source", "Source (warm / careers / LinkedIn / recruiter / other)"),
          check("col_chart_e", "Chart E score (0–10)"),
          check("col_resume", "Résumé version"),
          check("col_contact", "Contact / referrer"),
          check("col_stage", "Stage (saved / applied / screen / interview / offer / closed)"),
          check("col_followup", "Follow-up date"),
          check("col_time", "Time spent (mins)"),
          check("col_outcome", "Outcome"),
          check("col_close", "Close reason"),
          check("col_notes", "Interview notes (round, what went well, fix next)"),
        ],
      },
      {
        title: "Smoke test — one practice row",
        fields: [
          text("practice_employer", "Employer"),
          text("practice_role", "Role"),
          text("practice_source", "Source"),
          text("practice_chart_e", "Chart E", "0–10"),
          text("practice_stage", "Stage"),
          text("practice_followup", "Follow-up date"),
        ],
      },
      {
        title: "Done when",
        fields: [
          check("done_columns", "All required columns exist"),
          check("done_row", "One practice row filled"),
          check("done_answer", "Progress answer = this tracker link or sheet name"),
        ],
      },
    ],
  },
  {
    id: "linkedin",
    title: "LinkedIn Recruiter-Ready",
    stage: "0",
    blurb: "One-time setup so recruiters can find you.",
    sections: [
      {
        title: "Target signal",
        fields: [
          text("primary_title", "Primary title I want inbound for"),
          text("keywords", "3–5 role keywords (from real posts)", "keyword1 / keyword2 / …"),
        ],
      },
      {
        title: "Headline",
        fields: [
          text("headline_draft", "Draft headline", "[Title] | [domain] | [proof hook]"),
          text("headline_final", "Final headline (live on LinkedIn)"),
        ],
      },
      {
        title: "About (6-second stranger test)",
        fields: [
          area(
            "about",
            "About (who you help → what you’ve shipped → proof metric → what you want)",
          ),
        ],
      },
      {
        title: "Public proof links",
        fields: [
          text("github_url", "GitHub URL"),
          check("github_live", "GitHub is public / live"),
          text("site_url", "Site / portfolio URL"),
          check("site_live", "Site is public / live"),
          text("best_artifact", "Best single artifact URL"),
          check("featured", "LinkedIn Featured or About includes a proof link"),
        ],
      },
      {
        title: "Top experience bullets (matched to title)",
        fields: [
          text("role_a", "Role A title"),
          area("role_a_bullets", "Role A — first 2 bullets"),
          text("role_b", "Role B title"),
          area("role_b_bullets", "Role B — first 2 bullets"),
        ],
      },
    ],
  },
  {
    id: "brainstorm",
    title: "Next Position Brainstorm",
    stage: "1",
    blurb: "Pick one title and a 10–15 company list.",
    sections: [
      {
        title: "Target role",
        fields: [
          text("primary_title", "Primary title"),
          text("stretch_title", "Optional adjacent stretch title"),
          text("level", "Level (entry / mid / senior)"),
          text("location", "Remote / hybrid / onsite + cities"),
          text("industry", "Industry / domain focus"),
          text("comp_floor", "Comp floor", "$"),
        ],
      },
      {
        title: "Must-have vs nice-to-have (from real posts)",
        fields: [
          area("must_have", "Must-haves"),
          area("nice_have", "Nice-to-haves"),
        ],
      },
      {
        title: "Company list (10–15)",
        fields: [
          area("stretch", "Stretch (~3)", "Company 1\nCompany 2\n…"),
          area("stepping", "Stepping stone (~4–9)"),
          area("sandbox", "Sandbox (~3)"),
        ],
      },
    ],
  },
  {
    id: "package-match",
    title: "Package Match",
    stage: "2",
    blurb: "Resume + LinkedIn + projects match one target title.",
    sections: [
      {
        title: "Target",
        fields: [
          text("primary_title", "Primary title"),
          text("jd_url", "One real JD URL I’m matching to"),
          area("core_duties", "5 core duties from that JD (not nice-to-haves)"),
        ],
      },
      {
        title: "Resume match",
        fields: [
          area("resume_summary", "Summary (matched)"),
          area("resume_bullets", "Top 3 bullets (matched)"),
          check("resume_skills", "Skills line matches the title"),
        ],
      },
      {
        title: "LinkedIn + proof",
        fields: [
          check("li_about", "About matches the same title"),
          check("li_bullets", "Top experience bullets match resume"),
          check("li_headline", "Headline matches title keywords"),
          text("project_1", "Proof project 1 + URL"),
          text("project_2", "Proof project 2 + URL (optional)"),
          text("best_artifact", "Best artifact a stranger can open in ~6 seconds"),
          check("public_links", "GitHub and/or site public and linked"),
        ],
      },
    ],
  },
  {
    id: "chart-e",
    title: "Chart E Role Scorecard",
    stage: "3",
    blurb: "Score a role 0–10 before you invest time. Duplicate by editing for each new role.",
    sections: [
      {
        title: "Role card",
        fields: [
          text("employer", "Employer"),
          text("role", "Role"),
          text("careers_url", "Careers-page URL (verified)"),
          text("date_posted", "Date posted"),
          text("source", "Source found"),
        ],
      },
      {
        title: "Score (0 / 1 / 2 each)",
        fields: [
          text("s_interest", "Interest (0–2)"),
          text("s_fit", "Core fit (0–2)"),
          text("s_proof", "Proof (0–2)"),
          text("s_access", "Human access (0–2)"),
          text("s_logistics", "Logistics (0–2)"),
          text("total", "Total / 10"),
          text("action", "My action (skip / apply+note / full effort)"),
        ],
      },
      {
        title: "If continuing",
        fields: [
          check("verified", "Careers page verified"),
          check("tailored", "Résumé top tailored to core duties"),
          check("applied", "Applied on employer site when practical"),
          check("outreach", "One short outreach sent (if 6+)"),
          check("logged", "Logged in tracker with Chart E + follow-up"),
        ],
      },
    ],
  },
  {
    id: "networking-scripts",
    title: "Networking Scripts",
    stage: "3",
    blurb: "Fill your copy bank — paste and tweak, don’t rewrite from scratch each time.",
    sections: [
      {
        title: "Warm / referral",
        fields: [area("warm_script", "Warm lead script (intro → ask for specific intro)")],
      },
      {
        title: "LinkedIn after connect",
        fields: [area("li_script", "First message after they accept")],
      },
      {
        title: "Hiring manager / recruiter",
        fields: [
          area("hm_script", "Hiring manager / data lead note"),
          area("recruiter_script", "Named posting recruiter note"),
        ],
      },
      {
        title: "Follow-up",
        fields: [area("followup_script", "7–10 business day follow-up")],
      },
    ],
  },
  {
    id: "skills-fork",
    title: "Skills Fork (Chart D)",
    stage: "4",
    blurb: "Pick your level row, cap skill hours, keep applying.",
    sections: [
      {
        title: "My level",
        fields: [
          text("level", "Level (entry / mid / senior)"),
          text("years", "Years of relevant experience"),
          text("cap_hours", "Skill hours / week cap"),
          text("focus", "This month’s one skill focus"),
          check("apply_parallel", "Apply / outreach stays primary"),
        ],
      },
      {
        title: "Entry row (if entry)",
        fields: [
          area("entry_projects", "3–4 end-to-end projects (list)"),
          check("entry_readme", "Each: messy data → ship → README with problem + metric"),
          check("entry_certs", "Certificates are not substituting for proof"),
        ],
      },
      {
        title: "Mid / senior row",
        fields: [
          check("mid_assumed", "SQL/Python treated as assumed (mid)"),
          text("mid_diff", "One differentiator (mid)"),
          check("senior_no_tutorials", "Near-zero tutorial loops (senior)"),
          check("senior_distribution", "Hours go to distribution + drills (senior)"),
        ],
      },
    ],
  },
  {
    id: "interview-drills",
    title: "Interview Drills",
    stage: "5",
    blurb: "Weekly timed practice — no company meeting required.",
    sections: [
      {
        title: "Week of",
        fields: [text("week_of", "Week of", "e.g. Sep 22, 2026")],
      },
      {
        title: "Timed SQL (~2 hrs)",
        fields: [
          area("sql_log", "SQL practice log (date · problem · minutes · pass?)"),
          text("sql_last_date", "Date of last timed SQL"),
        ],
      },
      {
        title: "Case as a business decision",
        fields: [
          text("case_prompt", "Prompt / company context"),
          text("case_decision", "Decision I argued"),
          text("case_metric", "Metric / evidence"),
          check("case_aloud", "Told out loud"),
        ],
      },
      {
        title: "Loop recall",
        fields: [
          area("loop_list", "Usual 4–6 rounds I can name"),
          check("prep_ready", "Module 5 prep checklist ready to run alone"),
        ],
      },
    ],
  },
  {
    id: "loop-ready",
    title: "Loop-Ready Pack",
    stage: "6",
    blurb: "Be ready for real loops without waiting for a booked interview.",
    sections: [
      {
        title: "Recruiter intro",
        fields: [
          area("intro", "60-second intro (role → proof → ask)"),
          check("intro_aloud", "Practiced aloud"),
          text("intro_date", "Practice date"),
        ],
      },
      {
        title: "Timed SQL warm-up set",
        fields: [
          area("sql_set", "Warm-up set (3 prompts + time limits + dates done)"),
        ],
      },
      {
        title: "Case story",
        fields: [
          area("case_problem", "Business problem"),
          area("case_method", "Data / method"),
          area("case_decision", "Decision you drove"),
          area("case_result", "Result / metric"),
          area("case_limits", "Limits / next"),
        ],
      },
      {
        title: "Ready companies + tracker",
        fields: [
          text("company_1", "Company 1"),
          text("company_2", "Company 2"),
          text("company_3", "Company 3"),
          check("notes_fields", "Tracker interview-notes fields ready"),
        ],
      },
    ],
  },
  {
    id: "comp-planning",
    title: "Compensation Planning",
    stage: "7",
    blurb: "Walk-away line and must-haves before an offer lands.",
    sections: [
      {
        title: "Market + floor",
        fields: [
          text("city", "City / market"),
          text("title", "Target title"),
          text("market_range", "Market range researched"),
          text("minimum", "Minimum annual base I would take now", "$"),
          text("walkaway", "Walk-away / must-have offer line"),
        ],
      },
      {
        title: "Package criteria",
        fields: [
          area("must_have", "Must-haves (ranked)"),
          area("nice_have", "Nice-to-haves (ranked)"),
          area("talking_points", "Negotiation talking points (base, bonus, equity, remote, start)"),
        ],
      },
    ],
  },
  {
    id: "outcomes-review",
    title: "Search Outcomes Review",
    stage: "7",
    blurb: "Every 20–30 qualified apps (or monthly).",
    sections: [
      {
        title: "Window",
        fields: [
          text("dates", "Dates", "start → end"),
          text("qualified_apps", "Qualified apps in window"),
        ],
      },
      {
        title: "Funnel counts",
        fields: [
          text("n_applied", "Applied"),
          text("n_screens", "Screens"),
          text("n_tech", "Technical / SQL"),
          text("n_final", "Final / onsite"),
          text("n_offers", "Offers"),
        ],
      },
      {
        title: "Decisions",
        fields: [
          area("by_source", "By source notes (what worked)"),
          text("double_down", "Double down on"),
          text("cap_stop", "Cap or stop"),
          text("package_fix", "Package fix needed?"),
          text("skill_fix", "Skill fix needed?"),
        ],
      },
    ],
  },
  {
    id: "weekly-loop",
    title: "Weekly Apply Loop",
    stage: "W",
    blurb: "Fill each week — tallies + channel checks.",
    sections: [
      {
        title: "Week",
        fields: [text("week_of", "Week of")],
      },
      {
        title: "Volume (actual)",
        fields: [
          text("t_warm", "Warm / referral (goal 3–5)"),
          text("t_apps", "Targeted apps (goal 4–6)"),
          text("t_outreach", "Direct outreach (goal 3–5)"),
          text("t_proof", "Proof + prep hrs (goal 1–2)"),
          text("t_skill", "Skill-gap hrs (0–4)"),
          text("t_easy", "Easy Apply hours (~0)"),
        ],
      },
      {
        title: "Channel checks",
        fields: [
          check("c_warm", "Warm asked for a specific intro"),
          check("c_li", "LinkedIn: connect without note → message after"),
          check("c_careers", "Apps on careers page when practical"),
          check("c_follow", "Follow-up once at 7–10 business days"),
          check("c_easy", "Easy Apply near zero"),
          check("c_drills", "~2 hrs interview drills"),
          check("c_skill", "Skill hours capped to Chart D row"),
          check("c_skip", "Skipped mass Easy Apply / course binge"),
        ],
      },
      {
        title: "Adjust",
        fields: [
          area("worked", "What worked this week"),
          text("next_double", "Double down next week"),
          text("next_cut", "Cut or cap next week"),
        ],
      },
    ],
  },
  {
    id: "module-exit-0",
    title: "Module 0 Exit",
    stage: "m0",
    blurb: "End-of-module checklist — onboard complete. No mentor meeting required.",
    sections: [
      {
        title: "Lessons (check when done)",
        fields: [
          check("overview", "Module & Mentorship Overview", {
            href: "docs/view.html?doc=m0-welcome.md",
          }),
          check("provided", "What Is Provided", {
            href: "docs/view.html?doc=m0-provided.md",
          }),
          check("expectations_ws", "Expectations worksheet saved in shared folder", {
            href: "docs/view.html?doc=m0-expectations.md",
          }),
          check("communicate", "How To Communicate", {
            href: "docs/view.html?doc=m0-communicate.md",
          }),
        ],
      },
      {
        title: "Networking task",
        fields: [
          text("slack_replies", "Names of 2–3 people I replied to"),
          area("intro_draft", "My intro (fill-in blanks used)"),
        ],
      },
      {
        title: "Habit",
        fields: [
          text("health_habit", "Health habit I started (sleep / exercise / water)"),
          check("ready", "Ready for Module 1"),
        ],
      },
    ],
  },
  {
    id: "module-exit-1",
    title: "Module 1 Exit",
    stage: "m1",
    blurb: "End-of-module checklist — path, goals, habits. No roadmap meeting required.",
    sections: [
      {
        title: "Documents / worksheets saved",
        fields: [
          check("overview", "Overview + tools installed"),
          check("principles", "Principles & Values worksheet saved"),
          check("bumps", "Bumps Ahead reviewed"),
          check("goals", "Goals Planning done"),
          check("roadmap_assess", "Roadmap assessment checklist done"),
          check("next_steps", "To Start Learning — next actions written"),
          check("time_energy", "Time & Energy management done"),
          check("habits", "Habits plan written"),
          check("optimal", "Optimal Roadmap worksheet saved"),
        ],
      },
      {
        title: "Fill-ins",
        fields: [
          text("primary_goal", "Primary goal this quarter"),
          area("next_actions", "Next action steps (from To Start Learning)"),
          text("coding_habit", "Coding practice plan (SQL/Python 30m daily)"),
          check("ready", "Ready for Module 2 (or portfolio track)"),
        ],
      },
    ],
  },
  {
    id: "module-exit-2",
    title: "Module 2 Exit",
    stage: "m2",
    blurb: "End-of-module checklist — project plan. Skip with reason if going straight to portfolio.",
    sections: [
      {
        title: "Lessons",
        fields: [
          check("why", "Why Build Full-Stack Project"),
          check("plan_doc", "Mentorship Project Plan + next steps"),
          check("step_by_step", "Project Step-by-Step"),
          check("planning_ws", "Data Related Project Planning worksheet saved (or N/A)"),
        ],
      },
      {
        title: "Project",
        fields: [
          text("project_name", "Project name (or N/A)"),
          text("repo_url", "Repo URL (or N/A)"),
          area("skip_reason", "If skipping Module 2, why / what’s instead"),
          check("upskill_habit", "Upskilling habit started (30+ mins daily)"),
          check("ready", "Ready for Module 3"),
        ],
      },
    ],
  },
  {
    id: "module-exit-3",
    title: "Module 3 Exit",
    stage: "m3",
    blurb: "End-of-module checklist — portfolio package ready for search.",
    sections: [
      {
        title: "Lessons + worksheets",
        fields: [
          check("overview", "Overview"),
          check("design", "Designing Yourself As A Product"),
          check("selling", "Selling Yourself As A Product worksheet saved"),
          check("impact", "How To Measure Impact"),
          check("li_max", "Maximize LinkedIn checklist"),
          check("port_max", "Maximize Portfolio checklist"),
          check("resume_max", "Maximize Resume checklist"),
          check("cover_max", "Maximize Cover Letter checklist"),
        ],
      },
      {
        title: "Product summary (networking task)",
        fields: [
          area("product_summary", "Product summary"),
          text("one_liner", "One-liner"),
          text("slack_posted", "Posted in #3-optimizing-portfolio (date)"),
          check("asked_feedback", "Asked for feedback"),
          check("portfolio_habit", "Portfolio Touch-Up habit started (30m daily)"),
          check("ready", "Ready for Module 4 — Job Search"),
        ],
      },
    ],
  },
  {
    id: "module-exit-5",
    title: "Module 5 Exit",
    stage: "5",
    blurb: "End-of-module interview checklist — practice without waiting for a company loop.",
    sections: [
      {
        title: "Lessons",
        fields: [
          check("overview", "Module 5 Overview"),
          check("general", "Interviewing In General"),
          check("prepare", "How to prepare for an interview"),
          check("technical", "How to prepare for technical interview steps"),
          check("pre", "Pre-Interview Checklist reviewed"),
          check("post", "Post-Interview Checklist reviewed"),
          check("rejection", "Post-Rejection reviewed"),
        ],
      },
      {
        title: "Worksheets + practice",
        fields: [
          check("prep_script", "Interview Prep Script worksheet filled (in app or Drive)"),
          check("prep_list", "Interview Prep Checklist worksheet filled"),
          text("mock_peers", "Mock interview partners (2 names) or ask posted in #5-interview-prep"),
          check("habit", "Interview prep habit started (45m daily)"),
          check("ready", "Ready for Module 6 / offers"),
        ],
      },
    ],
  },
  {
    id: "module-exit-6",
    title: "Module 6 Exit",
    stage: "7",
    blurb: "End-of-module offer checklist — negotiate without a meeting gate.",
    sections: [
      {
        title: "Lessons",
        fields: [
          check("overview", "Overview"),
          check("general", "Negotiations In General"),
          check("expected", "How to answer what’s your expected salary"),
          check("package", "Negotiating The Complete Compensation Package"),
          check("mistakes", "Learn From mentor mistakes"),
        ],
      },
      {
        title: "Practice + worksheet",
        fields: [
          check("comp_ws", "Complete Compensation Planning worksheet filled"),
          area("salary_script", "Expected-salary negotiation script (both sides)"),
          check("daily_practice", "Practicing salary expectation cycle daily"),
          check("ready", "Module 6 complete"),
        ],
      },
    ],
  },
];

export function worksheet_by_id(id) {
  return WORKSHEETS.find((w) => w.id === id);
}

export function empty_worksheet_answers() {
  return {};
}
