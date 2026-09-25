import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

test.use({ viewport: { width: 1280, height: 800 } });

test("module rows show percent bar on the right, same row as title", async ({ page }) => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=mod-m0]", { timeout: 20000 });
  const pr = page.getByTestId("progress-report");
  if (await pr.evaluate((el) => el.classList.contains("open"))) {
    await page.locator(".progress-report-summary").click();
  }
  for (const id of ["m0", "m1", "m2", "m3", "m4"]) {
    const score = page.getByTestId(`mod-score-${id}`);
    await expect(score).toBeVisible();
    await expect(score).toHaveText(/\d+%/);
    await expect(score.locator(".fold-score-track")).toBeVisible();
  }
  const dims = await page.getByTestId("mod-m0").evaluate((el) => {
    const title = el.querySelector(".fold-title");
    const score = el.querySelector(".fold-score");
    const tr = title.getBoundingClientRect();
    const sr = score.getBoundingClientRect();
    return {
      titleW: tr.width,
      titleH: tr.height,
      scoreLeft: sr.left,
      titleRight: tr.right,
      sameRow: Math.abs(tr.top - sr.top) < 24,
      text: title.innerText.replace(/\s+/g, " "),
    };
  });
  expect(dims.titleW, "title should have horizontal space").toBeGreaterThan(120);
  expect(dims.titleH, "title should not stack characters").toBeLessThan(60);
  expect(dims.sameRow).toBe(true);
  expect(dims.scoreLeft).toBeGreaterThan(dims.titleRight - 5);
});
