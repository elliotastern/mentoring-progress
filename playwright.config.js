import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  retries: 1,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    headless: true,
    // System Chrome — avoids downloading Playwright's Chromium build
    channel: "chrome",
    trace: "on-first-retry",
  },
});
