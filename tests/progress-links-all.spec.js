import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { all_work_lines } from "../src/lib/progressReport.js";

const BASE =
  process.env.PROGRESS_BASE_URL || "http://127.0.0.1:4173/mentoring-progress";
const OUT = path.resolve("test-results");

const UNLOCKED = {
  highest_unlocked: "7",
  foundations_complete: true,
  skill_level: "mid",
  answers: {
    role_track: "ds",
    role_tracks: ["ds"],
    search_path: "search_ready",
  },
  checks: {},
  worksheets: {},
  weekly_tallies: {},
  weekly_streak: 0,
  weekly_best_streak: 0,
  weekly_history: [],
  progress_snapshots: [],
};

const PILLAR_TESTID = {
  docs: "pr-pillar-docs",
  weekly: "pr-pillar-weekly",
  proof: "pr-pillar-proof",
  skills: "pr-pillar-skills",
  application: "pr-pillar-application",
};

async function sign_in(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]", { timeout: 20000 });
}

async function seed_unlock(page) {
  await page.addInitScript((payload) => {
    const SESSION_KEY = "mentorship_session_v2";
    window.__MENTORSHIP_TEST_ISOLATE__ = true;
    const PREFIX = "mentorship_progress_test_v2_";
    try {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!session?.uid) return;
      const key = PREFIX + session.uid;
      const raw = localStorage.getItem(key);
      const p = raw ? JSON.parse(raw) : {};
      Object.assign(p, payload);
      localStorage.setItem(key, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, UNLOCKED);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("[data-testid=progress-report]");
  const m4 = page.getByTestId("job-search-fold");
  await expect(m4).toBeVisible({ timeout: 15000 });
  if (!(await m4.evaluate((el) => el.open))) {
    await m4.locator("summary").first().click({ force: true });
  }
  await expect(page.getByTestId("weekly-fold")).toHaveCount(1);
}

async function leave_worksheet(page) {
  const panel = page.locator(".worksheet-panel");
  if (await panel.count()) {
    const done = page.getByRole("button", { name: "Done — back to progress" });
    if (await done.count()) await done.click();
    else await page.getByRole("button", { name: "← Back to progress" }).click();
    await page.waitForSelector("[data-testid=progress-report]", { timeout: 10000 });
  }
}

async function open_progress(page) {
  await leave_worksheet(page);
  const report = page.getByTestId("progress-report");
  if (!(await report.evaluate((el) => el.classList.contains("open")))) {
    await report.locator("button.progress-report-summary").click();
  }
  await expect(report).toHaveClass(/open/);
  return report;
}

async function expand_pillar(page, pillar_id) {
  const report = await open_progress(page);
  const testid = PILLAR_TESTID[pillar_id];
  if (!testid) throw new Error(`unknown pillar ${pillar_id}`);
  // Close any open page first
  if (await page.locator(".pr-page").count()) {
    await page.locator(".pr-page-close").click();
  }
  await report.getByTestId(testid).getByRole("button", { name: "Expand" }).click();
  await expect(page.locator(".pr-page")).toBeVisible();
}

async function in_viewport(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return (
      r.width > 0 &&
      r.height > 0 &&
      r.top < window.innerHeight &&
      r.bottom > 0 &&
      r.left < window.innerWidth &&
      r.right > 0
    );
  }, selector);
}

/** Patch window.open so we can detect opens that ran inside setTimeout (popup-blocker bait). */
async function install_open_gesture_spy(page) {
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
}

async function assert_article_popup(page, popup, work) {
  if (!popup) throw new Error("doc link did not open an article tab");

  const open_meta = await page.evaluate(() => window.__last_open);
  if (!open_meta) {
    throw new Error("doc link opened a tab without going through window.open spy");
  }
  if (open_meta.deferred) {
    throw new Error(
      "doc window.open ran inside setTimeout (will be blocked by real browsers)",
    );
  }
  if (!/view\.html/.test(open_meta.href || "")) {
    throw new Error(`doc window.open was not view.html: ${open_meta.href}`);
  }

  await popup.waitForLoadState("domcontentloaded");
  const url = popup.url();
  if (!/view\.html/.test(url)) {
    throw new Error(`doc popup was not view.html: ${url}`);
  }
  const expected_doc = (String(work.href || "").match(/[?&]doc=([^&#]+)/) || [])[1];
  if (expected_doc && !url.includes(decodeURIComponent(expected_doc))) {
    throw new Error(`doc popup missing doc=${expected_doc}: ${url}`);
  }

  await popup.waitForFunction(
    () => {
      const art = document.querySelector("#content, article");
      if (!art) return false;
      const text = (art.innerText || "").trim();
      if (!text || /^Loading/i.test(text)) return false;
      const err = art.querySelector(".err");
      if (err && /could not load/i.test(err.textContent || "")) return false;
      return text.length > 40;
    },
    null,
    { timeout: 15000 },
  );

  const load_err = await popup.locator(".err").evaluateAll((els) =>
    els.some((e) => /could not load/i.test(e.textContent || "")),
  );
  if (load_err) throw new Error(`article failed to load: ${url}`);

  const hash = (String(work.href || "").match(/#([^?#]+)$/) || [])[1];
  if (hash) {
    const has_anchor = await popup.evaluate((id) => Boolean(document.getElementById(id)), hash);
    if (!has_anchor) {
      throw new Error(`article missing hash #${hash} in ${url}`);
    }
  }

  await popup.close().catch(() => {});
  return "doc-article";
}

async function assert_success(page, target, popup) {
  const work = target.work;
  if (work.kind === "worksheet") {
    await expect(page.locator(".worksheet-panel")).toBeVisible({ timeout: 8000 });
    expect(page.url()).toContain(`ws=${encodeURIComponent(work.id)}`);
    return "worksheet";
  }
  if (work.kind === "check") {
    const sel = `[data-check-id="${work.id}"]`;
    await expect
      .poll(async () => in_viewport(page, sel), { timeout: 8000 })
      .toBe(true);
    return "check";
  }
  if (work.kind === "weekly") {
    await expect
      .poll(
        async () =>
          (await in_viewport(page, `[data-tally-id="${work.id}"]`)) ||
          (await in_viewport(page, "[data-testid=weekly-fold]")),
        { timeout: 8000 },
      )
      .toBe(true);
    return "weekly";
  }
  if (work.kind === "doc") {
    if (!work.href) throw new Error("doc line missing href");
    return assert_article_popup(page, popup, work);
  }
  throw new Error(`unknown kind ${work.kind}`);
}

test.describe.configure({ mode: "serial" });

test.describe("every progress work link", () => {
  test.use({ viewport: { width: 1280, height: 800 } });
  test.setTimeout(600_000);

  test("all Expand work links navigate", async ({ page }) => {
    fs.mkdirSync(OUT, { recursive: true });
    const targets = all_work_lines(UNLOCKED);
    fs.writeFileSync(
      path.join(OUT, "all-work-targets.json"),
      JSON.stringify(targets, null, 2),
    );
    expect(targets.length, "should enumerate work targets").toBeGreaterThan(20);

    await sign_in(page);
    await seed_unlock(page);
    await install_open_gesture_spy(page);

    const failures = [];
    const results = [];

    for (const target of targets) {
      try {
        await leave_worksheet(page);
        await expand_pillar(page, target.pillar_id);
        const line = page.locator(`.pr-page [data-line-id="${target.line_id}"]`);
        await expect(line, `line ${target.line_id} visible`).toBeVisible({ timeout: 5000 });
        const btn = line.getByRole("button");
        await expect(btn).toBeVisible();

        if (target.work.kind === "doc") {
          await page.evaluate(() => {
            window.__last_open = null;
          });
        }

        const popup_wait = page.waitForEvent("popup", {
          timeout: target.work.kind === "doc" ? 10000 : 2500,
        }).catch(() => null);
        await btn.click();
        const popup = await popup_wait;

        // Progress overlay should close for non-worksheet... worksheets remount app
        if (target.work.kind !== "worksheet") {
          await expect(page.locator(".pr-page")).toHaveCount(0, { timeout: 5000 });
        }

        const how = await assert_success(page, target, popup);
        results.push({ id: target.line_id, pillar: target.pillar_id, ok: true, how });
        await leave_worksheet(page);
      } catch (err) {
        failures.push({
          id: target.line_id,
          pillar: target.pillar_id,
          label: target.label,
          work: target.work,
          error: String(err?.message || err).slice(0, 240),
        });
        results.push({ id: target.line_id, pillar: target.pillar_id, ok: false });
        // Recover UI
        try {
          if (await page.locator(".pr-page").count()) {
            await page.locator(".pr-page-close").click();
          }
          await leave_worksheet(page);
        } catch {
          await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
          await seed_unlock(page);
          await install_open_gesture_spy(page);
        }
      }
    }

    fs.writeFileSync(
      path.join(OUT, "work-link-results.json"),
      JSON.stringify({ total: targets.length, failures: failures.length, results }, null, 2),
    );
    fs.writeFileSync(
      path.join(OUT, "work-link-failures.json"),
      JSON.stringify(failures, null, 2),
    );

    expect(
      failures,
      `${failures.length}/${targets.length} work links failed — see test-results/work-link-failures.json`,
    ).toEqual([]);
  });
});
