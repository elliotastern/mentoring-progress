import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=role-fit]", { timeout: 20000 });
}

async function clear_folds(page) {
  await page.evaluate(() => localStorage.removeItem("mentorship_fold_v2"));
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=role-fit]");
}

async function ensure_rolefit_open(page) {
  const role = page.getByTestId("role-fit");
  const open = await role.evaluate((el) => el.open);
  if (!open) await role.locator("summary").first().click();
}

test.describe("ui density", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("recommended next is clear on Progress (no cryptic legend)", async ({ page }) => {
    await sign_in(page);
    const body = await page.locator("body").innerText();
    const unlocks = (body.match(/unlocks after Foundations/gi) || []).length;
    expect(unlocks, "duplicate unlock hint").toBe(0);
    const hint = page.getByTestId("progress-next-hint");
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/Recommended next/i);
    await expect(hint).toContainText(/Foundations · Next:/i);
    await expect(hint).not.toContainText(/Precursor ·/);
  });

  test("RoleFit dropdown toggles; suggest stays nested", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);
    await ensure_rolefit_open(page);
    const role = page.getByTestId("role-fit");

    await page.getByRole("button", { name: "Data Analyst", exact: true }).click();
    await page.getByRole("button", { name: "Search-ready", exact: true }).click();
    await expect(role.locator(".role-fit-suggest-fold")).toBeVisible();
    await expect(role.getByText(/Suggest from your skills/i)).toBeVisible();

    await role.locator("summary").first().click();
    await expect(role).not.toHaveAttribute("open", "");
    await role.locator("summary").first().click();
    await expect(role).toHaveAttribute("open", "");
    await expect(page.getByRole("button", { name: "Build-proof", exact: true })).toBeVisible();
  });

  test("completed Module 0 is folded until expand", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);

    let m0 = page.getByTestId("mod-m0");
    await expect(m0).toBeVisible();
    if (!(await m0.evaluate((el) => el.open))) await m0.locator("summary").click();

    await expect(m0.getByTestId("ws-inline-module-exit-0")).toBeVisible();
    const boxes = m0.locator(".ws-check input[type=checkbox]");
    const n = await boxes.count();
    for (let i = 0; i < n; i++) {
      const box = boxes.nth(i);
      if (!(await box.isChecked())) await box.check();
    }
    async function fill_by_placeholder(placeholder, value, index = 0) {
      const input = m0.locator(`input[placeholder="${placeholder}"]`).nth(index);
      if ((await input.count()) && (await input.inputValue()) === "") {
        await input.fill(value);
      }
    }
    async function fill_near_text(text, value) {
      const field = m0.locator(".ws-field").filter({ hasText: text }).locator("input, textarea").first();
      if ((await field.count()) && (await field.inputValue()) === "") {
        await field.fill(value);
      }
    }
    await fill_near_text(/Hours\/week/, "20");
    await fill_near_text(/Success looks like/, "DA offer in 12 weeks");
    await fill_by_placeholder("https://docs.google.com/...", "https://docs.google.com/document/d/resume", 0);
    await fill_by_placeholder("https://docs.google.com/...", "https://docs.google.com/document/d/cover", 1);

    await expect(m0.getByTestId("ws-inline-module-exit-0").locator(".ws-section")).toHaveCount(4);
    await expect(m0.locator('input[placeholder="https://docs.google.com/..."]').nth(1)).toHaveValue(
      /cover/,
    );
  });

  test("first viewport stays dense when everything collapsed", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);

    await expect(page.getByTestId("role-fit")).not.toHaveAttribute("open", "");
    await expect(page.getByTestId("progress-report")).not.toHaveClass(/open/);
    await expect(page.getByTestId("mod-m0")).not.toHaveAttribute("open", "");

    const hero = page.getByTestId("perspective-hero");
    await expect(hero).toBeVisible();
    const hero_box = await hero.boundingBox();
    expect(hero_box.height, "comic should be readable").toBeGreaterThan(100);
    expect(hero_box.height, "comic should not dominate").toBeLessThanOrEqual(280);

    await page.screenshot({ path: "test-results/ui-density.png", fullPage: false });
  });

  test("first fold keeps comic right of Progress bar", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);
    await page.waitForSelector("[data-testid=perspective-hero]");

    const hero = page.getByTestId("perspective-hero");
    await expect(hero).toBeVisible();
    await expect(hero.locator("img")).toHaveAttribute("src", /perspective-comic\.png/);

    const metrics = await page.evaluate(() => {
      const hero_el = document.querySelector("[data-testid=perspective-hero]");
      const summary = document.querySelector(".progress-report-summary");
      const mods = document.querySelector("[data-testid=modules-list]");
      const vh = window.innerHeight;
      const hero_r = hero_el.getBoundingClientRect();
      const sum_r = summary.getBoundingClientRect();
      const mods_r = mods.getBoundingClientRect();
      return {
        hero_h: Math.round(hero_r.height),
        comic_right_of_progress: hero_r.left >= sum_r.right - 12,
        mods_in_fold: mods_r.top < vh - 24,
      };
    });
    expect(metrics.hero_h).toBeGreaterThan(100);
    expect(metrics.hero_h).toBeLessThanOrEqual(280);
    expect(metrics.comic_right_of_progress, "comic should sit right of Progress").toBe(true);
    expect(metrics.mods_in_fold).toBe(true);
    await page.screenshot({ path: "test-results/first-fold.png", fullPage: false });
  });

  test("comic hides when a module expands", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);
    await page.waitForSelector("[data-testid=perspective-hero]");

    const hero = page.getByTestId("perspective-hero");
    await expect(hero).toBeVisible();

    const m0 = page.getByTestId("mod-m0");
    await m0.locator("summary").first().click();
    await expect(hero).toBeHidden();

    await m0.locator("summary").first().click();
    await expect(hero).toBeVisible();
  });

  test("comic returns when Module 4 closes even if a nested stage stayed open", async ({
    page,
  }) => {
    await sign_in(page);
    await clear_folds(page);
    const hero = page.getByTestId("perspective-hero");
    await expect(hero).toBeVisible();

    const m4 = page.getByTestId("job-search-fold");
    await m4.locator("summary").first().click();
    await expect(hero).toBeHidden();

    const stage0 = page.locator('[data-fold-id="stage_0"]');
    await expect(stage0).toBeVisible();
    if (!(await stage0.evaluate((el) => el.open))) {
      await stage0.locator("summary").first().click();
    }
    await expect(stage0).toHaveAttribute("open", "");
    await expect(hero).toBeHidden();

    await m4.locator("summary").first().click();
    await expect(m4).not.toHaveAttribute("open", "");
    await expect(hero).toBeVisible();
  });

  test("fold open/close survives reload (localStorage)", async ({ page }) => {
    await sign_in(page);
    await clear_folds(page);
    const role = page.getByTestId("role-fit");
    await expect(role).toHaveCount(1);

    await role.locator("summary").first().click();
    await expect(role).toHaveAttribute("open", "");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          try {
            return JSON.parse(localStorage.getItem("mentorship_fold_v2") || "{}").rolefit;
          } catch {
            return null;
          }
        }),
      )
      .toBe(true);

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid=role-fit]");
    const after_open = page.getByTestId("role-fit");
    await expect(after_open).toHaveAttribute("open", "");

    await after_open.locator("summary").first().click();
    await expect(after_open).not.toHaveAttribute("open", "");
    await expect
      .poll(async () =>
        page.evaluate(() => {
          try {
            return JSON.parse(localStorage.getItem("mentorship_fold_v2") || "{}").rolefit;
          } catch {
            return null;
          }
        }),
      )
      .toBe(false);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid=role-fit]");
    await expect(page.getByTestId("role-fit")).not.toHaveAttribute("open", "");
  });
});
