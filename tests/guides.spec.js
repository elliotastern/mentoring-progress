import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const BASE =
  process.env.PROGRESS_BASE_URL || "https://elliotastern.github.io/mentoring-progress";

function collect_guide_hrefs() {
  const files = [
    "src/data/stages.js",
    "src/data/foundations.js",
    "src/data/worksheets.js",
  ].map((f) => fs.readFileSync(path.join(root, f), "utf8"));
  const src = files.join("\n");
  const hrefs = new Set();

  for (const m of src.matchAll(/overview\("([^"]+)"/g)) {
    hrefs.add(`docs/view.html?doc=overview-v8.md#${m[1]}`);
  }
  for (const m of src.matchAll(/module5\("([^"]+)"/g)) {
    hrefs.add(`docs/view.html?doc=${m[1]}`);
  }
  for (const m of src.matchAll(/module6\("([^"]+)"/g)) {
    hrefs.add(`docs/view.html?doc=${m[1]}`);
  }
  for (const m of src.matchAll(/href:\s*"([^"]+)"/g)) {
    if (m[1].includes("view.html")) hrefs.add(m[1].replace(/^\//, ""));
  }
  for (const m of src.matchAll(/doc:\s*\{\s*href:\s*"([^"]+)"/g)) {
    hrefs.add(m[1].replace(/^\//, ""));
  }

  // Always include every public markdown via viewer
  const docs_dir = path.join(root, "public/docs");
  for (const name of fs.readdirSync(docs_dir)) {
    if (name.endsWith(".md")) hrefs.add(`docs/view.html?doc=${name}`);
  }

  return [...hrefs].sort();
}

const guides = collect_guide_hrefs();

test.describe("guide viewer links", () => {
  test("collects guide hrefs", () => {
    expect(guides.length).toBeGreaterThan(10);
  });

  for (const href of guides) {
    test(`renders ${href}`, async ({ page }) => {
      const url = `${BASE}/${href.replace(/^\//, "")}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      expect(response?.ok(), `HTTP for ${url}`).toBeTruthy();

      const article = page.locator("#content");
      await expect(article).toBeVisible();

      // Wait for markdown fetch + parse (Loading… clears)
      await expect(article).not.toContainText("Loading…", { timeout: 15000 });

      const err = article.locator(".err");
      if ((await err.count()) > 0) {
        const msg = await err.first().innerText();
        expect(msg, `viewer error on ${url}`).not.toMatch(/replace|marked|Could not load/i);
      }

      const html = await article.innerHTML();
      expect(html.trim().length, `empty article for ${url}`).toBeGreaterThan(20);
      expect(html).not.toContain("hundefined");
      expect(html).not.toContain(">undefined</h");
    });
  }
});

test("m0-welcome has no marked replace crash", async ({ page }) => {
  await page.goto(`${BASE}/docs/view.html?doc=m0-welcome.md`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#content")).not.toContainText("Loading…", {
    timeout: 15000,
  });
  await expect(page.locator("#content")).not.toContainText("reading 'replace'");
  await expect(page.locator("#content")).toContainText("Mentorship");
});

test("overview hash targets exist after render", async ({ page }) => {
  const hashes = [
    ...new Set(
      guides
        .filter((h) => h.includes("overview-v8.md#"))
        .map((h) => h.split("#")[1]),
    ),
  ];
  await page.goto(`${BASE}/docs/view.html?doc=overview-v8.md`, {
    waitUntil: "networkidle",
  });
  await expect(page.locator("#content")).not.toContainText("Loading…", {
    timeout: 15000,
  });
  const missing = [];
  for (const hash of hashes) {
    const el = page.locator(`#${CSS.escape(hash)}`);
    if ((await el.count()) === 0) missing.push(hash);
  }
  expect(missing, `missing overview hashes: ${missing.join(", ")}`).toEqual([]);
});
