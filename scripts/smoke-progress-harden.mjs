/**
 * Smoke: wipe protection for mentee progress.
 * Run: node scripts/smoke-progress-harden.mjs
 */
import assert from "node:assert/strict";
import { merge_progress_never_lose, progress_signal, looks_like_wipe } from "../src/lib/progressMerge.js";

const rich = {
  checks: {
    m0_overview: true,
    m0_provided: true,
    m0_communicate: true,
    m0_expectations: true,
    m1_overview: true,
    linkedin: true,
    resume: true,
    resume_ats: true,
    projects: true,
    artifact: true,
    github: true,
  },
  answers: { role_track: "ds", search_path: "build_proof" },
  worksheets: { "module-exit-0": { hours_week: "10", success_outcome: "offer" } },
  highest_unlocked: "0",
};

const wipe = {
  checks: { _test_anchor: true },
  answers: { role_track: "ds", search_path: "search_ready" },
  worksheets: {},
  highest_unlocked: "2",
};

const protected_prog = merge_progress_never_lose(rich, wipe);
assert.equal(looks_like_wipe(rich, wipe), true);
assert.equal(protected_prog.checks.linkedin, true);
assert.equal(protected_prog.checks.resume, true);
assert.equal(protected_prog.checks.github, true);
assert.equal(protected_prog.checks._test_anchor, true);
assert.equal(protected_prog.worksheets["module-exit-0"].hours_week, "10");
assert.ok(progress_signal(protected_prog) > progress_signal(wipe));

const normal_uncheck = merge_progress_never_lose(rich, {
  ...rich,
  checks: { ...rich.checks, linkedin: false },
});
assert.equal(normal_uncheck.checks.linkedin, false);
assert.equal(normal_uncheck.checks.resume, true);

console.log("smoke-progress-harden: ok");
