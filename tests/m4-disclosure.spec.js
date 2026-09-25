import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function open_job_search(page) {
  const m4 = page.getByTestId("job-search-fold");
  await expect(m4).toBeVisible({ timeout: 10000 });
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
}

/** Force unlock via init script on the isolated test progress key. */
async function set_unlock(page, highest) {
  await page.addInitScript((h) => {
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    const SESSION_KEY = "mentorship_session_v2";
    const PREFIX = "mentorship_progress_test_v2_";
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.uid) return;
      const key = PREFIX + session.uid;
      const p = {
        checks: { _test_anchor: true },
        highest_unlocked: h,
        stage_schema: 2,
        foundations_complete: true,
        answers: {
          role_track: "ds",
          role_tracks: ["ds"],
          search_path: "search_ready",
        },
        worksheets: {},
      };
      localStorage.setItem(key, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, highest);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]");
}

test.describe("Module 4 stage visibility", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("Aim shows all five stages + locked Weekly", async ({ page }) => {
    await sign_in(page);
    await set_unlock(page, "0");
    await open_job_search(page);
    await expect(page.getByTestId("job-search-path")).toContainText(/Aim/);
    await expect(page.locator('[data-fold-id="stage_0"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_1"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_2"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_3"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_4"]')).toHaveCount(1);
    const weekly = page.getByTestId("weekly-fold");
    await expect(weekly).toHaveCount(1);
    if (!(await weekly.evaluate((el) => el.open))) {
      await weekly.locator("summary").first().click({ force: true });
    }
    await expect(page.getByTestId("weekly-locked-hint")).toBeVisible();
  });

  test("Apply unlock enables Weekly; all stages still visible", async ({ page }) => {
    await sign_in(page);
    await set_unlock(page, "2");
    await open_job_search(page);
    await expect(page.getByTestId("job-search-path")).toContainText(/Apply/);
    await expect(page.locator('[data-fold-id="stage_0"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_1"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_2"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_3"]')).toHaveCount(1);
    await expect(page.locator('[data-fold-id="stage_4"]')).toHaveCount(1);
    await expect(page.getByTestId("weekly-fold")).toHaveCount(1);
    await expect(page.getByTestId("weekly-locked-hint")).toHaveCount(0);
  });
});
