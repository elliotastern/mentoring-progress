/** Plain-language definitions for hover tips (aim: clear to a 5th grader). */

export const GLOSSARY = {
  Foundations:
    "Modules 0-3 you finish before Job Search stages open. Like learning the rules before the game.",
  Modules:
    "The chapters of the program (0-4). Module 4 is Job Search.",
  "Job Search":
    "Module 4 - looking for jobs, sending applications, and practicing interviews.",
  "Module 4":
    "Job Search: Aim → Package → Apply → Interview → Offer, plus Weekly once Modules 0-3 are done.",
  "Chart A":
    "A ranked list of ways to apply. Warm intros and company careers pages beat Easy Apply.",
  "Chart B":
    "Where hires actually come from by source (boards make volume; warm/recruiter are efficient).",
  "Role + path":
    "Pick the job type you want and how you’ll get ready (apply now, or build a project first).",
  "Job Target":
    "The job title(s) you’re aiming for. You can pick more than one.",
  "Search-ready":
    "You’re ready to apply for jobs now. You can skip building a big new project.",
  "Build-proof":
    "You’ll make a project that shows what you can do, then apply.",
  Track:
    "The kind of data job you want (like Analyst or Engineer). Pick one or more.",
  Path:
    "Your plan: apply soon, or build a project first.",
  "Hours/week":
    "How many hours each week you’ll spend applying and building skills.",
  "Want a job by":
    "When you want an offer: ASAP, or pick a target date.",
  "Gap check":
    "A short list of skills to learn for your chosen job type.",
  Module:
    "One chapter of the program with lessons and a checklist.",
  "exit worksheet":
    "The checklist page for a module. Fill it in to finish that module.",
  worksheet:
    "A form you fill in. Your answers save to your login.",
  Guide:
    "A reading page that explains how to do the step.",
  Stage:
    "A step in the job hunt (setup → target role → package → apply…).",
  Tracker:
    "A simple table (like a spreadsheet) where you list every job you apply to.",
  "primary title":
    "The exact job name you want people to see (example: Data Analyst).",
  "public proof":
    "Something online that shows your work - usually GitHub or a website.",
  GitHub:
    "A free website where people store and share code projects.",
  LinkedIn:
    "A website for work profiles. Recruiters look for people there.",
  "comp floor":
    "The lowest pay you’d say yes to. Don’t go below this on purpose.",
  remote:
    "Work from home (not in an office every day).",
  hybrid:
    "Some days at home, some days in an office.",
  stretch:
    "A dream company that’s harder to get into.",
  "stepping stone":
    "A good company that helps you grow toward your dream job.",
  sandbox:
    "A safer practice company - easier to get, good for learning.",
  Package:
    "Your resume, LinkedIn, and project links all matching the same job title.",
  artifact:
    "One clear thing someone can open fast (a chart, README, or demo) to see your work.",
  "Chart E":
    "A score from 0 to 10 that says if a job is worth your time before you apply.",
  "Chart D":
    "A guide for how many hours to spend learning skills vs applying, based on your level.",
  CAR:
    "A short story shape for interviews: Context (what was going on), Action (what you did), Result (what changed).",
  "walk-away":
    "The offer line you will not go below. If they stay under it after one ask, you decline.",
  "total package":
    "All the money and benefits together: base pay, bonus, equity, PTO, and work setup.",
  "Easy Apply":
    "One-click apply buttons (often on LinkedIn). Usually weak - prefer the company careers page.",
  outreach:
    "A short, polite message to a person at the company about the job.",
  referral:
    "When someone who works there introduces you to the hiring team.",
  warm:
    "People you already know (friends, classmates, coworkers) who can introduce you.",
  "careers page":
    "The jobs section on the company’s own website.",
  résumé:
    "A one- or two-page summary of your skills and past work. Same idea as “resume.”",
  resume:
    "A one- or two-page summary of your skills and past work.",
  portfolio:
    "A small set of projects that show what you can do.",
  mentorship:
    "Help from a more experienced person while you look for a data job.",
  mentor:
    "Your coach in this program who reviews your work and answers questions.",
  mentee:
    "You - the person learning and job hunting in this program.",
  SQL:
    "A language for asking questions of data stored in tables (like a smart spreadsheet).",
  Python:
    "A popular coding language used for data and AI work.",
  "ML Engineer":
    "Someone who builds and runs machine-learning systems at work.",
  "Data Analyst":
    "Someone who turns data into clear charts and answers for a team.",
  "Data Scientist":
    "Someone who finds patterns in data and often builds prediction models.",
  "Data Engineer":
    "Someone who builds the pipes that move and store data for others.",
  "AI Researcher":
    "Someone who invents or tests new AI ideas, often with papers and experiments.",
  pipeline:
    "An automatic path that moves data from one place to another, step by step.",
  dashboard:
    "A screen of charts that shows how something is doing (sales, users, errors).",
  BI:
    "Business Intelligence - charts and reports that help a company decide what to do.",
  inference:
    "Using a trained model to make a new prediction (not the training step).",
  "Weekly Loop":
    "Your weekly practice checklist: apply, message people, and practice interviews.",
  Interview:
    "A meeting where the company asks questions to see if you’re a good fit.",
  Slack:
    "The chat app this group uses to say hello and share updates.",
  repo:
    "A project folder on GitHub (short for “repository”).",
  README:
    "A short note at the top of a project that explains what it is and how to run it.",
  recruiter:
    "The person who finds candidates and sets up interviews for a company.",
  Comp:
    "Pay - salary, bonus, and other money parts of a job offer.",
  negotiation:
    "Talking with the company about pay and other offer details after they say yes.",
  Funnel:
    "A count of how many people move from apply → interview → offer (like a filter).",
  "Cold email":
    "An email to someone who doesn’t know you yet. Use sparingly.",
  LLM:
    "A large language model - AI that reads and writes text (like ChatGPT).",
  RAG:
    "A way to make AI answer using your own documents, not only what it memorized.",
  MLOps:
    "Tools and habits for running machine-learning models reliably at work.",
  "cover letter":
    "A short note with your resume that says why you want that job.",
  Onboard:
    "Getting set up in the program (accounts, expectations, how we talk).",
  "skills fork":
    "Choosing how many hours to spend learning vs applying, based on your level.",
  "Loop-ready":
    "Ready for a full set of interview rounds without scrambling.",
  Offer:
    "When a company says they want to hire you and shares pay details.",
  equity:
    "Company stock or options - a piece of ownership, not cash salary.",
};

/** Longer phrases first so we match “Chart E” before “Chart”. */
const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

export function glossary_def(term) {
  return GLOSSARY[term] || "";
}

function is_boundary_before(raw, i) {
  if (i === 0) return true;
  return /[\s([{/\-]/.test(raw[i - 1]);
}

function is_boundary_after(raw, i) {
  if (i >= raw.length) return true;
  return /[\s)\]},.:;!?\-/]/.test(raw[i]);
}

/**
 * Split plain text into parts; known terms become { type:'tip', term, text }.
 * Scans left-to-right; longer glossary keys win.
 */
export function tip_parts(text) {
  const raw = String(text || "");
  if (!raw) return [];
  const parts = [];
  let i = 0;
  while (i < raw.length) {
    let hit = null;
    for (const term of TERMS) {
      if (raw.slice(i, i + term.length).toLowerCase() !== term.toLowerCase()) continue;
      if (is_boundary_before(raw, i) && is_boundary_after(raw, i + term.length)) {
        hit = term;
        break;
      }
    }
    if (hit) {
      parts.push({ type: "tip", term: hit, text: raw.slice(i, i + hit.length) });
      i += hit.length;
    } else {
      const start = i;
      i += 1;
      while (i < raw.length) {
        let next = false;
        for (const term of TERMS) {
          if (raw.slice(i, i + term.length).toLowerCase() !== term.toLowerCase()) continue;
          if (is_boundary_before(raw, i) && is_boundary_after(raw, i + term.length)) {
            next = true;
            break;
          }
        }
        if (next) break;
        i += 1;
      }
      parts.push({ type: "text", text: raw.slice(start, i) });
    }
  }
  return parts;
}
