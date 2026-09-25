import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function set_progress(page, progress) {
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
  await page.waitForSelector("[data-testid=progress-report]");
}

test.describe("Module 4 check auto-tick", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("answers.title does not auto-check primary_title", async ({ page }) => {
    await page.addInitScript(() => {
      window.__MENTORSHIP_TEST_ISOLATE__ = true;
    });
    await sign_in(page);
    await set_progress(page, {
      checks: { _pad: true },
      highest_unlocked: "0",
      stage_schema: 2,
      foundations_complete: true,
      answers: {
        role_track: "ds",
        role_tracks: ["ds"],
        search_path: "search_ready",
        title: "Data Analyst",
      },
      worksheets: {
        brainstorm: { primary_title: "Data Analyst" },
      },
    });

    const stored = await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
      const key = "mentorship_progress_test_v2_" + session.uid;
      const p = JSON.parse(localStorage.getItem(key) || "{}");
      return {
        primary_title: Boolean(p.checks?.primary_title),
        title: p.answers?.title || "",
      };
    });
    expect(stored.title).toBe("Data Analyst");
    expect(stored.primary_title).toBe(false);

    const m4 = page.getByTestId("job-search-fold");
    if (!(await m4.evaluate((el) => el.open))) {
      await m4.locator("summary").first().click({ force: true });
    }
    const aim = page.locator('[data-fold-id="stage_0"]');
    if (!(await aim.evaluate((el) => el.open))) {
      await aim.locator("summary").first().click({ force: true });
    }
    await expect(aim.locator('input[type=checkbox]:checked')).toHaveCount(0);
  });
});
