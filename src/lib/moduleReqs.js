/**
 * Module readiness / prior-module requirements (status + warning, not hide gates).
 */
import { FOUNDATIONS } from "../data/foundations.js";
import { stage_pass_status } from "./gates.js";
import { role_track_chosen, search_path_chosen, is_search_ready } from "./roleFit.js";

/** Module 4 Job Search readiness — resume/portfolio from Module 3 guides. */
export function module_4_readiness(progress) {
  const checks = progress.checks || {};
  const job = role_track_chosen(progress);
  const resume = Boolean(checks.m3_resume);
  const portfolio = Boolean(checks.m3_portfolio);
  return {
    job,
    resume,
    portfolio,
    all_ok: job && resume && portfolio,
    rows: [
      { id: "job", label: "Target job picked", ok: job },
      { id: "resume", label: "Targeted Resume", ok: resume },
      { id: "portfolio", label: "Targeted Portfolio", ok: portfolio },
    ],
  };
}

function module_passed(progress, module_id) {
  const stage = FOUNDATIONS.find((f) => f.id === module_id);
  if (!stage) return false;
  return stage_pass_status(stage, progress).passed;
}

/**
 * Prior-module requirement for M0–M3 cards.
 * Returns { ok, label, detail } for a one-line status.
 */
export function module_prior_req(stage_id, progress) {
  const skip_m2 = is_search_ready(progress);

  if (stage_id === "m0") {
    const ok = role_track_chosen(progress) && search_path_chosen(progress);
    return {
      ok,
      label: "Requires Job Target + Path",
      detail: ok ? "Job Target + Path set" : "Pick Job Target and Path above",
    };
  }
  if (stage_id === "m1") {
    const ok = module_passed(progress, "m0");
    return {
      ok,
      label: "Requires Module 0",
      detail: ok ? "Module 0 done" : "We recommend to finish Module 0 first",
    };
  }
  if (stage_id === "m2") {
    if (skip_m2) {
      return { ok: true, label: "Optional on Search-ready", detail: "Skipped on Search-ready" };
    }
    const ok = module_passed(progress, "m1");
    return {
      ok,
      label: "Requires Module 1",
      detail: ok ? "Module 1 done" : "We recommend to finish Module 1 first",
    };
  }
  if (stage_id === "m3") {
    const ok = skip_m2 || module_passed(progress, "m2");
    return {
      ok,
      label: "Requires Project",
      detail: ok
        ? skip_m2
          ? "Project skipped (Search-ready)"
          : "Project done"
        : "We recommend to finish Project first",
    };
  }
  return null;
}
