import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=role-fit]", { timeout: 20000 });
}

async function ensure_rolefit_open(page) {
  const role = page.getByTestId("role-fit");
  const open = await role.evaluate((el) => el.open);
  if (!open) await role.locator("summary").first().click();
}

test.describe("ui density", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("no duplicate Foundations unlock copy", async ({ page }) => {
    await sign_in(page);
    const body = await page.locator("body").innerText();
    const unlocks = (body.match(/unlocks after Foundations/gi) || []).length;
    expect(unlocks, "duplicate unlock hint").toBe(0);
    await expect(page.getByTestId("mode-gate")).toHaveCount(1);
  });

  test("RoleFit dropdown toggles; suggest stays nested", async ({ page }) => {
    await sign_in(page);
    await ensure_rolefit_open(page);
    const role = page.getByTestId("role-fit");

    await page.getByRole("button", { name: "Data Analyst", exact: true }).click();
    await page.getByRole("button", { name: "Search-ready", exact: true }).click();
    await expect(page.getByText("Suggest track from skills")).toBeVisible();

    await role.locator("summary").first().click();
    await expect(role).not.toHaveAttribute("open", "");
    await role.locator("summary").first().click();
    await expect(role).toHaveAttribute("open", "");
    await expect(page.getByRole("button", { name: "Build-proof", exact: true })).toBeVisible();
  });

  test("completed Module 0 is folded until expand", async ({ page }) => {
    await sign_in(page);
    let m0 = page.getByTestId("mod-m0");
    const needs_fill = !(await m0.evaluate((el) => {
      const btn = el.querySelector("button.primary");
      return el.open === false || (btn && el.open === false);
    }).catch(() => true));

    // If M0 incomplete (open by default with Open button visible when expanded)
    await ensure_rolefit_open(page);
    const open_btn = page.getByRole("button", { name: /Open Module 0/i });
    if ((await open_btn.count()) > 0 || !(await m0.getAttribute("open")) === null) {
      if (!(await m0.evaluate((el) => el.open))) await m0.locator("summary").click();
      if (await open_btn.count()) {
        await open_btn.first().click();
        await page.waitForSelector("text=Module 0 Exit");
        const boxes = page.locator(".ws-check input[type=checkbox]");
        const n = await boxes.count();
        for (let i = 0; i < n; i++) {
          const box = boxes.nth(i);
          if (!(await box.isChecked())) await box.check();
        }
        async function fill_if_empty(label, value) {
          const input = page.getByLabel(label);
          if ((await input.inputValue()) === "") await input.fill(value);
        }
        await fill_if_empty(/Hours\/week/, "20");
        await fill_if_empty(/Success looks like/, "DA offer in 12 weeks");
        await fill_if_empty(/Resume link/, "https://docs.google.com/document/d/resume");
        await fill_if_empty(/Cover letter link/, "https://docs.google.com/document/d/cover");
        await fill_if_empty(/Names of 2–3 people/, "Alex, Sam");
        const intro = page.getByLabel(/My intro/);
        if ((await intro.inputValue()) === "") await intro.fill("Hi I am Melissa.");
        await page.getByRole("button", { name: /Done — back to progress/ }).click();
        await page.waitForSelector("[data-testid=role-fit]");
        m0 = page.getByTestId("mod-m0");
      }
    }
    void needs_fill;

    // Force closed via UI then assert button hidden until expand
    if (await m0.evaluate((el) => el.open)) await m0.locator("summary").click();
    await expect(m0.getByRole("button", { name: /Open Module 0/i })).toHaveCount(0);
    await m0.locator("summary").click();
    await expect(m0.getByRole("button", { name: /Open Module 0/i })).toBeVisible();
  });

  test("first viewport stays dense when RoleFit collapsed", async ({ page }) => {
    await sign_in(page);
    await ensure_rolefit_open(page);
    await page.getByRole("button", { name: "Data Analyst", exact: true }).click();
    await page.getByRole("button", { name: "Search-ready", exact: true }).click();
    const role = page.getByTestId("role-fit");
    if (await role.evaluate((el) => el.open)) await role.locator("summary").first().click();

    const role_box = await role.boundingBox();
    expect(role_box).toBeTruthy();
    expect(role_box.height, "collapsed RoleFit should be short").toBeLessThan(90);

    await page.screenshot({ path: "test-results/ui-density.png", fullPage: false });
  });

  test("fold open/close survives reload (localStorage)", async ({ page }) => {
    await sign_in(page);
    const foundations = page.getByTestId("foundations-fold");
    await expect(foundations).toHaveCount(1);

    // Close Foundations
    if (await foundations.evaluate((el) => el.open)) {
      await foundations.locator("summary").first().click();
    }
    await expect(foundations).not.toHaveAttribute("open", "");

    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid=foundations-fold]");
    const after_close = page.getByTestId("foundations-fold");
    await expect(after_close).not.toHaveAttribute("open", "");

    // Open and reload
    await after_close.locator("summary").first().click();
    await expect(after_close).toHaveAttribute("open", "");
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("[data-testid=foundations-fold]");
    await expect(page.getByTestId("foundations-fold")).toHaveAttribute("open", "");
  });
});
