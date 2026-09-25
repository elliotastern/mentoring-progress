/** Private fill-in worksheets - answers live in progress.worksheets[id] (login only). */

import { COMMUNITY_LATER_WORKSHEET } from "./communityLater.js";

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
          check(
            "col_chart_e",
            "Chart E score (0-10) - leave blank until Apply; then 0-10 before heavy effort",
          ),
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
        title: "Smoke test - one practice row",
        fields: [
          text("practice_employer", "Employer"),
          text("practice_role", "Role"),
          text("practice_source", "Source"),
          text("practice_chart_e", "Chart E", "0-10"),
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
          text("keywords", "3-5 role keywords (from real posts)", "keyword1 / keyword2 / …"),
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
          area("role_a_bullets", "Role A - first 2 bullets"),
          text("role_b", "Role B title"),
          area("role_b_bullets", "Role B - first 2 bullets"),
        ],
      },
    ],
  },
  {
    id: "brainstorm",
    title: "Next Position Brainstorm",
    stage: "0",
    blurb: "Pick one title and a 10-15 company list.",
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
        title: "Company list (10-15)",
        fields: [
          area("stretch", "Stretch (~3)", "Company 1\nCompany 2\n…"),
          area("stepping", "Stepping stone (~4-9)"),
          area("sandbox", "Sandbox (~3)"),
        ],
      },
    ],
  },
  {
    id: "package-match",
    title: "Package Match",
    stage: "1",
    blurb:
      "Match 1–2 proof projects + a 6-second artifact to your target title. Resume / LinkedIn / public home are from Module 3 (confirm they still match this title in the optional fields below).",
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
        title: "Proof for this title (required)",
        fields: [
          text("project_1", "Proof project 1 + URL"),
          text("project_2", "Proof project 2 + URL (optional)"),
          text("best_artifact", "Best artifact a stranger can open in ~6 seconds"),
          check("projects_done", "1–2 proof projects look like that job’s day-to-day work"),
          check("artifact_done", "6-second artifact is ready to share"),
        ],
      },
      {
        title: "Optional — confirm Module 3 still matches this title",
        note: "Already done in Module 3. Only tweak if Aim changed your title.",
        fields: [
          area("resume_summary", "Summary (matched) — optional"),
          area("resume_bullets", "Top 3 bullets (matched) — optional"),
          check("resume_skills", "Skills line still matches the title"),
          check("resume_ats", "ATS keywords still match (optional re-check)"),
          check("li_about", "About still matches the same title"),
          check("li_headline", "Headline still matches title keywords"),
          check("github_live", "GitHub still public and linked"),
          check("site_live", "Personal site still public and linked (optional)"),
        ],
      },
    ],
  },
  {
    id: "chart-e",
    title: "Chart E Role Scorecard",
    stage: "2",
    blurb:
      "Score a role 0-10 before you invest time. Duplicate by editing for each new role. Example: strong interest + fit + warm contact often lands 8 (full effort); no contact + weak proof often lands under 6 (skip).",
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
        note: "Interest: 0 would not accept · 1 acceptable · 2 strongly want. Core fit: 0 major gaps · 1 mostly qualified · 2 direct match. Proof: 0 weak · 1 related · 2 strong quantified. Human access: 0 none · 1 possible · 2 warm/referral. Logistics: 0 major conflict · 1 workable · 2 remote/part-time/pay fit. Totals: 8-10 full effort · 6-7 apply + one note · 0-5 usually skip.",
        fields: [
          text("s_interest", "Interest (0-2)", "0 / 1 / 2"),
          text("s_fit", "Core fit (0-2)", "0 / 1 / 2"),
          text("s_proof", "Proof (0-2)", "0 / 1 / 2"),
          text("s_access", "Human access (0-2)", "0 / 1 / 2"),
          text("s_logistics", "Logistics (0-2)", "0 / 1 / 2"),
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
    stage: "2",
    blurb:
      "Paste Overview Templates, then tweak. LinkedIn: connect with no note → message after accept. No long pitches on the invite.",
    sections: [
      {
        title: "Warm / referral",
        note: "Ask for a specific intro. Keep it short.",
        fields: [
          area(
            "warm_script",
            "Warm lead script",
            "Hi [Name] - I’m applying for [role] at [company]. My work in [area] aligns, especially [one result]. If you’re comfortable, would you refer me or point me to the right person?",
          ),
        ],
      },
      {
        title: "LinkedIn after connect",
        note: "Connection request stays blank. This is the first message after they accept.",
        fields: [
          area(
            "li_script",
            "First message after they accept",
            "Hi [Name] - thanks for connecting. I noticed your work on [topic]. I’m exploring [role type] and would value [one clear ask].",
          ),
        ],
      },
      {
        title: "Hiring manager / recruiter",
        fields: [
          area(
            "hm_script",
            "Hiring manager / data lead note",
            "Hi [Name] - I applied for [role]. I have [years/type] in [two capabilities], including [one result]. Example: [portfolio link].",
          ),
          area(
            "recruiter_script",
            "Named posting recruiter note",
            "Hi [Name] - I applied for [role] on the careers page. Quick fit: [one result]. Portfolio: [link].",
          ),
        ],
      },
      {
        title: "Wellfound / startup board",
        fields: [
          area(
            "wellfound_script",
            "Wellfound-style message (saved)",
            "Hi [Name] - interested in [role] because [company reason]. I’ve built [related work] and achieved [result]. Portfolio: [link].",
          ),
          check("wellfound_done", "Wellfound-style message drafted and saved"),
        ],
      },
      {
        title: "Follow-up",
        note: "One note at 7-10 business days, then move on.",
        fields: [
          area(
            "followup_script",
            "7-10 business day follow-up",
            "Hi [Name] - following up on my application for [role] submitted on [date]. Still interested. Happy to share [one proof] if useful.",
          ),
        ],
      },
    ],
  },
  {
    id: "skills-fork",
    title: "Skills Fork (Chart D)",
    stage: "2",
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
          area("entry_projects", "3-4 end-to-end projects (list)"),
          check("entry_readme", "Each: messy data → ship → README with problem + metric"),
          check("entry_certs", "Certificates are not substituting for proof"),
          check("entry_python", "Python skill shown in a public project / notebook"),
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
    stage: "3",
    blurb:
      "Weekly practice in parallel with applying. Starter SQL: (1) Employee Salaries 15m (2) Average Population of Each Continent 20m (3) African Cities 25m on HackerRank. Case example: retention drop after pricing - decide keep/rollback with a metric.",
    sections: [
      {
        title: "This week",
        fields: [text("week_of", "Week of", "e.g. Sep 22, 2026")],
      },
      {
        title: "Timed SQL (~2 hrs)",
        note: "Starter set under a clock: Employee Salaries (15m) · Average Population of Each Continent (20m) · African Cities (25m). Pass = correct + one-sentence why.",
        fields: [
          area(
            "sql_log",
            "Log (date · problem/link · minutes · pass?)",
            "e.g. Mon - Employee Salaries - 15m - pass",
          ),
          text("sql_last_date", "Date of last timed SQL"),
          check("sql_done", "~2 hours live SQL under a clock this week"),
        ],
      },
      {
        title: "Case as a business decision",
        note: "Example prompt: Retention dropped 5% after a pricing change. Should we roll it back? Argue a decision with one metric (not a tech dump).",
        fields: [
          text(
            "case_prompt",
            "Prompt / company context",
            "e.g. Retention dropped 5% after pricing change",
          ),
          text(
            "case_decision",
            "Decision I argued",
            "e.g. Keep price; fix onboarding",
          ),
          text(
            "case_metric",
            "Metric / evidence",
            "e.g. Week-4 cohort retention + ticket spike",
          ),
          check("case_aloud", "Told out loud as a business decision (not a tech dump)"),
        ],
      },
      {
        title: "Loop map",
        fields: [
          text(
            "loop_list",
            "Usual 4-6 rounds (name them)",
            "recruiter → timed SQL → stats/ML → case → behavioral",
          ),
          check("loop_named", "I can name the usual loop without looking it up"),
          check("drills_habit", "Drills habit on (~2 hrs/wk SQL + case while applying)"),
        ],
      },
    ],
  },
  {
    id: "loop-ready",
    title: "Loop-Ready Pack",
    stage: "3",
    blurb:
      "Be ready when Chart A produces a screen - intro, SQL/case kit, CAR stories, day-of.",
    sections: [
      {
        title: "60-second recruiter intro",
        note: "Shape: role → one proof metric → why this company type → clear ask.",
        fields: [
          area(
            "intro",
            "Script (role → one proof metric → why this company type → clear ask)",
            "I'm targeting [role]. Last project [metric]. I apply to [company type]. Would love 15 minutes on [ask].",
          ),
          check("intro_aloud", "Practiced aloud"),
        ],
      },
      {
        title: "Knock-out kit",
        note: "SQL warm-up once: Employee Salaries 15m · Average Population of Each Continent 20m · African Cities 25m (HackerRank).",
        fields: [
          area(
            "sql_set",
            "Timed SQL warm-up set (3 prompts + time caps + date done once)",
            "1) Employee Salaries 15m - date\n2) Avg Population Cont. 20m - date\n3) African Cities 25m - date",
          ),
          check("sql_set_done", "Warm-up set completed once under a clock"),
          area(
            "case_story",
            "One case story (problem → method → decision → result)",
            "Problem → method → decision → result (one metric)",
          ),
          check("case_story_done", "Case story drafted end-to-end"),
        ],
      },
      {
        title: "Behavioral story bank (CAR)",
        note: "CAR = Context → Action (what you did) → Result (metric). Three stories: conflict, impact, miss/lesson. ~90 seconds each aloud.",
        fields: [
          area("car_conflict", "1) Conflict - Context / Action / Result"),
          area("car_impact", "2) Impact - Context / Action / Result"),
          area("car_miss", "3) Miss / failure - Context / Action / Result"),
          check("car_aloud", "All 3 practiced aloud"),
        ],
      },
      {
        title: "Top scripts",
        fields: [
          area(
            "why_company",
            "Why this company (specific product/problem)",
            "I'm interested because [product/problem]…",
          ),
          area(
            "project_walk",
            "Walk me through a project (problem → method → decision → result)",
          ),
          check("scripts_aloud", "Why-this-company + project walk-through practiced aloud"),
        ],
      },
      {
        title: "Day-of (once per real screen)",
        fields: [
          area("day_jd", "Pre: JD core terms (title, level, tools, must-haves)"),
          area("day_qs", "Pre: 3 questions I will ask"),
          check("day_setup", "Mic / camera / quiet space checked"),
          text("day_win", "Post: one win"),
          text("day_fix", "Post: one fix next time"),
          text("day_surprise", "Post: surprising question they asked"),
          check("dayof_done", "Day-of pre/post done once"),
        ],
      },
      {
        title: "Tracker interview log",
        fields: [
          check(
            "notes_fields",
            "Tracker columns ready: round, date, what went well, fix next",
          ),
        ],
      },
      {
        title: "After a screen + companies",
        fields: [
          check("note_same_day", "Same-day note habit: one win + one fix"),
          check(
            "followup_habit",
            "Follow-up once at 7-10 business days (Overview This week)",
          ),
          text("company_1", "Company 1 I'm ready to interview with"),
          text("company_2", "Company 2"),
          text("company_3", "Company 3"),
        ],
      },
    ],
  },
  {
    id: "comp-planning",
    title: "Compensation Planning",
    stage: "4",
    blurb:
      "Floor before money comes up; expected-salary defence; negotiate once on total package.",
    sections: [
      {
        title: "Floor",
        fields: [
          text("city", "City / market"),
          text("title", "Target title"),
          text("market_range", "Market range researched"),
          text("minimum", "Minimum annual base I would take now", "$"),
          text("walkaway", "Walk-away / must-have offer line"),
          check("comp_done", "Comp range researched for my title + market"),
        ],
      },
      {
        title: "Must vs nice",
        fields: [
          area("must_have", "Must-haves (ranked)"),
          area("nice_have", "Nice-to-haves (ranked)"),
          check("criteria_done", "Must-have vs nice-to-have criteria written"),
        ],
      },
      {
        title: "Expected-salary defence ladder",
        note: "Order: deflect early → market range → floor-anchored ask → total package. Do not invent a lowball.",
        fields: [
          area(
            "deflect",
            "1) Deflect early",
            "Could you share the range for this level? I'd like to understand the role and total package first.",
          ),
          area(
            "market_reply",
            "2) Market range reply",
            "For [title] in [city], I'm seeing about [low]-[high].",
          ),
          area(
            "floor_ask",
            "3) Floor-anchored ask",
            "My floor is about $[minimum]. Happy to talk total package once we've confirmed fit.",
          ),
          area(
            "salary_script",
            "Full reply I'll use (anchored to my floor)",
          ),
          check("salary_ready", "Defence ladder written from my floor"),
          check("salary_practiced", "Practiced out loud"),
        ],
      },
      {
        title: "When you have an offer",
        note: "Negotiate once. Thank → interest → research ask → listen. Walk away if still below floor.",
        fields: [
          check("lever_base", "Lever: base"),
          check("lever_bonus", "Lever: bonus / variable"),
          check("lever_equity", "Lever: equity / RSUs"),
          check("lever_pto", "Lever: PTO / flexibility"),
          check("lever_start", "Lever: start date"),
          check("lever_remote", "Lever: remote / hybrid"),
          check("levers_done", "Total-comp levers listed"),
          area(
            "negotiate_script",
            "Ask-once script",
            "Thank you. Excited about [reason]. Based on [research], I'm most comfortable around $[ask]. Can we get there?",
          ),
          text("if_yes", "If yes (accept path)"),
          text("if_no", "If no / below floor (walk-away line)"),
          check("negotiate_done", "Negotiate script written"),
        ],
      },
    ],
  },
  {
    id: "outcomes-review",
    title: "Search Outcomes Review",
    stage: "4",
    blurb:
      "Every 20-30 qualified apps (or monthly). Double down only where your data shows traction (screens / interviews / offers per hour by source).",
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
        title: "By source (outcomes per hour)",
        note: "For each source: apps · screens · interviews · offers · hours. Then decide.",
        fields: [
          area(
            "src_warm",
            "Warm / referral",
            "apps / screens / interviews / offers / hours",
          ),
          area(
            "src_careers",
            "Careers page",
            "apps / screens / interviews / offers / hours",
          ),
          area(
            "src_linkedin",
            "LinkedIn (not Easy Apply)",
            "apps / screens / interviews / offers / hours",
          ),
          area(
            "src_recruiter",
            "Recruiter inbound",
            "apps / screens / interviews / offers / hours",
          ),
          area(
            "src_cold",
            "Cold email",
            "apps / screens / interviews / offers / hours",
          ),
          area(
            "src_easy",
            "Easy Apply",
            "apps / screens / interviews / offers / hours",
          ),
          area("src_other", "Other", "apps / screens / interviews / offers / hours"),
        ],
      },
      {
        title: "Decisions",
        fields: [
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
    blurb: "Fill each week - tallies + channel checks.",
    sections: [
      {
        title: "Week",
        fields: [text("week_of", "Week of")],
      },
      {
        title: "Volume (actual)",
        fields: [
          text("t_warm", "Warm / referral (goal 3-5)"),
          text("t_apps", "Weekly applying target (goal 4-6)"),
          text("t_outreach", "Direct outreach (goal 3-5)"),
          text("t_proof", "Weekly proof building hrs (goal 1-2)"),
          text("t_skill", "Skill-gap hrs (0-4)"),
          text("t_easy", "Easy Apply hours (~0)"),
        ],
      },
      {
        title: "Channel checks",
        fields: [
          check("c_warm", "Warm asked for a specific intro"),
          check("c_li", "LinkedIn: connect without note → message after"),
          check("c_careers", "Apps on careers page when practical"),
          check("c_follow", "Follow-up once at 7-10 business days"),
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
    blurb: "End-of-module checklist - onboard complete. No mentor meeting required.",
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
          check("communicate", "How To Communicate", {
            href: "docs/view.html?doc=m0-communicate.md",
          }),
        ],
      },
      {
        title: "Expectations (structured)",
        fields: [
          check("expectations_ws", "Expectations guide done", {
            href: "docs/view.html?doc=m0-expectations.md",
          }),
          text("hours_week", "Hours/week I can commit", "e.g. 20"),
          text(
            "success_outcome",
            "Success looks like (one line)",
            "e.g. DA offer in 12 weeks"
          ),
        ],
      },
      {
        title: "Resume + cover letter (your own Doc links)",
        fields: [
          text(
            "resume_link",
            "Resume link (Google Doc or hosted PDF)",
            "https://docs.google.com/..."
          ),
          text(
            "cover_link",
            "Cover letter link (Google Doc or hosted PDF)",
            "https://docs.google.com/..."
          ),
        ],
      },
      {
        title: "BONUS - Habit",
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
    blurb: "End-of-module checklist - path, goals, habits. No roadmap meeting required.",
    sections: [
      {
        title: "Documents / worksheets saved",
        fields: [
          check("overview", "Module 1 overview", {
            href: "docs/view.html?doc=m1-overview.md",
          }),
          check("principles", "Principles & Values", {
            href: "docs/view.html?doc=m1-principles.md",
          }),
          check("bumps", "Bumps Ahead", {
            href: "docs/view.html?doc=m1-bumps.md",
          }),
          check("goals", "Goals Planning", {
            href: "docs/view.html?doc=m1-goals.md",
          }),
          check("roadmap_assess", "Roadmap assessment for your track", {
            href: "docs/view.html?doc=m1-roadmap.md",
          }),
          check("next_steps", "To Start Learning/Practicing", {
            href: "docs/view.html?doc=m1-next.md",
          }),
          check("time_energy", "Time & Energy management", {
            href: "docs/view.html?doc=m1-time.md",
          }),
          check("habits", "Habits plan", {
            href: "docs/view.html?doc=m1-habits.md",
          }),
          check("optimal", "Creating the Optimal Roadmap", {
            href: "docs/view.html?doc=m1-optimal.md",
          }),
        ],
      },
      {
        title: "Fill-ins",
        fields: [
          text("primary_goal", "Primary goal this quarter"),
          area("next_actions", "Next action steps (from To Start Learning)"),
          text("coding_habit", "Coding practice plan (SQL/Python 30m daily)"),
          check("ready", "Ready for Project (or portfolio track)"),
        ],
      },
    ],
  },
  {
    id: "module-exit-2",
    title: "Project Exit",
    stage: "m2",
    blurb:
      "End-of-module checklist - role-specific proof. Skip with reason if on Search-ready path.",
    sections: [
      {
        title: "Lessons",
        fields: [
          check("why", "Why build role-specific portfolio proof", {
            href: "docs/view.html?doc=m2-why.md",
          }),
          check("plan_doc", "Mentorship Project Plan", {
            href: "docs/view.html?doc=m2-plan.md",
          }),
          check("step_by_step", "Project Step-by-Step", {
            href: "docs/view.html?doc=m2-steps.md",
          }),
          check("planning_ws", "Project planning worksheet (or skip noted)", {
            href: "docs/view.html?doc=m2-planning-ws.md",
          }),
        ],
      },
      {
        title: "Proof project",
        fields: [
          text("project_name", "Proof name (or N/A)"),
          text("repo_url", "Repo URL (or N/A)"),
          area("skip_reason", "If skipping Project, why / what’s instead"),
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
    blurb: "End-of-module checklist - portfolio package ready for search.",
    sections: [
      {
        title: "Lessons + worksheets",
        fields: [
          check("overview", "Module 3 overview", {
            href: "docs/view.html?doc=m3-overview.md",
          }),
          check("design", "Designing Yourself As A Product", {
            href: "docs/view.html?doc=m3-design.md",
          }),
          check("selling", "Selling Yourself As A Product", {
            href: "docs/view.html?doc=m3-selling.md",
          }),
          check("impact", "How To Measure Impact", {
            href: "docs/view.html?doc=m3-impact.md",
          }),
          check("li_max", "Maximize LinkedIn", {
            href: "docs/view.html?doc=m3-linkedin.md",
          }),
          check("port_max", "Maximize Portfolio", {
            href: "docs/view.html?doc=m3-portfolio.md",
          }),
          check("resume_max", "Maximize Resume", {
            href: "docs/view.html?doc=m3-resume.md",
          }),
          check("cover_max", "Maximize Cover Letter", {
            href: "docs/view.html?doc=m3-cover.md",
          }),
        ],
      },
      {
        title: "Product summary",
        fields: [
          area("product_summary", "Product summary"),
          text("one_liner", "One-liner"),
          check("portfolio_habit", "Portfolio Touch-Up habit started (30m daily)"),
          check("ready", "Ready for Module 4 - Job Search"),
        ],
      },
    ],
  },
  COMMUNITY_LATER_WORKSHEET,
];

export function worksheet_by_id(id) {
  return WORKSHEETS.find((w) => w.id === id);
}

export function empty_worksheet_answers() {
  return {};
}

/** Required text/area fields for Module 0-3 exit worksheets (gates + progress). */
export const EXIT_REQUIRED = {
  "module-exit-0": {
    all: ["hours_week", "success_outcome", "resume_link", "cover_link"],
  },
  "module-exit-1": {
    all: ["primary_goal", "next_actions", "coding_habit"],
  },
  "module-exit-2": {
    all: [],
    any_groups: [["project_name", "skip_reason"]],
  },
  "module-exit-3": {
    all: ["product_summary", "one_liner"],
  },
};

const EXIT_SHEET_IDS = Object.keys(EXIT_REQUIRED);

function field_filled(sheet, field_id) {
  return Boolean(String(sheet?.[field_id] || "").trim());
}

export function sheet_fillin_stats(progress, sheet_id) {
  const req = EXIT_REQUIRED[sheet_id];
  if (!req) return { done: 0, total: 0 };
  const sheet = progress.worksheets?.[sheet_id] || {};
  let done = 0;
  let total = 0;
  for (const id of req.all || []) {
    total += 1;
    if (field_filled(sheet, id)) done += 1;
  }
  for (const group of req.any_groups || []) {
    total += 1;
    if (group.some((id) => field_filled(sheet, id))) done += 1;
  }
  return { done, total };
}

export function sheet_fillins_complete(progress, sheet_id) {
  const stats = sheet_fillin_stats(progress, sheet_id);
  return stats.total === 0 || stats.done >= stats.total;
}

/** Text/area answers mentors should review for Module 0-3 exits. */
export function exit_fillin_fields(sheet_id) {
  const sheet = worksheet_by_id(sheet_id);
  if (!sheet) return [];
  const fields = [];
  for (const section of sheet.sections || []) {
    for (const field of section.fields || []) {
      if (field.type === "text" || field.type === "textarea") {
        fields.push({ id: field.id, label: field.label, type: field.type });
      }
    }
  }
  return fields;
}

export function module_exit_sheet_ids() {
  return EXIT_SHEET_IDS.slice();
}
