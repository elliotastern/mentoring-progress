import { useEffect, useRef, useState } from "react";
import { STAGES, WEEKLY, STAGE_PATH, stage_is_locked } from "../data/stages.js";
import { FOUNDATIONS, MODULES } from "../data/foundations.js";
import {
  empty_progress,
  stage_pass_status,
  weekly_pass_status,
  auto_unlock_progress,
  foundations_passed,
  weekly_open,
} from "../lib/gates.js";
import { toggle_main_check, sheet_module_stats, toggle_worksheet_check } from "../lib/checkSync.js";
import { WorksheetView, WorksheetFields } from "./WorksheetView.jsx";
import { ProgressPulse } from "./ProgressPulse.jsx";
import { ProgressReport } from "./ProgressReport.jsx";
import { JobTargetFoldTitle, RoleFitFields, RoleFitPanel } from "./RoleFitPanel.jsx";
import { CompanyListFields } from "./CompanyListFields.jsx";
import { FoldSection } from "./FoldSection.jsx";
import { TipText } from "./Tip.jsx";
import { worksheet_by_id } from "../data/worksheets.js";
import {
  role_track_chosen,
  is_search_ready,
  search_path_chosen,
  selected_role_tracks,
} from "../lib/roleFit.js";
import {
  apply_week_reset,
  bump_tally,
  format_tally_value,
  streak_drivers_met,
  tally_goal_met,
  tally_number,
} from "../lib/weeklyStreak.js";
import { module_4_readiness, module_prior_req } from "../lib/moduleReqs.js";
import { snapshot_progress_report, maybe_snapshot_progress } from "../lib/progressReport.js";
import { MenteeOverviewButton, MenteeOverviewView } from "./MenteeOverview.jsx";

function doc_url(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${href.replace(/^\//, "")}`;
}

function worksheet_url(id) {
  if (!id) return "";
  const base = import.meta.env.BASE_URL || "/";
  return `${base}?ws=${encodeURIComponent(id)}`;
}

function read_ws_param() {
  try {
    const id = new URLSearchParams(window.location.search).get("ws");
    if (!id || !worksheet_by_id(id)) return null;
    return id === "chart-e" ? "company-fit" : id;
  } catch {
    return null;
  }
}

function clear_ws_param() {
  try {
    const u = new URL(window.location.href);
    if (!u.searchParams.has("ws")) return;
    u.searchParams.delete("ws");
    const next = u.pathname + (u.searchParams.toString() ? `?${u.searchParams}` : "") + u.hash;
    window.history.replaceState({}, "", next);
  } catch {
    /* ignore */
  }
}

function SheetButton({ sheet, on_open }) {
  if (!sheet?.worksheet_id) return null;
  const id = sheet.worksheet_id;
  return (
    <a
      className="doc-link sheet-link sheet-btn"
      href={worksheet_url(id)}
      data-testid={`sheet-link-${id}`}
      onClick={(e) => {
        e.stopPropagation();
        if (!on_open) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        on_open(id);
      }}
    >
      <TipText text={sheet.label || "Worksheet"} />
    </a>
  );
}

function CheckList({ items, checks, disabled, on_toggle, on_open }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item.id} data-check-id={item.id}>
          <label>
            <input
              type="checkbox"
              checked={Boolean(checks[item.id])}
              disabled={disabled}
              onChange={(e) => on_toggle(item.id, e.target.checked)}
            />
            <span className="check-copy">
              <span>
                <TipText text={item.label} />
              </span>
              <SheetButton sheet={item.sheet} on_open={on_open} />
              {item.doc?.href ? (
                <a
                  className="doc-link"
                  href={doc_url(item.doc.href)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TipText text={item.doc.label || "Guide"} />
                </a>
              ) : null}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Module 4 setup checks: role gets the Job Target calculator fold. */
function Module4SetupList({ items, checks, progress, on_toggle, on_change, on_open }) {
  const [role_fold_open, set_role_fold_open] = useState(false);
  const answers = progress.answers || {};
  const selected_ids = selected_role_tracks(answers);
  const track_and_path = role_track_chosen(progress) && search_path_chosen(progress);
  const role_title = (
    <JobTargetFoldTitle
      track_ids={selected_ids}
      job_by={answers.job_by || ""}
      progress={progress}
    />
  );
  const role_badge = track_and_path ? (
    <span className="badge ok">Set</span>
  ) : (
    <span className="badge">Required</span>
  );

  function on_role_change(partial) {
    let next = {
      ...progress,
      ...partial,
      answers: partial.answers !== undefined ? partial.answers : progress.answers,
    };
    if (role_track_chosen(next) && search_path_chosen(next)) {
      const already =
        Boolean(next.worksheets?.["search-ready"]?.know_role) ||
        Boolean(next.checks?.m4_know_role);
      if (!already) {
        next = toggle_worksheet_check(next, "search-ready", "know_role", true);
      }
    }
    on_change({
      answers: next.answers,
      worksheets: next.worksheets,
      checks: next.checks,
      skill_level: next.skill_level,
    });
  }

  return (
    <ul className="check-list" data-testid="m4-setup-list">
      {items.map((item) => {
        if (item.id === "m4_know_role") {
          return (
            <li key={item.id} data-check-id={item.id} className="m4-role-check">
              <div className="jo-prereq-role">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(checks[item.id])}
                    onChange={(e) => on_toggle(item.id, e.target.checked)}
                  />
                  <span className="check-copy">
                    <span>
                      <TipText text={item.label} />
                    </span>
                    {item.doc?.href ? (
                      <a
                        className="doc-link"
                        href={doc_url(item.doc.href)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TipText text={item.doc.label || "Guide"} />
                      </a>
                    ) : null}
                  </span>
                </label>
                <FoldSection
                  id="m4_rolefit"
                  title={role_title}
                  badge={role_badge}
                  defaultOpen={false}
                  open={role_fold_open}
                  onOpenChange={set_role_fold_open}
                  className="jo-role-fit role-fit"
                  testId="m4-role-fit"
                  summaryClassName="fold-summary fold-summary-nested"
                >
                  <RoleFitFields
                    progress={progress}
                    on_change={on_role_change}
                    suggest_fold_id="m4_rolefit_suggest"
                    on_submit={() => set_role_fold_open(false)}
                  />
                </FoldSection>
              </div>
            </li>
          );
        }

        if (item.id === "m4_know_companies") {
          return (
            <li key={item.id} data-check-id={item.id} className="m4-companies-check">
              <div className="jo-prereq-role">
                <label>
                  <input
                    type="checkbox"
                    checked={Boolean(checks[item.id])}
                    onChange={(e) => on_toggle(item.id, e.target.checked)}
                  />
                  <span className="check-copy">
                    <span>
                      <TipText text={item.label} />
                    </span>
                    <SheetButton sheet={item.sheet} on_open={on_open} />
                    {item.doc?.href ? (
                      <a
                        className="doc-link"
                        href={doc_url(item.doc.href)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TipText text={item.doc.label || "Guide"} />
                      </a>
                    ) : null}
                  </span>
                </label>
                <CompanyListFields
                  progress={progress}
                  on_change={on_change}
                  on_open={on_open}
                  readOnly
                  testId="m4-company-list"
                  fold_id="m4_company_list"
                />
              </div>
            </li>
          );
        }

        return (
          <li key={item.id} data-check-id={item.id}>
            <label>
              <input
                type="checkbox"
                checked={Boolean(checks[item.id])}
                onChange={(e) => on_toggle(item.id, e.target.checked)}
              />
              <span className="check-copy">
                <span>
                  <TipText text={item.label} />
                </span>
                <SheetButton sheet={item.sheet} on_open={on_open} />
                {item.doc?.href ? (
                  <a
                    className="doc-link"
                    href={doc_url(item.doc.href)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TipText text={item.doc.label || "Guide"} />
                  </a>
                ) : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function next_foundation_label(progress) {
  if (!role_track_chosen(progress) || !search_path_chosen(progress)) {
    return "pick your job type and path";
  }
  const skip_m2 = is_search_ready(progress);
  for (const f of FOUNDATIONS) {
    if (skip_m2 && f.id === "m2") continue;
    if (!stage_pass_status(f, progress).passed) {
      return `finish ${f.title}`;
    }
  }
  return "Foundations complete";
}

/** One clear action — used in Progress header + mode gate. */
function recommended_next_text(progress) {
  if (!foundations_passed(progress)) {
    return `Foundations · Next: ${next_foundation_label(progress)}`;
  }
  const m4 = module_4_readiness(progress);
  if (!m4.prereqs_ok) {
    return "Module 4 · Next: finish Pre Requirements (role, companies, portfolio)";
  }
  if (!m4.overview) {
    return "Module 4 · Next: read the Job Search Overview";
  }
  if (!m4.tracker) {
    return "Module 4 · Next: download and set up your Tracker";
  }
  const checks = progress.checks || {};
  const apply_items = STAGES.find((s) => s.id === "1")?.items || [];
  const next_apply = apply_items.find((item) => !checks[item.id]);
  if (next_apply) {
    return `Module 4 · Next: ${next_apply.label}`;
  }
  return "Module 4 · Keep applying this week";
}

/** Next module fold to open by default (M0–M3 incomplete, else Module 4). */
function next_module_focus_id(progress) {
  const skip_m2 = is_search_ready(progress);
  for (const f of FOUNDATIONS) {
    if (skip_m2 && f.id === "m2") continue;
    if (!stage_pass_status(f, progress).passed) return f.id;
  }
  return "m4";
}

function ReqMark({ ok }) {
  return (
    <span className={`req-mark ${ok ? "ok" : "bad"}`} aria-hidden="true">
      {ok ? "✓" : "✗"}
    </span>
  );
}

function ModuleReqList({ rows }) {
  return (
    <ul className="module-reqs" data-testid="module-reqs">
      {rows.map((row) => (
        <li key={row.id} className={row.ok ? "req-ok" : "req-bad"}>
          <ReqMark ok={row.ok} />
          <span>{row.label}</span>
        </li>
      ))}
    </ul>
  );
}

function m4_job_search_score(progress) {
  const checks = progress.checks || {};
  let done = 0;
  let need = 0;

  need += 1;
  if (checks.m4_overview) done += 1;
  need += 1;
  if (checks.m4_tracker) done += 1;

  for (const stage of STAGES) {
    for (const item of stage.items || []) {
      need += 1;
      if (checks[item.id]) done += 1;
    }
    for (const item of stage.portfolio_items || []) {
      need += 1;
      if (checks[item.id]) done += 1;
    }
    for (const item of stage.channel_items || []) {
      need += 1;
      if (checks[item.id]) done += 1;
    }
    if (stage.level_items) {
      const level = progress.skill_level;
      const items = level ? stage.level_items[level] : null;
      if (items?.length) {
        for (const item of items) {
          need += 1;
          if (checks[item.id]) done += 1;
        }
      }
    }
  }

  if (!need) return 0;
  return Math.round((100 * done) / need);
}

function module_score_100(stage, status, m4_ready, _m2_optional, stats, progress) {
  if (stage.id === "m4") return m4_job_search_score(progress || {});
  if (status.passed) return 100;
  if (stats?.total) return Math.round((100 * stats.done) / stats.total);
  const need = Math.max(stage.items?.length || 0, status.core_need || 0, 1);
  const done = Math.min(status.core_done || 0, need);
  return Math.round((100 * done) / need);
}

function FoldScoreBar({ score, testId }) {
  const pct = Math.max(0, Math.min(100, score || 0));
  return (
    <span
      className={`fold-score ${pct >= 100 ? "fold-score-done" : ""}`.trim()}
      data-testid={testId}
      title={`${pct}% complete`}
    >
      <span className="fold-score-track" aria-hidden="true">
        <span className="fold-score-fill" style={{ width: `${pct}%` }} />
      </span>
      <span className="fold-score-pct">{pct}%</span>
    </span>
  );
}

function FoundationCard({
  stage,
  progress,
  on_open,
  on_change,
  defaultOpen,
  on_reset_week,
}) {
  const status = stage_pass_status(stage, progress);
  const sheet_id = stage.worksheet?.worksheet_id;
  const stats = sheet_id ? sheet_module_stats(progress, sheet_id) : null;
  const search_ready = is_search_ready(progress);
  const m2_optional = stage.id === "m2" && search_ready;
  const is_m4 = stage.id === "m4";
  const title = stage.title;
  const m4_ready = is_m4 ? module_4_readiness(progress) : null;
  const prior = !is_m4 ? module_prior_req(stage.id, progress) : null;
  const passed = is_m4
    ? Boolean(m4_ready?.all_ok)
    : status.passed || m2_optional;
  const checks = progress.checks || {};
  const score = module_score_100(stage, status, m4_ready, m2_optional, stats, progress);
  const pct = score;
  const show_inline_sheet = Boolean(sheet_id) && !is_m4 && !m2_optional;

  function toggle_check(id, val) {
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  let badge = null;
  if (is_m4) {
    badge = m4_ready.all_ok ? (
      <span className="badge ok">Ready</span>
    ) : (
      <span className="badge">Needs setup</span>
    );
  } else if (m2_optional) {
    badge = <span className="badge ok">Optional</span>;
  } else if (passed) {
    badge = <span className="badge ok">Done</span>;
  } else {
    badge = <span className="badge">Required</span>;
  }

  return (
    <FoldSection
      id={`mod_${stage.id}`}
      title={title}
      badge={badge}
      meta={
        <FoldScoreBar score={score} testId={`mod-score-${stage.id}`} />
      }
      defaultOpen={defaultOpen}
      className={`stage-card fold-card ${passed ? "ready" : ""} ${is_m4 ? "job-search-fold" : ""}`.trim()}
      testId={is_m4 ? "job-search-fold" : `mod-${stage.id}`}
    >
      <div data-module={stage.id} data-testid={is_m4 ? "mod-m4" : undefined}>
        {stats ? (
          <ProgressPulse
            compact
            percent={pct}
            label={
              m2_optional
                ? `Optional · ${stats.done}/${stats.total} done`
                : `${stats.done}/${stats.total} · checks ${stats.sync.done}/${stats.sync.total} · fill-ins ${stats.fill.done}/${stats.fill.total}`
            }
          />
        ) : null}
        {prior && !prior.ok ? (
          <p className="gate module-req-warn" data-testid={`mod-req-warn-${stage.id}`}>
            <ReqMark ok={false} /> <TipText text={prior.detail} />
          </p>
        ) : null}
        {prior && prior.ok && stage.id !== "m2" ? (
          <p className="hint module-req-met">
            <ReqMark ok /> <TipText text={prior.detail} />
          </p>
        ) : null}
        {m2_optional ? (
          <p className="hint">
            <TipText text="Skipped on Search-ready" />
          </p>
        ) : null}
        {!is_m4 && stage.id !== "m0" && stage.id !== "m1" && !passed && !m2_optional ? (
          <p className="gate">
            <TipText text="Complete every guide and fill-in below to unlock the next module" />
          </p>
        ) : null}
        {show_inline_sheet ? (
          <WorksheetFields
            worksheet_id={sheet_id}
            progress={progress}
            on_change={on_change}
            on_open={on_open}
          />
        ) : null}
        {m2_optional && sheet_id ? (
          <button type="button" className="primary" onClick={() => on_open(sheet_id)}>
            <TipText text="Open Project (optional)" />
          </button>
        ) : null}
        {!show_inline_sheet && !m2_optional && stage.items?.length && !is_m4 ? (
          <CheckList
            items={stage.items}
            checks={checks}
            disabled={false}
            on_toggle={toggle_check}
            on_open={on_open}
          />
        ) : null}
        {is_m4 ? (
          <>
            <JobSearchPath progress={progress} />
            <M4StepCard
              id="m4_step_prereq"
              testId="m4-step-prereq"
              title="Setup 1: Pre Requirements"
              ready={Boolean(m4_ready.prereqs_ok)}
              done={m4_ready.rows.filter((r) => r.ok).length}
              need={m4_ready.rows.length}
              sheets={prereq_sheet_links(stage.items)}
              on_open={on_open}
              defaultOpen={!m4_ready.prereqs_ok}
            >
              <ModuleReqList rows={m4_ready.rows} />
              {!m4_ready.prereqs_ok ? (
                <p className="gate module-req-warn" data-testid="m4-req-warn">
                  <TipText text="Finish role, company list, and portfolio before treating Job Search as ready" />
                </p>
              ) : null}
              <Module4SetupList
                items={stage.items.filter((item) => item.step === "prereq")}
                checks={checks}
                progress={progress}
                on_toggle={toggle_check}
                on_change={on_change}
                on_open={on_open}
              />
            </M4StepCard>
            <M4StepCard
              id="m4_step_overview"
              testId="m4-step-overview"
              title="Setup 2: Read the Overview"
              ready={Boolean(checks.m4_overview)}
              done={checks.m4_overview ? 1 : 0}
              need={1}
              sheets={[]}
              on_open={on_open}
              defaultOpen={Boolean(m4_ready.prereqs_ok && !checks.m4_overview)}
            >
              <Module4SetupList
                items={stage.items.filter((item) => item.step === "overview")}
                checks={checks}
                progress={progress}
                on_toggle={toggle_check}
                on_change={on_change}
                on_open={on_open}
              />
            </M4StepCard>
            <M4StepCard
              id="m4_step_tracker"
              testId="m4-step-tracker"
              title="Setup 3: Set up your job tracker"
              ready={Boolean(checks.tracker)}
              done={checks.tracker ? 1 : 0}
              need={1}
              sheets={tracker_sheet_links(stage.items)}
              on_open={on_open}
              defaultOpen={Boolean(
                m4_ready.prereqs_ok && checks.m4_overview && !checks.tracker,
              )}
            >
              <Module4SetupList
                items={stage.items.filter((item) => item.step === "tracker")}
                checks={checks}
                progress={progress}
                on_toggle={toggle_check}
                on_change={on_change}
                on_open={on_open}
              />
            </M4StepCard>
            <M4StepCard
              id="m4_step_applying"
              testId="m4-step-applying"
              title="Apply loop"
              ready={
                !stage_is_locked("1", progress) &&
                (STAGES.find((s) => s.id === "1")?.items || []).every(
                  (item) => checks[item.id],
                )
              }
              locked={stage_is_locked("1", progress)}
              done={(STAGES.find((s) => s.id === "1")?.items || []).filter(
                (item) => checks[item.id],
              ).length}
              need={(STAGES.find((s) => s.id === "1")?.items || []).length}
              sheets={applying_sheet_links()}
              on_open={on_open}
              defaultOpen={Boolean(
                m4_ready.prereqs_ok && checks.m4_overview && checks.tracker,
              )}
            >
              <ApplyingStepsFlat progress={progress} on_change={on_change} on_open={on_open} />
            </M4StepCard>
          </>
        ) : null}
      </div>
    </FoldSection>
  );
}

function prereq_sheet_links(items) {
  const seen = new Set();
  const out = [];
  for (const item of items.filter((i) => i.step === "prereq")) {
    const sheet = item.sheet;
    if (!sheet?.worksheet_id || seen.has(sheet.worksheet_id)) continue;
    seen.add(sheet.worksheet_id);
    out.push(sheet);
  }
  const aim = STAGES.find((s) => s.id === "0");
  const brainstorm = aim?.worksheet;
  if (brainstorm?.worksheet_id && !seen.has(brainstorm.worksheet_id)) {
    out.push(brainstorm);
  }
  return out;
}

function tracker_sheet_links(items) {
  const from_setup = items.filter((i) => i.step === "tracker");
  const seen = new Set();
  const out = [];
  for (const item of from_setup) {
    const sheet = item.sheet;
    if (!sheet?.worksheet_id || seen.has(sheet.worksheet_id)) continue;
    seen.add(sheet.worksheet_id);
    out.push(sheet);
  }
  const aim = STAGES.find((s) => s.id === "0");
  for (const item of aim?.items || []) {
    const sheet = item.sheet;
    if (!sheet?.worksheet_id || seen.has(sheet.worksheet_id)) continue;
    seen.add(sheet.worksheet_id);
    out.push(sheet);
  }
  return out;
}

function applying_sheet_links() {
  const apply = STAGES.find((s) => s.id === "1");
  return [apply?.worksheet, ...(apply?.extra_sheets || [])].filter(
    (s) => s?.worksheet_id,
  );
}

function WorksheetBanner({ sheets, on_open }) {
  if (!sheets?.length) return null;
  return (
    <p className="worksheet-banner">
      {sheets.map((sheet, i) => (
        <span key={sheet.worksheet_id}>
          {i > 0 ? " · " : null}
          <a
            className="linkish"
            href={worksheet_url(sheet.worksheet_id)}
            data-testid={`sheet-link-${sheet.worksheet_id}`}
            onClick={(e) => {
              if (!on_open) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
              e.preventDefault();
              on_open(sheet.worksheet_id);
            }}
          >
            <TipText text={sheet.label || "Worksheet"} />
          </a>
        </span>
      ))}
    </p>
  );
}

function M4StepCard({
  id,
  testId,
  title,
  ready,
  locked = false,
  done,
  need,
  sheets,
  on_open,
  defaultOpen = true,
  children,
}) {
  let badge = null;
  if (locked) badge = <span className="badge">Next</span>;
  else if (ready) badge = <span className="badge ok">Done</span>;

  return (
    <FoldSection
      id={id}
      title={title}
      badge={badge}
      defaultOpen={defaultOpen}
      className={`stage-card fold-card m4-step ${locked ? "locked" : ""} ${ready ? "ready" : ""}`.trim()}
      testId={testId}
    >
      <WorksheetBanner sheets={sheets} on_open={on_open} />
      {typeof done === "number" && typeof need === "number" ? (
        <p className="gate">
          <strong>
            {done}/{need}
          </strong>
        </p>
      ) : null}
      {children}
    </FoldSection>
  );
}

function ApplyingStepsFlat({ progress, on_change, on_open }) {
  const apply = STAGES.find((s) => s.id === "1");
  const checks = progress.checks || {};
  const apply_locked = stage_is_locked("1", progress);

  function toggle_check(id, val) {
    if (apply_locked) return;
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  return (
    <div className="m4-applying-flat" data-testid="m4-applying-flat">
      {apply_locked ? (
        <p className="hint">
          <TipText text="Peek ahead. Finish Setup 3 (job tracker) before editing Apply loop checks." />
        </p>
      ) : null}
      <CheckList
        items={apply?.items || []}
        checks={checks}
        disabled={apply_locked}
        on_toggle={toggle_check}
        on_open={on_open}
      />
    </div>
  );
}

function JobSearchPath({ progress }) {
  const current = progress.highest_unlocked || "0";
  return (
    <p className="job-search-path" data-testid="job-search-path">
      {STAGE_PATH.map((step, i) => (
        <span key={step.id}>
          {i > 0 ? <span className="job-search-path-sep"> → </span> : null}
          <span
            className={
              step.id === current ? "job-search-path-current" : "job-search-path-step"
            }
          >
            {step.short}
          </span>
        </span>
      ))}
    </p>
  );
}

function TallyStepper({ tally, value, on_change }) {
  const met = tally_goal_met({ [tally.id]: value }, tally);
  const num = tally_number({ [tally.id]: value }, tally.id);
  const goal = tally.goal_min || 1;
  const pct = Math.min(100, Math.round((100 * num) / goal));

  return (
    <div className={`tally-stepper ${met ? "met" : ""} ${tally.streak_driver ? "streak-driver" : ""}`} data-tally-id={tally.id}>
      <div className="tally-stepper-head">
        <span className="tally-stepper-label">
          <TipText text={tally.label} />
          {tally.streak_driver ? <span className="tally-streak-tag">streak</span> : null}
        </span>
        <em>goal {tally.goal}</em>
      </div>
      <div className="tally-stepper-controls">
        <button
          type="button"
          className="tally-btn"
          aria-label={`Decrease ${tally.label}`}
          onClick={() => on_change(bump_tally({ [tally.id]: value }, tally, -1)[tally.id])}
        >
          −
        </button>
        <input
          className={`tally-value ${met ? "pop" : ""}`}
          type="text"
          inputMode="decimal"
          value={value === "" || value == null ? "" : format_tally_value(value, tally.step)}
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              on_change("");
              return;
            }
            const n = Number(raw);
            if (!Number.isFinite(n) || n < 0) return;
            on_change(format_tally_value(n, tally.step ?? 1));
          }}
          aria-label={tally.label}
        />
        <button
          type="button"
          className="tally-btn"
          aria-label={`Increase ${tally.label}`}
          onClick={() => on_change(bump_tally({ [tally.id]: value }, tally, 1)[tally.id])}
        >
          +
        </button>
      </div>
      <div className="tally-goal-track" aria-hidden="true">
        <div className="tally-goal-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function WeeklyCard({ progress, locked, on_change, on_reset_week, on_open }) {
  const status = weekly_pass_status(progress);
  const checks = progress.checks || {};
  const tallies = progress.weekly_tallies || {};
  const streak = Number(progress.weekly_streak) || 0;
  const best = Number(progress.weekly_best_streak) || 0;
  const drivers_ok = streak_drivers_met(tallies);

  function toggle_check(id, val) {
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  function set_tally(id, value) {
    on_change({ weekly_tallies: { ...tallies, [id]: value } });
  }

  const badge = locked ? <span className="badge">Opens with Apply</span> : null;
  const streak_badge =
    !locked && (streak > 0 || best > 0) ? (
      <span className={`badge streak ${drivers_ok ? "ok" : ""}`}>
        Streak: {streak}
        {best > streak ? ` · best ${best}` : ""}
      </span>
    ) : !locked ? (
      <span className="badge">Streak: 0</span>
    ) : null;

  const body = locked ? (
    <p className="hint" data-testid="weekly-locked-hint">
      <TipText text="Weekly Loop unlocks when you reach Apply." />
    </p>
  ) : (
    <>
      {stage_worksheet_banner()}
      <p className={`streak-banner ${drivers_ok ? "celebrate" : ""}`}>
        <strong>{streak}</strong> week streak
        {best > 0 ? <span className="muted"> · best {best}</span> : null}
        {drivers_ok ? (
          <span className="streak-hit"> · proof + apply goals hit</span>
        ) : (
          <span className="muted"> · hit proof (≥1hr) + apps (≥4) to grow streak</span>
        )}
      </p>
      {!drivers_ok ? (
        <p className="hint fuel-nudge" data-testid="weekly-fuel-nudge">
          Under goal? Open{" "}
          <a
            className="linkish"
            href={worksheet_url("weekly-loop")}
            target="_blank"
            rel="noreferrer"
          >
            Weekly worksheet → Fuel
          </a>{" "}
          (reason, 30m next step, and balance lines if stuck).
        </p>
      ) : null}
      <p className="gate">
        Pass when: <strong>
          {status.core_done}/{status.core_need}
        </strong>{" "}
        checks · tallies {status.tallies_ok ? "✓" : "missing"}
      </p>
      <label className="answer-field">
        <span>Week of</span>
        <input
          type="text"
          value={progress.weekly_of || ""}
          onChange={(e) => on_change({ weekly_of: e.target.value })}
          placeholder="e.g. Sep 22, 2026"
        />
      </label>
      <CheckList items={WEEKLY.items} checks={checks} disabled={false} on_toggle={toggle_check} />
      <h3>Volume counters (required)</h3>
      <div className="tallies">
        {WEEKLY.tallies.map((t) => (
          <TallyStepper
            key={t.id}
            tally={t}
            value={tallies[t.id] ?? ""}
            on_change={(v) => set_tally(t.id, v)}
          />
        ))}
      </div>
      <button type="button" className="primary" disabled={!status.passed} onClick={on_reset_week}>
        This week passed — start a fresh week
      </button>
    </>
  );

  function stage_worksheet_banner() {
    const sheet_links = [
      WEEKLY.worksheet,
      ...(WEEKLY.extra_sheets || []),
    ].filter((s) => s?.worksheet_id);
    if (!sheet_links.length) return null;
    return (
      <p className="worksheet-banner">
        {sheet_links.map((sheet, i) => (
          <span key={sheet.worksheet_id}>
            {i > 0 ? " · " : null}
            <a
              className="linkish"
              href={worksheet_url(sheet.worksheet_id)}
              data-testid={`sheet-link-${sheet.worksheet_id}`}
              onClick={(e) => {
                if (!on_open) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
                e.preventDefault();
                on_open(sheet.worksheet_id);
              }}
            >
              <TipText text={sheet.label || "Open worksheet"} />
            </a>
          </span>
        ))}
      </p>
    );
  }

  return (
    <FoldSection
      id="weekly"
      title={WEEKLY.title}
      badge={
        <>
          {streak_badge}
          {badge}
        </>
      }
      defaultOpen={false}
      className={`stage-card fold-card weekly ${locked ? "locked" : ""} ${drivers_ok ? "streak-ready" : ""}`}
      testId="weekly-fold"
    >
      {body}
    </FoldSection>
  );
}

export function ChecklistApp({
  progress,
  set_progress,
  on_save,
  message,
  github_backup_ok = false,
}) {
  const p = progress || empty_progress();
  const latest_ref = useRef(p);
  const flush_timer = useRef(null);
  const [open_sheet, set_open_sheet] = useState(() => read_ws_param());
  const [open_overview, set_open_overview] = useState(false);

  latest_ref.current = p;

  function close_sheet() {
    set_open_sheet(null);
    clear_ws_param();
  }

  function open_sheet_id(id) {
    if (!id || !worksheet_by_id(id)) return;
    set_open_sheet(id);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("ws", id);
      const next = u.pathname + `?${u.searchParams}` + u.hash;
      window.history.replaceState({}, "", next);
    } catch {
      /* ignore */
    }
  }

  function open_ancestor_folds(el) {
    let node = el;
    while (node && node !== document.body) {
      if (node.matches?.("details.fold-section") && !node.open) {
        const summary = node.querySelector(":scope > summary");
        if (summary) summary.click();
      }
      node = node.parentElement;
    }
  }

  function open_fold_by_id(fold_id) {
    if (!fold_id) return null;
    const fold = document.querySelector(`details.fold-section[data-fold-id="${CSS.escape(fold_id)}"]`);
    if (!fold) return null;
    open_ancestor_folds(fold);
    if (!fold.open) {
      const summary = fold.querySelector(":scope > summary");
      summary?.click();
    }
    return fold;
  }

  function flash_and_scroll(el) {
    if (!el) return false;
    open_ancestor_folds(el);
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("work-target-flash");
      window.setTimeout(() => el.classList.remove("work-target-flash"), 1400);
    });
    return true;
  }

  function work_on(target) {
    if (!target?.kind) return;

    if (target.kind === "worksheet") {
      open_sheet_id(target.id);
      return;
    }

    if (target.kind === "doc") {
      if (!target.href) {
        // No article URL — fall back to worksheet / fold so the click still does something.
        if (target.sheet_id && worksheet_by_id(target.sheet_id)) {
          open_sheet_id(target.sheet_id);
          return;
        }
        const fold = open_fold_by_id(target.fold_id);
        if (fold) flash_and_scroll(fold);
        return;
      }
      const url = doc_url(target.href);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      // Also jump to the related checklist row when it exists (same click, secondary).
      if (target.check_id) {
        const el = document.querySelector(
          `[data-check-id="${CSS.escape(target.check_id)}"]`,
        );
        flash_and_scroll(el);
      }
      return;
    }

    if (target.kind === "check") {
      const el = document.querySelector(`[data-check-id="${CSS.escape(target.id)}"]`);
      if (flash_and_scroll(el)) return;
      if (target.fold_id) {
        const fold = open_fold_by_id(target.fold_id);
        if (fold) {
          const again = document.querySelector(`[data-check-id="${CSS.escape(target.id)}"]`);
          if (flash_and_scroll(again || fold)) return;
        }
      }
      const job = document.querySelector("[data-testid=job-search-fold]");
      flash_and_scroll(job);
      return;
    }

    if (target.kind === "weekly") {
      open_fold_by_id("weekly");
      const tally = document.querySelector(`[data-tally-id="${CSS.escape(target.id)}"]`);
      const weekly = document.querySelector("[data-testid=weekly-fold]");
      flash_and_scroll(tally || weekly);
    }
  }

  function persist(next, opts = {}) {
    const with_snap = {
      ...next,
      progress_snapshots: maybe_snapshot_progress(next),
    };
    latest_ref.current = with_snap;
    set_progress(with_snap);
    on_save(with_snap, opts);
  }

  function patch(partial) {
    const merged = { ...latest_ref.current, ...partial };
    const before = merged.highest_unlocked || "0";
    const next = auto_unlock_progress(merged);
    const advanced = (next.highest_unlocked || "0") !== before;
    persist(next, { silent: !advanced, force_github: advanced });
  }

  function flush_pending() {
    if (flush_timer.current) {
      clearTimeout(flush_timer.current);
      flush_timer.current = null;
    }
    on_save(latest_ref.current, { silent: true, flush: true });
  }

  useEffect(() => {
    function on_hide() {
      if (document.visibilityState === "hidden") flush_pending();
    }
    function on_pagehide() {
      flush_pending();
    }
    document.addEventListener("visibilitychange", on_hide);
    window.addEventListener("pagehide", on_pagehide);
    return () => {
      document.removeEventListener("visibilitychange", on_hide);
      window.removeEventListener("pagehide", on_pagehide);
      if (flush_timer.current) clearTimeout(flush_timer.current);
    };
  }, []);

  function reset_week() {
    const current = latest_ref.current;
    const progress_snapshots = snapshot_progress_report(current);
    const patched = apply_week_reset(current);
    const next = {
      ...current,
      ...patched,
      progress_snapshots,
    };
    persist(next, { silent: false, force_github: true });
  }

  if (open_sheet) {
    return (
      <WorksheetView
        worksheet_id={open_sheet}
        progress={p}
        on_change={patch}
        on_close={close_sheet}
        on_open={open_sheet_id}
      />
    );
  }

  if (open_overview) {
    return (
      <div className="checklist-app">
        <header className="app-header app-header-report">
          <ProgressReport
            progress={p}
            on_work_on={(target) => {
              set_open_overview(false);
              work_on(target);
            }}
            next_hint={recommended_next_text(p)}
          />
        </header>
        <MenteeOverviewView progress={p} on_close={() => set_open_overview(false)} />
      </div>
    );
  }

  return (
    <div className="checklist-app">
      <header className="app-header app-header-report">
        <ProgressReport
          progress={p}
          on_work_on={work_on}
          next_hint={recommended_next_text(p)}
        />
        {github_backup_ok ? (
          <button
            type="button"
            className="ghost backup-btn"
            onClick={() => on_save(latest_ref.current, { silent: false, force_github: true })}
          >
            Backup to GitHub
          </button>
        ) : null}
      </header>
      {message ? <p className="toast">{message}</p> : null}
      <RoleFitPanel progress={p} on_change={patch} />
      <section className="modules-list" data-testid="modules-list">
        <div className="modules-list-head">
          <h2 className="modules-list-title">
            <TipText text="Modules" />
          </h2>
          <MenteeOverviewButton open={false} on_toggle={() => set_open_overview(true)} />
        </div>
        {MODULES.map((stage) => (
          <FoundationCard
            key={stage.id}
            stage={stage}
            progress={p}
            on_open={open_sheet_id}
            on_change={patch}
            defaultOpen={false}
            on_reset_week={reset_week}
          />
        ))}
      </section>
    </div>
  );
}
