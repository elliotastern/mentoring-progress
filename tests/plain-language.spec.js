import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=role-fit]", { timeout: 20000 });
}

async function open_details(page, test_id) {
  const el = page.getByTestId(test_id);
  if (!(await el.evaluate((node) => node.open))) {
    await el.locator("summary").first().click();
  }
  await expect(el).toHaveAttribute("open", "");
}

async function expect_tip(page, term, must_include) {
  const tip = page.locator(`.tip[data-tip="${term}"]`).first();
  await expect(tip).toBeVisible();
  await tip.scrollIntoViewIfNeeded();
  // Sticky Progress header can intercept hover; focus-within also opens the bubble
  await tip.focus();
  const bubble = tip.locator(".tip-bubble");
  await expect(bubble).toBeVisible();
  if (must_include) {
    await expect(bubble).toContainText(must_include);
  }
}

test.describe("plain language tips — section loop", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("RoleFit: Track / Path / Search-ready / Build-proof tips", async ({ page }) => {
    await sign_in(page);
    await open_details(page, "role-fit");
    await expect_tip(page, "Track", "kind of data job");
    await expect_tip(page, "Path", "Your plan");
    await expect_tip(page, "Search-ready", "ready to apply");
    await expect_tip(page, "Build-proof", "project that shows");
    await expect_tip(page, "Data Analyst", "charts and answers");
  });

  test("Modules: Module tip + full Module 0 checklist inline", async ({ page }) => {
    await sign_in(page);
    await expect_tip(page, "Modules", "chapters of the program");
    await open_details(page, "mod-m0");
    const mod = page.getByTestId("mod-m0").locator('.tip[data-tip="Module"]').first();
    await expect(mod).toBeVisible();
    await mod.hover({ force: true });
    await expect(mod.locator(".tip-bubble")).toContainText("chapter of the program");
    const inline = page.getByTestId("ws-inline-module-exit-0");
    await expect(inline).toBeVisible();
    // TipText wraps glossary words, so use accessible name (aria-hidden bubbles excluded)
    await expect(inline.getByRole("link", { name: /Module.*Mentorship Overview/ })).toBeVisible();
    await expect(inline.getByRole("link", { name: /What Is Provided/ })).toBeVisible();
    await expect(inline.getByRole("link", { name: /How To Communicate/ })).toBeVisible();
    await expect(inline.getByPlaceholder(/e\.g\. 20/)).toBeVisible();
    await expect(inline.getByPlaceholder(/docs\.google/)).toHaveCount(2);
    await expect(inline.getByText(/BONUS - Habit/)).toBeVisible();
  });

  test("Module 4 Job Search readiness rows + warning", async ({ page }) => {
    await sign_in(page);
    const job_fold = page.getByTestId("job-search-fold");
    await expect(job_fold).toBeVisible();
    if (!(await job_fold.evaluate((el) => el.open))) {
      await job_fold.locator("summary").first().click({ force: true });
    }
    const reqs = job_fold.getByTestId("module-reqs");
    await expect(reqs).toBeVisible();
    await expect(reqs).toContainText("Target job picked");
    await expect(reqs).toContainText("Targeted Resume");
    await expect(reqs).toContainText("Targeted Portfolio");
    await expect(job_fold.getByTestId("m4-req-warn")).toBeVisible();
    const job = job_fold.locator('.tip[data-tip="Job Search"]').first();
    await expect(job).toBeVisible();
    await job.hover({ force: true });
    await expect(job.locator(".tip-bubble")).toContainText("Module 4");
    await expect(job_fold.locator('[data-check-id="m4_overview"] .tip-word').filter({ hasText: "Job Search" })).toHaveCount(1);
    await expect(job_fold.locator('[data-check-id="m4_overview"]')).toContainText("Overview");
    await expect(job_fold.locator('[data-check-id="m4_overview"]')).not.toContainText("v8");
    await expect(
      job_fold.locator('[data-check-id="m4_overview"] a.doc-link[href*="overview-v8.md"]'),
    ).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_0"]')).toHaveCount(1);
  });

  test("Worksheet view: LinkedIn + resume tips on open sheet", async ({ page }) => {
    await sign_in(page);
    await page.goto(`${BASE}/?ws=package-match`, { waitUntil: "networkidle" });
    await page.waitForSelector(".worksheet-panel", { timeout: 20000 });
    await expect_tip(page, "LinkedIn", "work profiles");
    await expect_tip(page, "resume", "summary of your skills");
    await expect_tip(page, "Package", "resume, LinkedIn, and project");
  });

  test("Stage 0 checklist tips when Job Search unlocked", async ({ page }) => {
    await sign_in(page);
    const job_fold = page.getByTestId("job-search-fold");
    if (!(await job_fold.evaluate((el) => el.open))) {
      await job_fold.locator("summary").first().click({ force: true });
    }
    const stage0 = page.locator('[data-fold-id="stage_0"]');
    await expect(stage0).toHaveCount(1);
    if (!(await stage0.evaluate((el) => el.open))) {
      await stage0.locator("summary").first().click({ force: true });
    }
    const tracker = stage0.locator('.tip[data-tip="Tracker"]').first();
    await expect(tracker).toBeVisible();
    await tracker.scrollIntoViewIfNeeded();
    await tracker.hover({ force: true });
    await expect(tracker.locator(".tip-bubble")).toContainText("spreadsheet");
    const primary = stage0.locator('.tip[data-tip="primary title"]').first();
    await expect(primary).toBeVisible();
    await primary.hover({ force: true });
    await expect(primary.locator(".tip-bubble")).toContainText("exact job name");
    const stage1 = page.locator('[data-fold-id="stage_1"]');
    await expect(stage1).toHaveCount(1);
    if (!(await stage1.evaluate((el) => el.open))) {
      await stage1.locator("summary").first().click({ force: true });
    }
    const artifact = stage1.locator('.tip[data-tip="artifact"]').first();
    await expect(artifact).toBeVisible();
    await artifact.hover({ force: true });
    await expect(artifact.locator(".tip-bubble")).toContainText("open fast");
  });

  test("page has many hover tips (density floor)", async ({ page }) => {
    await sign_in(page);
    const tips = page.locator(".tip");
    expect(await tips.count()).toBeGreaterThan(8);
  });
});
