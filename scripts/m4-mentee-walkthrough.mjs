/**
 * Module 4 mentee walkthrough v3 — same unlock pattern as m4-disclosure.spec.js
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, "../.tmp/m4-walkthrough");
mkdirSync(OUT, { recursive: true });

const log = [];
function note(step, msg, extra = {}) {
  log.push({ step, msg, ...extra });
  const bit = extra.preview ? " | " + String(extra.preview).slice(0, 140) : "";
  console.log(`[${step}] ${msg}${bit}`);
}

async function wait_app(page) {
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 25000 });
}

async function snip(loc, max = 900) {
  if (!loc) return "";
  const t = ((await loc.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max) + "…" : t;
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
}

/** Force unlock via init script on the isolated test progress key (matches m4-disclosure). */
async function set_unlock(page, highest) {
  await page.addInitScript((h) => {
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    const SESSION_KEY = "mentorship_session_v2";
    const PREFIX = "mentorship_progress_test_v2_";
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.uid) return;
      const key = PREFIX + session.uid;
      localStorage.setItem(
        key,
        JSON.stringify({
          checks: {
            _walk_anchor: true,
            m3_resume: true,
            m3_portfolio: true,
          },
          highest_unlocked: h,
          stage_schema: 2,
          foundations_complete: true,
          skill_level: "mid",
          answers: {
            role_track: "ds",
            role_tracks: ["ds"],
            search_path: "search_ready",
            title: "Data Scientist",
          },
          worksheets: {},
        })
      );
    } catch {
      /* ignore */
    }
  }, highest);
  await page.reload({ waitUntil: "networkidle" });
  await wait_app(page);
  const stored = await page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
    const key = "mentorship_progress_test_v2_" + session.uid;
    const p = JSON.parse(localStorage.getItem(key) || "{}");
    return { highest: p.highest_unlocked, foundations: p.foundations_complete, m3: p.checks?.m3_resume };
  });
  note("seed", `highest=${highest} stored`, stored);
}

async function open_job_search(page) {
  const m4 = page.getByTestId("job-search-fold");
  await m4.waitFor({ timeout: 10000 });
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
}

async function open_stage(page, id) {
  const fold = page.locator(`[data-fold-id="stage_${id}"]`);
  if (!(await fold.count())) return null;
  if (!(await fold.evaluate((el) => el.open))) {
    await fold.locator("summary").first().click({ force: true });
  }
  return fold;
}

const SHEETS = [
  "brainstorm",
  "tracker-setup",
  "linkedin",
  "package-match",
  "chart-e",
  "skills-fork",
  "networking-scripts",
  "weekly-loop",
  "interview-drills",
  "loop-ready",
  "comp-planning",
  "outcomes-review",
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  window.__MENTORSHIP_TEST_ISOLATE__ = true;
});
const page = await context.newPage();

note("home", `goto ${BASE}/`);
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await wait_app(page);
await shot(page, "00-home");

await open_job_search(page);
note("gate", "Before unlock", { preview: await snip(page.getByTestId("job-search-fold"), 600) });

for (const [h, label, stage_id] of [
  ["0", "Aim", "0"],
  ["1", "Package", "1"],
  ["2", "Apply", "2"],
  ["3", "Interview", "3"],
  ["4", "Offer", "4"],
]) {
  await set_unlock(page, h);
  await open_job_search(page);
  note(label.toLowerCase(), "Path", { preview: await snip(page.getByTestId("job-search-path")) });
  const fold = await open_stage(page, stage_id);
  note(label.toLowerCase(), `Stage ${label} visible=${Boolean(fold)}`, {
    preview: await snip(fold, 1600),
  });
  await shot(page, `${h}-${label.toLowerCase()}`);

  if (h === "0") {
    note("aim", "Weekly locked hint", {
      weekly: await page.getByTestId("weekly-fold").count(),
      hint: await snip(page.getByTestId("weekly-locked-hint"), 200),
    });
  }
  if (h === "2") {
    const wn = await page.getByTestId("weekly-fold").count();
    note("weekly", `weekly-fold=${wn}`);
    if (wn) {
      const w = page.getByTestId("weekly-fold");
      if (!(await w.evaluate((el) => el.open))) await w.locator("summary").first().click({ force: true });
      note("weekly", "content", { preview: await snip(w, 1200) });
      await shot(page, "2-weekly");
    }
    // Channel items + level
    note("apply", "Channel / level blocks", {
      preview: await snip(page.locator('[data-fold-id="stage_2"]'), 2000),
    });
  }
}

// Worksheets one by one
for (const id of SHEETS) {
  await page.goto(`${BASE}/?ws=${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
  const panel = page.getByTestId(`ws-inline-${id}`);
  await panel.waitFor({ timeout: 15000 }).catch(() => null);
  const visible = await panel.isVisible().catch(() => false);
  const title = await page.locator(".worksheet-panel h2, .worksheet-panel h1").first().innerText().catch(() => "");
  const sections = await panel.locator(".ws-section").count().catch(() => 0);
  const fields = await panel.locator(".ws-field").count().catch(() => 0);
  const checks = await panel.locator(".ws-check").count().catch(() => 0);
  const texts = await panel.locator("input[type=text], textarea").count().catch(() => 0);
  const blurb = await snip(panel, 1000);
  note("sheet", id, { visible, title, sections, fields, checks, texts, preview: blurb });
  await shot(page, `ws-${id}`);

  // Try filling one field as mentee smoke
  if (visible) {
    const first_text = panel.locator("input[type=text], textarea").first();
    if (await first_text.count()) {
      await first_text.fill("mentee walkthrough test").catch(() => {});
    }
    const done = page.getByRole("button", { name: /Done/i });
    if (await done.count()) await done.click().catch(() => {});
    else await page.keyboard.press("Escape");
  }
}

// Guides
for (const [hash, name] of [
  ["word-bank", "Word bank"],
  ["this-week", "This week"],
  ["path", "Path"],
  ["step-1-job-to-target", "Step 1 Aim"],
  ["step-2-portfolio-resume-for-that-role", "Step 2 Package"],
  ["before-you-apply-chart-e-effort-score-0-10", "Chart E"],
  ["the-numbers-chart-a-offers-per-hour", "Chart A"],
  ["step-3b-skill-build-by-seniority-chart-d", "Chart D"],
  ["step-3a-applying", "Step 3a"],
  ["step-3c-interview-bottleneck", "Step 3c"],
  ["step-3d-offer", "Step 3d"],
  ["templates", "Templates"],
  ["the-numbers-tracking-fields", "Tracking fields"],
]) {
  await page.goto(`${BASE}/docs/view.html?doc=overview-v8.md#${hash}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(400);
  note("guide", name, { hash, preview: await snip(page.locator("body"), 1100) });
  await shot(page, `g-${hash.slice(0, 36)}`);
}

writeFileSync(join(OUT, "log.json"), JSON.stringify(log, null, 2));
console.log(`\nDone. ${log.length} notes → ${OUT}`);
await browser.close();
