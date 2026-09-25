/**
 * Audit Module 4: which checks are auto-checked without mentee M4 work?
 *
 * Usage:
 *   PROGRESS_BASE_URL=http://127.0.0.1:4173/mentoring-progress node scripts/m4-auto-check-audit.mjs
 */
import { chromium } from "playwright";
import { STAGES, WEEKLY } from "../src/data/stages.js";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

function all_m4_check_ids() {
  const ids = new Set(["m4_overview"]);
  for (const stage of STAGES) {
    for (const item of stage.items || []) ids.add(item.id);
    for (const item of stage.channel_items || []) ids.add(item.id);
    for (const rows of Object.values(stage.level_items || {})) {
      for (const item of rows) ids.add(item.id);
    }
  }
  for (const item of WEEKLY.items || []) ids.add(item.id);
  return [...ids];
}

const M4_IDS = all_m4_check_ids();

async function wait_app(page) {
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 25000 });
}

async function seed(page, progress) {
  await page.addInitScript((p) => {
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    const SESSION_KEY = "mentorship_session_v2";
    const PREFIX = "mentorship_progress_test_v2_";
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.uid) return;
      localStorage.setItem(PREFIX + session.uid, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, progress);
  await page.reload({ waitUntil: "networkidle" });
  await wait_app(page);
}

async function read_checks(page) {
  return page.evaluate((m4_ids) => {
    const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
    const key =
      (window.__MENTORSHIP_TEST_ISOLATE__ || navigator.webdriver
        ? "mentorship_progress_test_v2_"
        : "mentorship_progress_v2_") + session.uid;
    const p = JSON.parse(localStorage.getItem(key) || "{}");
    const checks = p.checks || {};
    const checked_m4 = {};
    for (const id of m4_ids) {
      if (checks[id]) checked_m4[id] = true;
    }
    return {
      highest: p.highest_unlocked,
      answers: p.answers || {},
      worksheets: Object.keys(p.worksheets || {}),
      checked_m4,
      all_true_check_ids: Object.keys(checks).filter((k) => checks[k]),
    };
  }, M4_IDS);
}

async function ui_checked_in_m4(page) {
  const m4 = page.getByTestId("job-search-fold");
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
  // Open every stage + weekly so inputs exist
  for (const id of ["0", "1", "2", "3", "4"]) {
    const fold = page.locator(`[data-fold-id="stage_${id}"]`);
    if ((await fold.count()) && !(await fold.evaluate((el) => el.open))) {
      await fold.locator("summary").first().click({ force: true });
    }
  }
  const weekly = page.getByTestId("weekly-fold");
  if ((await weekly.count()) && !(await weekly.evaluate((el) => el.open))) {
    await weekly.locator("summary").first().click({ force: true });
  }

  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="job-search-fold"]');
    if (!root) return [];
    const out = [];
    for (const input of root.querySelectorAll('input[type="checkbox"]')) {
      if (!input.checked) continue;
      const label =
        input.closest("label")?.innerText?.replace(/\s+/g, " ").trim() ||
        input.getAttribute("aria-label") ||
        input.id ||
        "(unknown)";
      out.push({ id: input.id || input.name || "", label: label.slice(0, 120) });
    }
    return out;
  });
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  window.__MENTORSHIP_TEST_ISOLATE__ = true;
});
const page = await context.newPage();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await wait_app(page);

const scenarios = [
  {
    name: "A: bare M4 start (no title, no M3)",
    progress: {
      checks: { _audit: true },
      highest_unlocked: "0",
      stage_schema: 2,
      foundations_complete: true,
      skill_level: "",
      answers: { role_track: "ds", role_tracks: ["ds"], search_path: "search_ready" },
      worksheets: {},
    },
  },
  {
    name: "B: M4-ready gate only (m3 + Job Target title, empty worksheets)",
    progress: {
      checks: {
        _audit: true,
        m3_resume: true,
        m3_portfolio: true,
        m3_linkedin: true,
      },
      highest_unlocked: "0",
      stage_schema: 2,
      foundations_complete: true,
      skill_level: "",
      answers: {
        role_track: "ds",
        role_tracks: ["ds"],
        search_path: "search_ready",
        title: "Data Scientist",
      },
      worksheets: {},
    },
  },
  {
    name: "C: M3 done, NO title answer",
    progress: {
      checks: {
        _audit: true,
        m3_resume: true,
        m3_portfolio: true,
        m3_linkedin: true,
      },
      highest_unlocked: "0",
      stage_schema: 2,
      foundations_complete: true,
      skill_level: "",
      answers: { role_track: "ds", role_tracks: ["ds"], search_path: "search_ready" },
      worksheets: {},
    },
  },
];

const report = [];

for (const sc of scenarios) {
  await seed(page, sc.progress);
  // Give derive/reconcile a beat
  await page.waitForTimeout(400);
  const stored = await read_checks(page);
  const ui = await ui_checked_in_m4(page);
  const row = {
    scenario: sc.name,
    checked_m4_ids: Object.keys(stored.checked_m4).sort(),
    ui_checked: ui,
    answers_title: stored.answers.title || "",
    mirrored: {
      resume: stored.all_true_check_ids.includes("resume"),
      linkedin: stored.all_true_check_ids.includes("linkedin"),
      github: stored.all_true_check_ids.includes("github"),
      primary_title: stored.all_true_check_ids.includes("primary_title"),
    },
  };
  report.push(row);
  console.log("\n=== " + sc.name + " ===");
  console.log("M4 checks true:", row.checked_m4_ids.length ? row.checked_m4_ids.join(", ") : "(none)");
  console.log("Mirrored/derived:", JSON.stringify(row.mirrored));
  console.log(
    "UI checked in Module 4 fold:",
    ui.length ? ui.map((x) => x.label).join(" | ") : "(none)",
  );
}

console.log("\n--- JSON ---");
console.log(JSON.stringify(report, null, 2));
await browser.close();
