/**
 * Node smoke: Stage 5–7 worksheet sync (no browser).
 * Run: node scripts/smoke-stage-5-7.mjs
 */
import assert from "node:assert/strict";
import {
  toggle_worksheet_check,
  set_worksheet_text,
  reconcile_checks,
} from "../src/lib/checkSync.js";
import { worksheet_by_id } from "../src/data/worksheets.js";
import { STAGES, WEEKLY } from "../src/data/stages.js";
import { migrate_progress_stages } from "../src/lib/gates.js";

function empty() {
  return { checks: {}, answers: {}, worksheets: {} };
}

function sheet_checks(sheet_id) {
  const sheet = worksheet_by_id(sheet_id);
  assert.ok(sheet, `missing worksheet ${sheet_id}`);
  const ids = [];
  for (const section of sheet.sections) {
    for (const field of section.fields) {
      if (field.type === "checkbox") ids.push(field.id);
    }
  }
  return ids;
}

let progress = empty();

for (const field_id of sheet_checks("interview-drills")) {
  progress = toggle_worksheet_check(progress, "interview-drills", field_id, true);
}
progress = set_worksheet_text(progress, "interview-drills", "sql_last_date", "2026-09-20");
assert.equal(progress.checks.sql, true);
assert.equal(progress.checks.case, true);
assert.equal(progress.checks.loop_named, true);
assert.equal(progress.checks.drills_habit, true);
assert.equal(progress.answers.sql_date, "2026-09-20");

for (const field_id of sheet_checks("loop-ready")) {
  progress = toggle_worksheet_check(progress, "loop-ready", field_id, true);
}
progress = set_worksheet_text(progress, "loop-ready", "company_1", "Stripe");
progress = set_worksheet_text(progress, "loop-ready", "company_2", "Notion");
assert.equal(progress.checks.recruiter_story, true);
assert.equal(progress.checks.tech_ready, true);
assert.equal(progress.checks.case_ready, true);
assert.equal(progress.checks.notes_fields, true);
assert.equal(progress.checks.after_screen, true);
assert.match(progress.answers.next_interview, /Stripe/);
assert.match(progress.answers.next_interview, /Notion/);

for (const field_id of sheet_checks("comp-planning")) {
  progress = toggle_worksheet_check(progress, "comp-planning", field_id, true);
}
progress = set_worksheet_text(
  progress,
  "comp-planning",
  "walkaway",
  "Base ≥ $140k + remote",
);
assert.equal(progress.checks.comp, true);
assert.equal(progress.checks.criteria, true);
assert.equal(progress.checks.salary_ready, true);
assert.equal(progress.checks.salary_practiced, true);
assert.match(progress.answers.walkaway, /140k/);

progress = reconcile_checks(progress);
assert.equal(progress.worksheets["interview-drills"].sql_done, true);
assert.equal(progress.worksheets["loop-ready"].note_same_day, true);
assert.equal(progress.worksheets["loop-ready"].followup_habit, true);
assert.equal(progress.worksheets["comp-planning"].comp_done, true);

for (const id of ["0", "1", "2", "3", "4"]) {
  const stage = STAGES.find((s) => s.id === id);
  assert.ok(stage, `missing stage ${id}`);
  assert.ok(stage.worksheet?.worksheet_id, `stage ${id} needs worksheet`);
  assert.ok(
    !String(stage.worksheet.worksheet_id).includes("module-exit"),
    `stage ${id} still points at module exit`,
  );
  for (const item of stage.items) {
    const href = item.doc?.href || "";
    assert.ok(
      !href.includes("module-5") && !href.includes("module-6"),
      `stage ${id} item ${item.id} still gates on module 5/6 docs`,
    );
  }
}

assert.equal(STAGES.length, 5, "expected 5 Job Search stages");
assert.equal(WEEKLY.unlock_after_stage, "2");

const migrated = migrate_progress_stages({
  highest_unlocked: "6",
  stage_schema: 1,
  checks: {},
});
assert.equal(migrated.highest_unlocked, "3");
assert.equal(migrated.stage_schema, 2);

const loop = worksheet_by_id("loop-ready");
assert.ok(loop.sections.length <= 8, "loop-ready too many sections");
let loop_fields = 0;
for (const s of loop.sections) loop_fields += s.fields.length;
assert.ok(loop_fields <= 32, `loop-ready has ${loop_fields} fields`);

const comp = worksheet_by_id("comp-planning");
assert.ok(comp.sections.length <= 5, "comp-planning too many sections");

assert.equal(worksheet_by_id("module-exit-5"), undefined);
assert.equal(worksheet_by_id("module-exit-6"), undefined);

const stage3 = STAGES.find((s) => s.id === "3");
const stage4 = STAGES.find((s) => s.id === "4");
assert.ok(stage3.items.some((i) => i.id === "behavioral_ready"));
assert.ok(stage4.items.some((i) => i.id === "negotiate_ready"));
assert.ok(
  stage4.items.every(
    (i) => !i.doc?.href?.includes("module-5") && !i.doc?.href?.includes("module-6"),
  ),
);
assert.ok(stage4.items.some((i) => i.doc?.href?.includes("step-3d-offer")));

console.log("smoke-stage-5-7: ok");
