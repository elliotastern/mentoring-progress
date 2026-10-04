import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function read_progress(page) {
  return page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
    const key =
      (navigator.webdriver ? "mentorship_progress_test_v2_" : "mentorship_progress_v2_") +
      session.uid;
    return JSON.parse(localStorage.getItem(key) || "{}");
  });
}

test.describe("Target Companies guide write-ins", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__MENTORSHIP_TEST_ISOLATE__ = true;
    });
  });

  test("guide has no Stretch/Stepping/Sandbox boxes; Fit syncs to Module 4", async ({
    page,
  }) => {
    await sign_in(page);
    await page.goto(`${BASE}/docs/view.html?doc=target-companies.md`, {
      waitUntil: "networkidle",
    });
    await expect(page.getByTestId("guide-company-list")).toHaveCount(0);
    await expect(page.getByTestId("guide-company-tier-stretch")).toHaveCount(0);

    const fit = page.getByTestId("guide-company-fit");
    await expect(fit).toBeVisible({ timeout: 15000 });
    await fit.getByTestId("guide-company-fit-add-row").click();
    const row_id = await fit.evaluate((root) => {
      const tr = root.querySelector('tr[data-testid^="guide-company-fit-row-"]');
      return tr?.getAttribute("data-testid")?.replace("guide-company-fit-row-", "") || "";
    });
    expect(row_id).toBeTruthy();
    await fit.getByTestId(`guide-company-fit-company-${row_id}`).fill("Fit Sync Co");
    await fit
      .getByTestId(`guide-company-fit-company-${row_id}`)
      .dispatchEvent("change");
    await fit.getByTestId(`guide-company-fit-score-${row_id}-wlb`).fill("5");
    await fit
      .getByTestId(`guide-company-fit-score-${row_id}-wlb`)
      .dispatchEvent("change");

    const stored = await read_progress(page);
    expect(stored.worksheets?.brainstorm?.stretch || "").toMatch(/Fit Sync Co/);

    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
    const job_fold = page.getByTestId("job-search-fold");
    if (!(await job_fold.evaluate((el) => el.open))) {
      await job_fold.locator("summary").first().click({ force: true });
    }
    const company_list = job_fold.getByTestId("m4-company-list");
    if (!(await company_list.evaluate((el) => el.open))) {
      await company_list.locator("summary").first().click({ force: true });
    }
    await expect(job_fold.getByTestId("company-tier-stretch")).toHaveValue(/Fit Sync Co/);
    await expect(job_fold.getByTestId("company-tier-stretch")).toHaveAttribute("readonly", "");
    await expect(job_fold.getByTestId("company-list-open-fit")).toBeVisible();
  });

  test("guide Job Target calculator saves to Progress answers", async ({ page }) => {
    await sign_in(page);
    await page.goto(`${BASE}/docs/view.html?doc=target-companies.md`, {
      waitUntil: "networkidle",
    });
    const home = page.getByTestId("doc-return-home");
    await expect(home).toBeVisible();
    await expect(home).toHaveText("Return to Home Page");
    await expect(home).toHaveAttribute("href", /\/mentoring-progress\/?$/);
    const jt = page.getByTestId("guide-job-target");
    await expect(jt).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Fill Stretch/)).toHaveCount(0);
    await jt.getByTestId("guide-role-track-ds").click();
    await jt.getByTestId("guide-role-path-search_ready").click();
    await jt.getByTestId("guide-job-level-mid").click();
    await jt.getByTestId("guide-job-industry").fill("Climate");
    await jt.getByTestId("guide-comp-floor").fill("140k");
    await expect(jt.getByTestId("guide-job-target-status")).toContainText(/Saved to Progress/i);

    const stored = await read_progress(page);
    expect(stored.answers?.role_tracks || []).toContain("ds");
    expect(stored.answers?.search_path).toBe("search_ready");
    expect(stored.skill_level).toBe("mid");
    expect(stored.answers?.job_industry).toMatch(/Climate/);
    expect(stored.answers?.comp_floor).toMatch(/140k/);
  });
});
