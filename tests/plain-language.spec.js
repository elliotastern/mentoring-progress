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
    await expect(inline.getByText(/Why this matters/)).toBeVisible();
    await expect(inline.getByText(/BONUS - Habit/)).toBeVisible();
  });

  test("Module 4 Job Search Setup steps + Apply loop", async ({ page }) => {
    await sign_in(page);
    const job_fold = page.getByTestId("job-search-fold");
    await expect(job_fold).toBeVisible();
    if (!(await job_fold.evaluate((el) => el.open))) {
      await job_fold.locator("summary").first().click({ force: true });
    }

    async function open_step(test_id) {
      const step = job_fold.getByTestId(test_id);
      await expect(step).toBeVisible();
      if (!(await step.evaluate((el) => el.open))) {
        await step.locator("summary").first().click({ force: true });
      }
      return step;
    }

    const step1 = await open_step("m4-step-prereq");
    await expect(step1).toHaveAttribute("data-fold-id", "m4_step_prereq");
    await expect(step1.locator("summary").first()).toContainText(/Setup/);
    await expect(step1.locator("summary").first()).toContainText(/Pre Requirements/);
    const reqs = step1.getByTestId("module-reqs");
    await expect(reqs).toBeVisible();
    await expect(reqs).toContainText("Know your job target");
    await expect(reqs).toContainText("Know what companies are your target");
    await expect(reqs).toContainText("Portfolio final submitted");
    await expect(step1.getByTestId("m4-req-warn")).toBeVisible();
    await expect(step1.getByTestId("m4-role-fit")).toBeVisible();
    await expect(step1.getByTestId("m4-company-list")).toBeVisible();
    await expect(step1.locator(".worksheet-banner").first()).toBeVisible();
    const company_list = step1.getByTestId("m4-company-list");
    if (!(await company_list.evaluate((el) => el.open))) {
      await company_list.locator("summary").first().click({ force: true });
    }
    await expect(step1.getByTestId("company-list-open-fit")).toBeVisible();
    await expect(step1.locator(".gate").first()).toBeVisible();

    const step2 = await open_step("m4-step-overview");
    await expect(step2).toHaveAttribute("data-fold-id", "m4_step_overview");
    await expect(step2).toContainText(/Setup 2: Read the Overview/);
    const overview = step2.locator('[data-check-id="m4_overview"]');
    await expect(overview).toBeVisible();
    await expect(overview.getByRole("link", { name: /Read Guide/i })).toHaveAttribute(
      "href",
      /overview-v8\.md/,
    );
    await expect(overview).not.toContainText("Weekly Application Dashboard");
    await expect(step2.locator(".gate").first()).toContainText("0/1");

    const step3 = await open_step("m4-step-tracker");
    await expect(step3).toHaveAttribute("data-fold-id", "m4_step_tracker");
    await expect(step3.locator("summary").first()).toContainText(/Setup 3:/);
    await expect(step3.locator("summary").first()).toContainText(/job tracker/i);
    const tracker = step3.locator('[data-check-id="m4_tracker"]');
    await expect(tracker).toBeVisible();
    await expect(tracker).toContainText(/columns \+ practice row/);
    await expect(tracker.getByRole("link", { name: /Guide/i })).toHaveAttribute(
      "href",
      /ws-tracker-setup\.md/,
    );
    await expect(tracker.getByRole("link", { name: /Tracker setup/i })).toBeVisible();
    await expect(step3.locator('[data-check-id="tracker"]')).toHaveCount(0);
    await expect(step3.locator(".worksheet-banner")).toBeVisible();
    await expect(step3.locator(".gate").first()).toContainText("0/1");

    const applying = await open_step("m4-step-applying");
    await expect(applying).toHaveAttribute("data-fold-id", "m4_step_applying");
    await expect(applying.locator("summary").first()).toContainText(/Apply loop/);
    await expect(job_fold.getByTestId("job-search-path")).toBeVisible();
    await expect(job_fold.getByTestId("job-search-path")).toContainText(/Setup/);
    await expect(applying.getByTestId("m4-applying-flat")).toBeVisible();
    await expect(applying.getByRole("link", { name: /Next position brainstorm/i })).toHaveCount(0);
    await expect(applying.getByRole("link", { name: /Weekly Application Dashboard/i })).toBeVisible();
    await expect(applying.locator(".worksheet-banner")).toBeVisible();
    await expect(applying.getByTestId("m4-applying-flat")).toContainText(/Open Weekly Application Dashboard/);
    await expect(applying.getByTestId("m4-applying-flat")).toContainText(/Verify posting on the employer careers page/);
    await expect(applying.getByTestId("m4-applying-flat")).toContainText(/Find a posting/);
    await expect(applying.getByTestId("m4-applying-flat")).toContainText(/Score Job effort/);
    await expect(step1.getByRole("link", { name: /Next position brainstorm/i })).toBeVisible();
    await expect(page.locator('[data-fold-id="stage_0"]')).toHaveCount(0);
    await expect(page.locator('[data-fold-id="stage_1"]')).toHaveCount(0);
  });

  test("Worksheet view: LinkedIn + resume tips on open sheet", async ({ page }) => {
    await sign_in(page);
    await page.goto(`${BASE}/?ws=package-match`, { waitUntil: "networkidle" });
    await page.waitForSelector(".worksheet-panel", { timeout: 20000 });
    await expect_tip(page, "LinkedIn", "work profiles");
    await expect_tip(page, "resume", "summary of your skills");
    await expect_tip(page, "Package", "resume, LinkedIn, and project");
  });

  test("Job tracker tip under Step 3 when Job Search open", async ({ page }) => {
    await sign_in(page);
    const job_fold = page.getByTestId("job-search-fold");
    if (!(await job_fold.evaluate((el) => el.open))) {
      await job_fold.locator("summary").first().click({ force: true });
    }
    const step3 = job_fold.getByTestId("m4-step-tracker");
    if (!(await step3.evaluate((el) => el.open))) {
      await step3.locator("summary").first().click({ force: true });
    }
    const tip = step3.locator('.tip[data-tip="Tracker"]').first();
    await expect(tip).toBeVisible();
    await tip.scrollIntoViewIfNeeded();
    await tip.hover({ force: true });
    await expect(tip.locator(".tip-bubble")).toContainText("spreadsheet");
    const m3 = page.locator('[data-fold-id="mod_m3"]');
    await expect(m3).toHaveCount(1);
    if (!(await m3.evaluate((el) => el.open))) {
      await m3.locator("summary").first().click({ force: true });
    }
    const artifact = m3.locator('.tip[data-tip="artifact"]').first();
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
