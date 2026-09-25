import { test, expect } from "@playwright/test";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function open_ws(page, sheet_id) {
  await page.goto(`${BASE}/?ws=${encodeURIComponent(sheet_id)}`, {
    waitUntil: "networkidle",
  });
  await expect(page.getByTestId(`ws-inline-${sheet_id}`)).toBeVisible({
    timeout: 15000,
  });
}

async function check_all_boxes(root) {
  const boxes = root.locator(".ws-check input[type=checkbox]");
  const n = await boxes.count();
  for (let i = 0; i < n; i++) {
    const box = boxes.nth(i);
    if (!(await box.isChecked())) await box.check();
  }
  return n;
}

async function fill_near_label(root, label_re, value) {
  const field = root
    .locator(".ws-field")
    .filter({ hasText: label_re })
    .locator("input, textarea")
    .first();
  await expect(field).toBeVisible();
  await field.fill(value);
}

async function read_progress(page) {
  return page.evaluate(() => {
    const session = JSON.parse(localStorage.getItem("mentorship_session_v2") || "null");
    const key = (navigator.webdriver ? "mentorship_progress_test_v2_" : "mentorship_progress_v2_") + session.uid;
    return JSON.parse(localStorage.getItem(key) || "{}");
  });
}

async function close_sheet(page) {
  await page.getByRole("button", { name: /Done — back to progress/i }).click();
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 15000 });
}

test.describe("Stage 5–7 remade worksheets", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.__MENTORSHIP_TEST_ISOLATE__ = true;
    });
  });

  test("interview-drills fills and syncs sql date", async ({ page }) => {
    await sign_in(page);
    await open_ws(page, "interview-drills");
    await expect(page.locator(".worksheet-panel h2")).toContainText(/Interview.*Drills/i);
    const sheet = page.getByTestId("ws-inline-interview-drills");
    await expect(sheet.locator(".ws-section")).toHaveCount(4);
    const n = await check_all_boxes(sheet);
    expect(n).toBeGreaterThanOrEqual(4);
    await fill_near_label(sheet, /Date of last timed SQL/i, "2026-09-20");
    await close_sheet(page);
    const stored = await read_progress(page);
    expect(stored.checks?.sql).toBe(true);
    expect(stored.checks?.case).toBe(true);
    expect(stored.checks?.loop_named).toBe(true);
    expect(stored.checks?.drills_habit).toBe(true);
    expect(stored.answers?.sql_date).toMatch(/2026-09-20/);
  });

  test("loop-ready fills and syncs companies", async ({ page }) => {
    await sign_in(page);
    await open_ws(page, "loop-ready");
    await expect(page.locator(".worksheet-panel h2")).toContainText(/Loop-Ready/i);
    const sheet = page.getByTestId("ws-inline-loop-ready");
    await expect(sheet.locator(".ws-section")).toHaveCount(7);
    await check_all_boxes(sheet);
    await fill_near_label(sheet, /Company 1/i, "Stripe");
    await fill_near_label(sheet, /Company 2/i, "Notion");
    await close_sheet(page);
    const stored = await read_progress(page);
    expect(stored.checks?.recruiter_story).toBe(true);
    expect(stored.checks?.tech_ready).toBe(true);
    expect(stored.checks?.case_ready).toBe(true);
    expect(stored.checks?.behavioral_ready).toBe(true);
    expect(stored.checks?.scripts_ready).toBe(true);
    expect(stored.checks?.dayof_ready).toBe(true);
    expect(stored.checks?.notes_fields).toBe(true);
    expect(stored.checks?.after_screen).toBe(true);
    expect(stored.answers?.next_interview).toMatch(/Stripe/);
    expect(stored.answers?.next_interview).toMatch(/Notion/);
  });

  test("comp-planning fills and syncs walkaway", async ({ page }) => {
    await sign_in(page);
    await open_ws(page, "comp-planning");
    await expect(page.locator(".worksheet-panel h2")).toContainText(/Compensation/i);
    const sheet = page.getByTestId("ws-inline-comp-planning");
    await expect(sheet.locator(".ws-section")).toHaveCount(4);
    await check_all_boxes(sheet);
    await fill_near_label(sheet, /Walk-away/i, "Base ≥ $140k + remote");
    await close_sheet(page);
    const stored = await read_progress(page);
    expect(stored.checks?.comp).toBe(true);
    expect(stored.checks?.criteria).toBe(true);
    expect(stored.checks?.salary_ready).toBe(true);
    expect(stored.checks?.salary_practiced).toBe(true);
    expect(stored.checks?.negotiate_ready).toBe(true);
    expect(stored.checks?.levers_ready).toBe(true);
    expect(stored.answers?.walkaway).toMatch(/140k/);
  });
});
