/**
 * Final mentee readiness check for Module 4.
 * Walks Aim → Offer + Weekly, worksheets, guide hashes, auto-checks, unlocks.
 */
import { test, expect } from "@playwright/test";
import { STAGES, WEEKLY } from "../src/data/stages.js";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

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
    },
    highest_unlocked: "0",
    stage_schema: 2,
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

  test("all stages visible; Weekly locked until Apply", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "0" }));
    await open_job_search(page);

    await expect(page.getByTestId("job-search-path")).toContainText(
      /Aim.*Package.*Apply.*Interview.*Offer/,
    );
    for (const id of ["0", "1", "2", "3", "4"]) {
      await expect(page.locator(`[data-fold-id="stage_${id}"]`)).toHaveCount(1);
    }
    const weekly = page.getByTestId("weekly-fold");
    await expect(weekly).toHaveCount(1);
    if (!(await weekly.evaluate((el) => el.open))) {
      await weekly.locator("summary").first().click({ force: true });
    }
    await expect(page.getByTestId("weekly-locked-hint")).toBeVisible();

    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "2" }));
    await open_job_search(page);
    const weekly2 = page.getByTestId("weekly-fold");
    if (!(await weekly2.evaluate((el) => el.open))) {
      await weekly2.locator("summary").first().click({ force: true });
    }
    await expect(page.getByTestId("weekly-locked-hint")).toHaveCount(0);
    await expect(weekly2.getByRole("link", { name: /Weekly apply loop/i })).toBeVisible();
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
      return Boolean(p.checks?.primary_title);
    });
    expect(stored).toBe(false);

    await open_job_search(page);
    const aim = page.locator('[data-fold-id="stage_0"]');
    if (!(await aim.evaluate((el) => el.open))) {
      await aim.locator("summary").first().click({ force: true });
    }
    await expect(aim.locator('input[type=checkbox]:checked')).toHaveCount(0);
  });

  test("every Module 4 worksheet opens and has fields", async ({ page }) => {
    await sign_in(page);
    for (const id of SHEETS) {
      await page.goto(`${BASE}/?ws=${encodeURIComponent(id)}`, {
        waitUntil: "networkidle",
      });
      const panel = page.getByTestId(`ws-inline-${id}`);
      await expect(panel, `sheet ${id}`).toBeVisible({ timeout: 15000 });
      const fields = panel.locator(".ws-field, .ws-check, input, textarea");
      await expect(fields.first(), `sheet ${id} has fields`).toBeVisible();
      const done = page.getByRole("button", { name: /Done/i });
      if (await done.count()) await done.click();
      else await page.keyboard.press("Escape");
    }
  });

  test("Aim mentee can check items, fill answer, open brainstorm", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "0" }));
    await open_job_search(page);
    const aim = page.locator('[data-fold-id="stage_0"]');
    if (!(await aim.evaluate((el) => el.open))) {
      await aim.locator("summary").first().click({ force: true });
    }

    // Stage worksheet banner links
    await expect(aim.getByRole("link", { name: /Next position brainstorm/i })).toBeVisible();
    await expect(aim.getByRole("link", { name: /Tracker setup/i })).toBeVisible();
    await expect(aim.getByRole("link", { name: /LinkedIn/i })).toBeVisible();

    const boxes = aim.locator('input[type=checkbox]');
    const n = await boxes.count();
    expect(n).toBeGreaterThanOrEqual(6);
    await boxes.nth(0).check();
    await boxes.nth(1).check();

    const answer = aim.locator(".answer-field input");
    await answer.fill("Data Scientist");
    await expect(answer).toHaveValue("Data Scientist");

    // Still only the two we checked (title text must not auto-add a third)
    await expect(aim.locator('input[type=checkbox]:checked')).toHaveCount(2);

    // Open brainstorm worksheet from banner
    const [popup] = await Promise.all([
      page.context().waitForEvent("page"),
      aim.getByRole("link", { name: /Next position brainstorm/i }).click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    await expect(popup.getByTestId("ws-inline-brainstorm")).toBeVisible({ timeout: 15000 });
    await popup.getByLabel(/Primary title/i).fill("Data Scientist");
    await popup.close();
  });

  test("Apply tools exist: Chart E, Skills fork, level picker, channels", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "2" }));
    await open_job_search(page);
    const apply = page.locator('[data-fold-id="stage_2"]');
    if (!(await apply.evaluate((el) => el.open))) {
      await apply.locator("summary").first().click({ force: true });
    }
    await expect(apply.getByRole("link", { name: /Chart E/i })).toBeVisible();
    await expect(apply.getByRole("link", { name: /Skills fork/i })).toBeVisible();
    const level = apply.locator("select");
    await expect(level).toBeVisible();
    await level.selectOption("mid");
    await expect(level).toHaveValue("mid");
    // Mid row checklist appears after level is chosen
    await expect(apply.getByText(/assumed/i).first()).toBeVisible({ timeout: 10000 });
    await expect(apply.getByText(/differentiator/i).first()).toBeVisible();
    await expect(apply.getByText(/referral/i).first()).toBeVisible();
    await expect(apply.getByText(/Easy Apply/i).first()).toBeVisible();
  });

  test("Interview + Offer worksheets linked", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "4" }));
    await open_job_search(page);

    const interview = page.locator('[data-fold-id="stage_3"]');
    if (!(await interview.evaluate((el) => el.open))) {
      await interview.locator("summary").first().click({ force: true });
    }
    await expect(interview.getByRole("link", { name: /Interview drills/i })).toBeVisible();
    await expect(interview.getByRole("link", { name: /Loop-ready/i })).toBeVisible();

    const offer = page.locator('[data-fold-id="stage_4"]');
    if (!(await offer.evaluate((el) => el.open))) {
      await offer.locator("summary").first().click({ force: true });
    }
    await expect(offer.getByRole("link", { name: /Comp planning/i })).toBeVisible();
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

  test("Overview This week + Chart E sections are mentee-readable", async ({ page }) => {
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
    expect(body.toLowerCase()).toMatch(/0 to 10|chart e|interest|core fit/);
  });

  test("Package stage is thin and focused (2 checks)", async ({ page }) => {
    await sign_in(page);
    await set_progress(page, mentorship_ready_progress({ highest_unlocked: "1" }));
    await open_job_search(page);
    const pkg = page.locator('[data-fold-id="stage_1"]');
    if (!(await pkg.evaluate((el) => el.open))) {
      await pkg.locator("summary").first().click({ force: true });
    }
    await expect(pkg.getByText(/0\/2|2\/2/)).toBeVisible();
    await expect(pkg.getByRole("link", { name: /Package match/i })).toBeVisible();
    const boxes = pkg.locator('input[type=checkbox]');
    // unlocked package: 2 core checks (not locked peek)
    expect(await boxes.count()).toBeGreaterThanOrEqual(2);
  });
});
