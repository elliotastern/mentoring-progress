/**
 * Final mentee readiness check for Module 4.
 * Walks Aim → Offer + Weekly, worksheets, guide hashes, auto-checks, unlocks.
 */
import { test, expect } from "@playwright/test";
import { STAGES, WEEKLY } from "../src/data/stages.js";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

const SHEETS = [
  "search-ready",
  "brainstorm",
  "tracker-setup",
  "linkedin",
  "package-match",
  "company-fit",
  "job-optimizer",
  "skills-fork",
  "networking-scripts",
  "weekly-loop",
  "interview-drills",
  "loop-ready",
  "comp-planning",
  "outcomes-review",
];

function collect_guide_hashes() {
  const hashes = new Set(["this-week", "path"]);
  for (const stage of STAGES) {
    for (const item of [
      ...(stage.items || []),
      ...(stage.channel_items || []),
      ...Object.values(stage.level_items || {}).flat(),
    ]) {
      const href = item.doc?.href || "";
      const hash = href.split("#")[1];
      if (hash) hashes.add(hash);
    }
  }
  for (const item of WEEKLY.items || []) {
    const hash = item.doc?.href?.split("#")[1];
    if (hash) hashes.add(hash);
  }
  return [...hashes];
}

async function sign_in(page) {
  await page.addInitScript(() => {
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
  });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function set_progress(page, progress) {
  await page.addInitScript((p) => {
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    try {
      const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
      if (!session?.uid) return;
      localStorage.setItem(
        "mentorship_progress_test_v2_" + session.uid,
        JSON.stringify(p),
      );
    } catch {
      /* ignore */
    }
  }, progress);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]");
}

async function open_job_search(page) {
  const m4 = page.getByTestId("job-search-fold");
  await expect(m4).toBeVisible({ timeout: 10000 });
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
}

function mentorship_ready_progress(overrides = {}) {
  return {
    checks: {
      _pad: true,
      m3_resume: true,
      m3_portfolio: true,
      m3_linkedin: true,
      m4_overview: true,
      m4_tracker: true,
    },
    highest_unlocked: "0",
    stage_schema: 4,
    foundations_complete: true,
    skill_level: "",
    answers: {
      role_track: "ds",
      role_tracks: ["ds"],
      search_path: "search_ready",
    },
    worksheets: {},
    weekly_tallies: {},
    ...overrides,
  };
}

test.describe("Module 4 final mentee check", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("Setup + Apply flat under Module 4; Later fold and Weekly Loop in later/ only", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "0" }));
    await open_job_search(page);

    await expect(page.getByTestId("job-search-path")).toContainText(/Setup.*Apply/);
    await expect(page.getByTestId("job-search-path")).not.toContainText(/Interview|Offer|Package|Aim/);
    const applying = page.getByTestId("m4-step-applying");
    if (!(await applying.evaluate((el) => el.open))) {
      await applying.locator("summary").first().click({ force: true });
    }
    await expect(page.getByTestId("m4-applying-flat")).toBeVisible();
    await expect(page.locator('[data-fold-id="stage_0"]')).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_1"]')).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_2"]')).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_3"]')).toHaveCount(0);
    await expect(page.getByTestId("later-fold")).toHaveCount(0);
    await expect(page.getByTestId("weekly-fold")).toHaveCount(0);

    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "1" }));
    await open_job_search(page);
    await expect(page.getByTestId("later-fold")).toHaveCount(0);
    await expect(page.getByTestId("weekly-fold")).toHaveCount(0);
  });

  test("title answer does not auto-tick Aim primary_title", async ({ page }) => {
    await sign_in(page);
    await set_progress(
      page,
      mentorship_ready_progress({
        answers: {
          role_track: "ds",
          role_tracks: ["ds"],
          search_path: "search_ready",
          title: "Data Scientist",
        },
        worksheets: { brainstorm: { primary_title: "Data Scientist" } },
      }),
    );
    const stored = await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
      const p = JSON.parse(
        localStorage.getItem("mentorship_progress_test_v2_" + session.uid) || "{}",
      );
      return {
        primary_title: Boolean(p.checks?.primary_title),
        tracker: Boolean(p.checks?.tracker),
      };
    });
    expect(stored.primary_title).toBe(false);
    expect(stored.tracker).toBe(false);
  });

  test("every Module 4 worksheet opens and has fields", async ({ page }) => {
    await sign_in(page);
    for (const id of SHEETS) {
      await page.goto(`${BASE}/?ws=${encodeURIComponent(id)}`, {
        waitUntil: "networkidle",
      });
      if (id === "search-ready") {
        const redirect = page.getByTestId("ws-search-ready-redirect");
        await expect(redirect, "search-ready redirects").toBeVisible({ timeout: 15000 });
        await expect(redirect.getByRole("button", { name: /Back to Module 4/i })).toBeVisible();
        continue;
      }
      const panel_id =
        id === "company-fit" || id === "job-optimizer" ? id : `ws-inline-${id}`;
      const panel = page.getByTestId(panel_id);
      await expect(panel, `sheet ${id}`).toBeVisible({ timeout: 15000 });
      const fields = panel.locator(".ws-field, .ws-check, input, textarea");
      await expect(fields.first(), `sheet ${id} has fields`).toBeVisible();
      const done = page.getByRole("button", { name: /Done/i });
      if (await done.count()) await done.click();
      else await page.keyboard.press("Escape");
    }
  });

  test("Mentee can check Tracker ready and open brainstorm under Setup 1", async ({
    page,
  }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "0" }));
    await open_job_search(page);
    const step1 = page.getByTestId("m4-step-prereq");
    const step3 = page.getByTestId("m4-step-tracker");
    const applying = page.getByTestId("m4-step-applying");
    if (!(await step1.evaluate((el) => el.open))) {
      await step1.locator("summary").first().click({ force: true });
    }
    if (!(await step3.evaluate((el) => el.open))) {
      await step3.locator("summary").first().click({ force: true });
    }
    if (!(await applying.evaluate((el) => el.open))) {
      await applying.locator("summary").first().click({ force: true });
    }

    await expect(step1.getByRole("link", { name: /Next position brainstorm/i })).toBeVisible();
    await expect(applying.getByRole("link", { name: /Next position brainstorm/i })).toHaveCount(0);
    await expect(step3.getByRole("link", { name: /Tracker setup/i }).first()).toBeVisible();
    await expect(applying.getByRole("link", { name: /LinkedIn/i })).toHaveCount(0);
    await expect(applying.getByText(/One primary title chosen/i)).toHaveCount(0);
    await expect(applying.getByText(/Answer: my primary title/i)).toHaveCount(0);
    await expect(applying.locator(".answer-field")).toHaveCount(0);

    const tracker_box = step3.locator('[data-check-id="m4_tracker"] input[type=checkbox]');
    await expect(tracker_box).toHaveCount(1);
    await tracker_box.check();
    await expect(tracker_box).toBeChecked();

    await step1.getByRole("link", { name: /Next position brainstorm/i }).click();
    const panel = page.getByTestId("ws-inline-brainstorm");
    await expect(panel).toBeVisible({ timeout: 15000 });
    await panel.getByLabel(/Primary title/i).fill("Data Scientist");
    const done = page.getByRole("button", { name: /Done/i });
    if (await done.count()) await done.click();
  });

  test("Apply tools exist: dashboard + Company Fit (level + answer gate hidden for later)", async ({
    page,
  }) => {
    await sign_in(page);
    await set_progress(
      page,
      mentorship_ready_progress({ highest_unlocked: "1", skill_level: "mid" }),
    );
    await open_job_search(page);
    const applying = page.getByTestId("m4-step-applying");
    if (!(await applying.evaluate((el) => el.open))) {
      await applying.locator("summary").first().click({ force: true });
    }
    await expect(
      applying.getByRole("link", { name: /Weekly Application Dashboard/i }),
    ).toBeVisible();
    await expect(applying.getByRole("link", { name: /Company Fit/i }).first()).toBeVisible();
    await expect(applying.getByText(/Give this job a Job effort score/i)).toHaveCount(0);
    await expect(applying.getByText(/level row/i)).toHaveCount(0);
    await expect(applying.getByText(/Channels \(/i)).toHaveCount(0);
    await expect(applying.getByTestId("stage-level-select")).toHaveCount(0);
    await expect(applying.getByText(/Job effort score on the last job/i)).toHaveCount(0);
    await expect(applying.getByText(/assumed/i)).toHaveCount(0);
    await expect(applying.getByText(/extra skill/i)).toHaveCount(0);
  });

  test("Interview + Offer stay in later/ (not on site)", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "3" }));
    await open_job_search(page);
    await expect(page.getByTestId("later-fold")).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_2"]')).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_3"]')).toHaveCount(0);
  });

  test("every stage Guide hash resolves in Overview v8", async ({ page }) => {
    const hashes = collect_guide_hashes();
    const missing = [];
    for (const hash of hashes) {
      await page.goto(`${BASE}/docs/view.html?doc=overview-v8.md#${hash}`, {
        waitUntil: "networkidle",
      });
      await page.waitForTimeout(500);
      const found = await page.evaluate((h) => Boolean(document.getElementById(h)), hash);
      if (!found) missing.push(hash);
    }
    expect(missing, `broken guide hashes: ${missing.join(", ")}`).toEqual([]);
  });

  test("Overview This week + Job effort score sections are mentee-readable", async ({ page }) => {
    await page.goto(`${BASE}/docs/view.html?doc=overview-v8.md#this-week`, {
      waitUntil: "networkidle",
    });
    await page.waitForTimeout(600);
    await expect(page.locator("#this-week")).toBeVisible();
    const week = await page.locator("#this-week").evaluate((el) => {
      let n = el.nextElementSibling;
      const parts = [];
      while (n && n.tagName !== "H2") {
        parts.push(n.innerText || "");
        n = n.nextElementSibling;
      }
      return parts.join(" ").replace(/\s+/g, " ");
    });
    expect(week.toLowerCase()).toMatch(/warm|careers|follow/);

    await page.goto(
      `${BASE}/docs/view.html?doc=overview-v8.md#before-you-apply-chart-e-effort-score-0-10`,
      { waitUntil: "networkidle" },
    );
    await page.waitForTimeout(600);
    await expect(page.locator("#before-you-apply-chart-e-effort-score-0-10")).toBeVisible();
    const body = await page.locator("article").innerText();
    expect(body.toLowerCase()).toMatch(/0 to 10|job effort score|interest|core fit/);
  });

  test("Module 3 Portfolio includes role-matched proof checks", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "0" }));
    const m3 = page.locator('[data-fold-id="mod_m3"]');
    await expect(m3).toHaveCount(1);
    if (!(await m3.evaluate((el) => el.open))) {
      await m3.locator("summary").first().click({ force: true });
    }
    await expect(m3.locator('[data-check-id="projects"]')).toBeVisible();
    await expect(m3.locator('[data-check-id="artifact"]')).toBeVisible();
    await expect(m3.locator('a[href*="package-match"]').first()).toBeVisible();
  });
});
