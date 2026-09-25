import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";
const OUT = path.resolve("test-results");

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function open_progress(page) {
  const report = page.getByTestId("progress-report");
  const expanded = await report.evaluate((el) => el.classList.contains("open"));
  if (!expanded) {
    await report.locator("button.progress-report-summary").click();
  }
  await expect(report).toHaveClass(/open/);
  return report;
}

async function open_job_search_module(page) {
  const m4 = page.getByTestId("job-search-fold");
  await expect(m4).toBeVisible({ timeout: 10000 });
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
  await expect(m4).toHaveAttribute("open", "");
}

async function unlock_for_links(page) {
  await page.addInitScript(() => {
    const SESSION_KEY = "mentorship_session_v2";
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    const PREFIX = "mentorship_progress_test_v2_";
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.uid) return;
      const key = PREFIX + session.uid;
      const raw = localStorage.getItem(key);
      const p = raw ? JSON.parse(raw) : {};
      p.highest_unlocked = "4";
      p.foundations_complete = true;
      p.answers = {
        ...(p.answers || {}),
        role_track: "ds",
        role_tracks: ["ds"],
        search_path: "search_ready",
      };
      localStorage.setItem(key, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]");
  await open_job_search_module(page);
  await expect(page.getByTestId("weekly-fold")).toHaveCount(1);
  const stage1 = page.locator('[data-fold-id="stage_1"]');
  if (!(await stage1.evaluate((el) => el.open))) {
    await stage1.locator("summary").first().click({ force: true });
  }
  await expect(page.locator('[data-check-id="projects"]')).toBeVisible();
}

function overflow_metrics() {
  return (() => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const page = document.querySelector(".pr-page");
    const report = document.querySelector("[data-testid=progress-report]");
    const root = page || report;
    if (!root) return { overflowCount: 0, fonts: [] };

    function is_tip_bubble(node) {
      return Boolean(node.closest?.(".tip-bubble"));
    }

    let overflowCount = 0;
    const offenders = [];
    root.querySelectorAll("button, li, h2, h3, .pr-pillar, .pr-line-link").forEach((node) => {
      if (is_tip_bubble(node)) return;
      const b = node.getBoundingClientRect();
      if (b.width < 1 || b.height < 1) return;
      if (b.right > vw + 2 || b.left < -2) {
        overflowCount += 1;
        offenders.push({
          text: (node.textContent || "").trim().slice(0, 40),
          right: Math.round(b.right),
          left: Math.round(b.left),
        });
      }
    });

    const links = [...root.querySelectorAll(".pr-line-link")].slice(0, 8).map((btn) => {
      const s = getComputedStyle(btn);
      return {
        fontPx: parseFloat(s.fontSize) || 0,
        fits: btn.scrollWidth <= btn.clientWidth + 2,
      };
    });

    return { overflowCount, offenders: offenders.slice(0, 5), fonts: links, vw, vh };
  })();
}

async function in_viewport(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
  }, selector);
}

test.describe("progress links matrix", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("worksheet, check, weekly, doc + expand fit", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await sign_in(page);
    await unlock_for_links(page);
    const report = await open_progress(page);

    // Preview readability
    const preview = await page.evaluate(overflow_metrics);
    fs.writeFileSync(
      path.join(OUT, "progress-links-preview.json"),
      JSON.stringify(preview, null, 2),
    );
    expect(preview.overflowCount, "preview horizontal overflow").toBe(0);
    expect(preview.fonts.every((f) => f.fontPx >= 12)).toBe(true);

    // Expand Docs — full list fit
    await report.getByTestId("pr-pillar-docs").getByRole("button", { name: "Expand" }).click();
    const docs_page = page.locator(".pr-page");
    await expect(docs_page).toBeVisible();
    const expand_fit = await page.evaluate(overflow_metrics);
    fs.writeFileSync(
      path.join(OUT, "progress-links-expand.json"),
      JSON.stringify(expand_fit, null, 2),
    );
    await page.screenshot({ path: path.join(OUT, "progress-links-expand.png") });
    expect(expand_fit.overflowCount, "expand horizontal overflow").toBe(0);
    expect(expand_fit.fonts.every((f) => f.fontPx >= 14)).toBe(true);

    // worksheet link
    const ws = docs_page.locator('[data-line-id^="ws_"]').first();
    await ws.getByRole("button").click();
    await expect(page.locator(".worksheet-panel")).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/[?&]ws=/);
    await page.getByRole("button", { name: "Done — back to progress" }).click();
    await page.waitForSelector("[data-testid=progress-report]");

    // check link via Portfolio Expand
    await open_progress(page);
    await report.getByTestId("pr-pillar-proof").getByRole("button", { name: "Expand" }).click();
    await page.locator(".pr-page").locator('[data-line-id="m3_linkedin"] button').click();
    await expect(page.locator(".pr-page")).toHaveCount(0);
    await expect(page.getByTestId("progress-report")).not.toHaveClass(/open/);
    await expect
      .poll(async () => in_viewport(page, '[data-check-id="m3_linkedin"]'))
      .toBe(true);

    // weekly link
    await open_progress(page);
    await report.getByTestId("pr-pillar-weekly").getByRole("button", { name: "Expand" }).click();
    await page.locator(".pr-page").locator('[data-line-id="t_apps"] button').click();
    await expect(page.locator(".pr-page")).toHaveCount(0);
    await expect
      .poll(async () =>
        (await in_viewport(page, '[data-tally-id="t_apps"]')) ||
        (await in_viewport(page, "[data-testid=weekly-fold]")),
      )
      .toBe(true);

    // doc link must open the guide article (synchronously — not via setTimeout)
    await open_progress(page);
    await page.evaluate(() => {
      if (window.__open_gesture_spy) return;
      window.__open_gesture_spy = true;
      window.__last_open = null;
      let timeout_depth = 0;
      const orig_timeout = window.setTimeout.bind(window);
      window.setTimeout = (fn, delay, ...args) =>
        orig_timeout(
          (...a) => {
            timeout_depth += 1;
            try {
              return typeof fn === "function" ? fn(...a) : fn;
            } finally {
              timeout_depth -= 1;
            }
          },
          delay,
          ...args,
        );
      const orig_open = window.open.bind(window);
      window.open = (...a) => {
        window.__last_open = {
          deferred: timeout_depth > 0,
          href: String(a[0] || ""),
        };
        return orig_open(...a);
      };
    });
    await report.getByTestId("pr-pillar-docs").getByRole("button", { name: "Expand" }).click();
    const doc_line = page.locator(".pr-page").locator('[data-line-id="doc_projects"]');
    await expect(doc_line).toBeVisible();
    await page.evaluate(() => {
      window.__last_open = null;
    });
    const popup_promise = page.waitForEvent("popup", { timeout: 10000 });
    await doc_line.getByRole("button").click();
    const popup = await popup_promise;
    const open_meta = await page.evaluate(() => window.__last_open);
    expect(open_meta, "window.open was called").toBeTruthy();
    expect(open_meta.deferred, "doc open must not be deferred via setTimeout").toBe(false);
    expect(open_meta.href).toMatch(/view\.html/);
    await popup.waitForLoadState("domcontentloaded");
    expect(popup.url()).toMatch(/view\.html/);
    expect(popup.url()).toMatch(/doc=/);
    await popup.waitForFunction(() => {
      const art = document.querySelector("#content, article");
      const text = (art?.innerText || "").trim();
      return text.length > 40 && !/^Loading/i.test(text);
    });
    await expect(popup.locator(".err")).toHaveCount(0);
    await popup.close();
    await expect(page.locator(".pr-page")).toHaveCount(0);

    await page.screenshot({
      path: path.join(OUT, "progress-links-after-doc.png"),
      fullPage: false,
    });
  });
});

test.describe("progress links narrow", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("expand has no horizontal overflow on mobile", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await sign_in(page);
    await unlock_for_links(page);
    const report = await open_progress(page);
    await report.getByTestId("pr-pillar-docs").getByRole("button", { name: "Expand" }).click();
    await expect(page.locator(".pr-page")).toBeVisible();
    const fit = await page.evaluate(overflow_metrics);
    fs.writeFileSync(
      path.join(OUT, "progress-links-narrow.json"),
      JSON.stringify(fit, null, 2),
    );
    await page.screenshot({ path: path.join(OUT, "progress-links-narrow.png") });
    expect(fit.overflowCount).toBe(0);
    expect(fit.fonts.every((f) => f.fontPx >= 14)).toBe(true);
  });
});
