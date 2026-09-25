import { useEffect, useRef, useState } from "react";
import { STAGES, WEEKLY, STAGE_ORDER, STAGE_PATH, visible_stages, stage_is_locked } from "../data/stages.js";
import { FOUNDATIONS, MODULES } from "../data/foundations.js";
import {
  empty_progress,
  stage_pass_status,
  weekly_pass_status,
  auto_unlock_progress,
  foundations_passed,
  weekly_open,
} from "../lib/gates.js";
import { toggle_main_check, sheet_module_stats } from "../lib/checkSync.js";
import { WorksheetView, WorksheetFields } from "./WorksheetView.jsx";
import { ProgressPulse } from "./ProgressPulse.jsx";
import { ProgressReport } from "./ProgressReport.jsx";
import { RoleFitPanel } from "./RoleFitPanel.jsx";
import { FoldSection } from "./FoldSection.jsx";
import { TipText } from "./Tip.jsx";
import { worksheet_by_id } from "../data/worksheets.js";
import { role_track_chosen, is_search_ready, search_path_chosen } from "../lib/roleFit.js";
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
    return id && worksheet_by_id(id) ? id : null;
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

function SheetButton({ sheet }) {
  if (!sheet?.worksheet_id) return null;
  return (
    <a
      className="doc-link sheet-link sheet-btn"
      href={worksheet_url(sheet.worksheet_id)}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
    >
      <TipText text={sheet.label || "Worksheet"} />
    </a>
  );
}

function CheckList({ items, checks, disabled, on_toggle }) {
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
              <SheetButton sheet={item.sheet} />
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
  if (!m4.all_ok) {
    return "Module 4 · Next: finish target job, resume, and portfolio";
  }
  return "Module 4 · Job Search ready";
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
        {is_m4 ? (
          <>
            <ModuleReqList rows={m4_ready.rows} />
            {!m4_ready.all_ok ? (
              <p className="gate module-req-warn" data-testid="m4-req-warn">
                <TipText text="Finish target job, resume, and portfolio before treating Job Search as ready" />
              </p>
            ) : null}
          </>
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
          />
        ) : null}
        {m2_optional && sheet_id ? (
          <button type="button" className="primary" onClick={() => on_open(sheet_id)}>
            <TipText text="Open Project (optional)" />
          </button>
        ) : null}
        {!show_inline_sheet && !m2_optional && stage.items?.length ? (
          <CheckList
            items={stage.items}
            checks={checks}
            disabled={false}
            on_toggle={toggle_check}
          />
        ) : null}
        {is_m4 ? (
          <>
            <JobSearchPath progress={progress} />
            {visible_stages(progress).map((s) => {
              const locked = stage_is_locked(s.id, progress);
              const current = (progress.highest_unlocked || "0") === s.id;
              return (
                <StageCard
                  key={s.id}
                  stage={s}
                  progress={progress}
                  locked={locked}
                  defaultOpen={current}
                  on_change={on_change}
                />
              );
            })}
            <WeeklyCard
              progress={progress}
              locked={!weekly_open(progress)}
              on_change={on_change}
              on_reset_week={on_reset_week}
            />
          </>
        ) : null}
      </div>
    </FoldSection>
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

function StageCard({ stage, progress, locked, defaultOpen = false, on_change }) {
  const status = stage_pass_status(stage, progress);
  const checks = progress.checks || {};
  const past =
    !locked &&
    stage.unlocks &&
    STAGE_ORDER.indexOf(progress.highest_unlocked || "0") > STAGE_ORDER.indexOf(stage.id);
  const done_final = !stage.unlocks && status.passed;
  const is_passed = Boolean(status.passed && !locked);

  function toggle_check(id, val) {
    if (locked) return;
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  let badge = null;
  if (locked) badge = <span className="badge">Next</span>;
  else if (past || (status.passed && stage.unlocks) || done_final)
    badge = <span className="badge ok">Done</span>;

  const sheet_links = [
    stage.worksheet,
    ...(stage.extra_sheets || []),
  ].filter((s) => s?.worksheet_id);

  const body = (
    <>
      {locked ? (
        <p className="hint">
          <TipText text="Peek ahead — finish the current stage to edit these checks." />
        </p>
      ) : null}
      {sheet_links.length ? (
        <p className="worksheet-banner">
          {sheet_links.map((sheet, i) => (
            <span key={sheet.worksheet_id}>
              {i > 0 ? " · " : null}
              <a
                className="linkish"
                href={worksheet_url(sheet.worksheet_id)}
                target="_blank"
                rel="noreferrer"
              >
                <TipText text={sheet.label || "Worksheet"} />
              </a>
            </span>
          ))}
        </p>
      ) : null}
      <p className="gate">
        <strong>
          {status.core_done}/{status.core_need}
        </strong>
        {stage.channel_items ? (
          <>
            {" "}
            · channels{" "}
            <strong>
              {status.channel_done}/{status.channel_need}
            </strong>
          </>
        ) : null}
        {stage.portfolio_items ? (
          <>
            {" "}
            · portfolio{" "}
            <strong>
              {status.portfolio_done}/{status.portfolio_need}
            </strong>
          </>
        ) : null}
        {stage.needs_level ? (
          <>
            {" "}
            · level{" "}
            <strong>
              {status.level_done}/{status.level_need || "?"}
            </strong>
          </>
        ) : null}
        {stage.answer_key ? <> · answer {status.answer_filled ? "✓" : "—"}</> : null}
      </p>

      <CheckList items={stage.items} checks={checks} disabled={locked} on_toggle={toggle_check} />

      {stage.portfolio_items ? (
        <>
          <h3>
            Portfolio ({status.portfolio_done}/{status.portfolio_need}) — GitHub or site
          </h3>
          <CheckList
            items={stage.portfolio_items}
            checks={checks}
            disabled={locked}
            on_toggle={toggle_check}
          />
        </>
      ) : null}

      {stage.channel_items ? (
        <>
          <h3>
            Channels ({stage.min_channel_checks}/{stage.channel_items.length})
          </h3>
          <CheckList
            items={stage.channel_items}
            checks={checks}
            disabled={locked}
            on_toggle={toggle_check}
          />
        </>
      ) : null}

      {stage.needs_level ? (
        <>
          <h3>Level</h3>
          <select
            value={progress.skill_level || ""}
            disabled={locked}
            onChange={(e) => on_change({ skill_level: e.target.value })}
          >
            <option value="">Entry / mid / senior</option>
            <option value="entry">Entry (0–2 yrs)</option>
            <option value="mid">Mid (2–5 yrs)</option>
            <option value="senior">Senior (5+ yrs)</option>
          </select>
          {progress.skill_level && stage.level_items[progress.skill_level] ? (
            <CheckList
              items={stage.level_items[progress.skill_level]}
              checks={checks}
              disabled={locked}
              on_toggle={toggle_check}
            />
          ) : null}
        </>
      ) : null}

      {stage.answer_key ? (
        <label className="answer-field">
          <span>
            <TipText text={stage.answer_label} />
          </span>
          <input
            type="text"
            disabled={locked}
            value={progress.answers?.[stage.answer_key] || ""}
            onChange={(e) =>
              on_change({
                answers: { ...(progress.answers || {}), [stage.answer_key]: e.target.value },
              })
            }
            placeholder="Required for next stage"
          />
        </label>
      ) : null}
    </>
  );

  return (
    <FoldSection
      id={`stage_${stage.id}`}
      title={stage.title}
      badge={badge}
      defaultOpen={defaultOpen}
      className={`stage-card fold-card ${locked ? "locked" : ""} ${is_passed ? "ready" : ""}`}
    >
      {body}
    </FoldSection>
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

function WeeklyCard({ progress, locked, on_change, on_reset_week }) {
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
    if (!WEEKLY.worksheet?.worksheet_id) return null;
    return (
      <p className="worksheet-banner">
        <a
          className="linkish"
          href={worksheet_url(WEEKLY.worksheet.worksheet_id)}
          target="_blank"
          rel="noreferrer"
        >
          <TipText text={WEEKLY.worksheet.label || "Open worksheet"} />
        </a>
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
