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

async function unlock_stages(page) {
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
      p.highest_unlocked = "3";
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
  const stage1 = page.locator('[data-fold-id="stage_1"]');
  await expect(stage1).toHaveCount(1);
  if (!(await stage1.evaluate((el) => el.open))) {
    await stage1.locator("summary").first().click({ force: true });
  }
  await expect(page.locator('[data-check-id="projects"]')).toBeVisible();
}

test.describe("progress fold", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("fold-fill, portfolio band, full expand, work links", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    await sign_in(page);
    await unlock_stages(page);
    const report = await open_progress(page);

    const metrics = await page.evaluate(() => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const el = document.querySelector("[data-testid=progress-report]");
      const r = el.getBoundingClientRect();
      const pillars = [...document.querySelectorAll("[data-testid^=pr-pillar-]")];
      const titles = pillars.map((p) => ({
        id: p.getAttribute("data-testid"),
        text: p.querySelector(".pr-pillar-title").textContent.trim(),
      }));
      const heights = pillars.map((p) => Math.round(p.getBoundingClientRect().height));
      const expands = pillars.map((p) =>
        Math.round(p.querySelector(".pr-expand-btn").getBoundingClientRect().bottom),
      );

      function off_page(node) {
        const b = node.getBoundingClientRect();
        if (b.width < 1 || b.height < 1) return false;
        return b.right > vw + 1 || b.bottom > vh + 1 || b.left < -1 || b.top < -1;
      }
      let overflowCount = 0;
      el.querySelectorAll("button, li, .pr-pillar, .pr-section-label").forEach((node) => {
        if (off_page(node)) overflowCount += 1;
      });

      const precursor_ids = [
        ...document.querySelectorAll(
          "[data-testid=pr-band-precursor] [data-testid^=pr-pillar-]",
        ),
      ].map((p) => p.getAttribute("data-testid"));
      const portfolio_ids = [
        ...document.querySelectorAll(
          "[data-testid=pr-band-portfolio] [data-testid^=pr-pillar-]",
        ),
      ].map((p) => p.getAttribute("data-testid"));
      const band_labels = [...document.querySelectorAll(".pr-section-label")].map((n) =>
        n.textContent.trim(),
      );

      return {
        foldFill: el.classList.contains("fold-fill"),
        fillsFold: r.bottom >= vh - 28,
        reportOnPage: r.right <= vw + 1 && r.bottom <= vh + 1,
        overflowCount,
        heightSpread: Math.max(...heights) - Math.min(...heights),
        minPillarH: Math.min(...heights),
        expandSpread: Math.max(...expands) - Math.min(...expands),
        precursor_ids,
        portfolio_ids,
        band_labels,
        titles,
        pillarCount: pillars.length,
      };
    });

    fs.writeFileSync(
      path.join(OUT, "progress-fold-metrics.json"),
      JSON.stringify(metrics, null, 2),
    );
    await page.screenshot({
      path: path.join(OUT, "progress-fold.png"),
      fullPage: false,
    });

    expect(metrics.foldFill).toBe(true);
    // Allow a small gap under the fold (safe-area / chrome); still nearly full viewport
    expect(metrics.fillsFold || metrics.minPillarH >= 400).toBe(true);
    expect(metrics.reportOnPage).toBe(true);
    expect(metrics.overflowCount).toBe(0);
    expect(metrics.pillarCount).toBe(5);
    expect(metrics.minPillarH).toBeGreaterThan(280);
    expect(metrics.heightSpread).toBeLessThanOrEqual(2);
    expect(metrics.expandSpread).toBeLessThanOrEqual(4);
    expect(metrics.band_labels).toEqual(["Precursor", "Portfolio"]);
    expect(metrics.precursor_ids).toEqual(["pr-pillar-docs", "pr-pillar-weekly"]);
    expect(metrics.portfolio_ids).toEqual([
      "pr-pillar-proof",
      "pr-pillar-skills",
      "pr-pillar-application",
    ]);
    expect(metrics.titles.find((t) => t.id === "pr-pillar-proof")?.text).toBe("Portfolio");

    await report
      .getByTestId("pr-pillar-proof")
      .getByRole("button", { name: "Expand" })
      .click();
    const page_dialog = page.locator(".pr-page");
    await expect(page_dialog).toBeVisible();
    await expect(page_dialog.locator(".pr-page-kicker")).toHaveText("Portfolio");
    await expect(page_dialog.getByRole("heading", { level: 2 })).toHaveText("Portfolio");
    await expect(page_dialog.locator('[data-line-id="m3_linkedin"]')).toBeVisible();
    await expect(page_dialog.locator('[data-line-id="projects"]')).toBeVisible();
    await expect(page_dialog.locator('[data-line-id="artifact"]')).toBeVisible();
    await expect(page_dialog.locator('[data-line-id="m3_portfolio"]')).toBeVisible();

    await page_dialog
      .locator('[data-line-id="m3_linkedin"]')
      .getByRole("button")
      .click();
    await expect(page.locator(".pr-page")).toHaveCount(0);
    await expect(page.getByTestId("progress-report")).not.toHaveClass(/open/);
    await expect(page.locator('[data-check-id="m3_linkedin"]')).toBeVisible();
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const el = document.querySelector('[data-check-id="m3_linkedin"]');
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      )
      .toBe(true);

    await open_progress(page);
    await report.getByTestId("pr-pillar-docs").getByRole("button", { name: "Expand" }).click();
    const docs_page = page.locator(".pr-page");
    await expect(docs_page).toBeVisible();
    await expect(docs_page.getByRole("heading", { name: /Module 0/ })).toBeVisible();
    await expect(docs_page.getByRole("heading", { name: "Other worksheets" })).toBeVisible();
    const numbered = docs_page.getByRole("button", { name: /0\.1 \(/ });
    await expect(numbered).toBeVisible();
    const ws_line = docs_page.locator('[data-line-id^="ws_"]').first();
    await expect(ws_line).toBeVisible();
    await ws_line.getByRole("button").click();
    await expect(page.locator(".worksheet-panel, .worksheet-view, [class*=worksheet]").first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL(/[?&]ws=/);
  });
});
