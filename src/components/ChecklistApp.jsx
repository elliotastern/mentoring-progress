import { useEffect, useRef, useState } from "react";
import { STAGES, WEEKLY, STAGE_ORDER } from "../data/stages.js";
import { FOUNDATIONS } from "../data/foundations.js";
import {
  empty_progress,
  stage_pass_status,
  weekly_pass_status,
  is_stage_open,
  weekly_open,
  auto_unlock_progress,
  foundations_passed,
  overall_progress,
} from "../lib/gates.js";
import { toggle_main_check, sheet_module_stats } from "../lib/checkSync.js";
import { WorksheetView } from "./WorksheetView.jsx";
import { ProgressPulse } from "./ProgressPulse.jsx";
import { RoleFitPanel } from "./RoleFitPanel.jsx";
import { FoldSection } from "./FoldSection.jsx";
import { worksheet_by_id } from "../data/worksheets.js";
import { role_track_chosen, is_search_ready, search_path_chosen, proof_label_for_track } from "../lib/roleFit.js";

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
      {sheet.label || "Worksheet"}
    </a>
  );
}

function CheckList({ items, checks, disabled, on_toggle }) {
  return (
    <ul className="check-list">
      {items.map((item) => (
        <li key={item.id}>
          <label>
            <input
              type="checkbox"
              checked={Boolean(checks[item.id])}
              disabled={disabled}
              onChange={(e) => on_toggle(item.id, e.target.checked)}
            />
            <span className="check-copy">
              <span>{item.label}</span>
              <SheetButton sheet={item.sheet} />
              {item.doc?.href ? (
                <a
                  className="doc-link"
                  href={doc_url(item.doc.href)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.doc.label || "Guide"}
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
    return "pick a role track and path";
  }
  const skip_m2 = is_search_ready(progress);
  for (const f of FOUNDATIONS) {
    if (skip_m2 && f.id === "m2") continue;
    if (!stage_pass_status(f, progress).passed) {
      return `finish ${f.title} exit worksheet`;
    }
  }
  return "Foundations complete";
}

function FoundationCard({ stage, progress, on_open }) {
  const status = stage_pass_status(stage, progress);
  const sheet_id = stage.worksheet?.worksheet_id;
  const stats = sheet_id ? sheet_module_stats(progress, sheet_id) : null;
  const pct = stats?.total ? Math.round((100 * stats.done) / stats.total) : 0;
  const search_ready = is_search_ready(progress);
  const m2_optional = stage.id === "m2" && search_ready;
  const track_id = progress.answers?.role_track || "";
  const title =
    stage.id === "m2"
      ? `Module 2 — ${proof_label_for_track(track_id)}`
      : stage.title;
  const passed = status.passed || m2_optional;

  const badge = m2_optional ? (
    <span className="badge ok">Optional</span>
  ) : passed ? (
    <span className="badge ok">Done</span>
  ) : (
    <span className="badge">Required</span>
  );

  return (
    <FoldSection
      id={`mod_${stage.id}`}
      title={title}
      badge={badge}
      defaultOpen={!passed}
      className={`stage-card fold-card ${passed ? "ready" : ""}`}
      testId={`mod-${stage.id}`}
    >
      <div data-module={stage.id}>
        {stats && !m2_optional ? (
          <ProgressPulse compact percent={pct} label={`${stats.done}/${stats.total}`} />
        ) : null}
        {!passed ? (
          <p className="gate">
            {m2_optional ? "Skipped on Search-ready" : "Open exit worksheet"}
          </p>
        ) : null}
        {sheet_id ? (
          <button type="button" className="primary" onClick={() => on_open(sheet_id)}>
            {m2_optional
              ? "Open Module 2 (optional)"
              : stage.worksheet.label || "Open module worksheet"}
          </button>
        ) : null}
      </div>
    </FoldSection>
  );
}

function StageCard({ stage, progress, locked, on_change }) {
  const status = stage_pass_status(stage, progress);
  const checks = progress.checks || {};
  const past =
    !locked &&
    stage.unlocks &&
    STAGE_ORDER.indexOf(progress.highest_unlocked || "0") > STAGE_ORDER.indexOf(stage.id);
  const done_final = !stage.unlocks && status.passed;
  const is_passed = Boolean(status.passed && !locked);
  const is_current = !locked && !is_passed;

  function toggle_check(id, val) {
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  let badge = null;
  if (locked) badge = <span className="badge">Locked</span>;
  else if (past || (status.passed && stage.unlocks) || done_final)
    badge = <span className="badge ok">Done</span>;

  const body = locked ? (
    <p className="hint">Finish previous stage to open.</p>
  ) : (
    <>
      {stage.worksheet?.worksheet_id ? (
        <p className="worksheet-banner">
          <a
            className="linkish"
            href={worksheet_url(stage.worksheet.worksheet_id)}
            target="_blank"
            rel="noreferrer"
          >
            {stage.worksheet.label || "Worksheet"}
          </a>
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
          <span>{stage.answer_label}</span>
          <input
            type="text"
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
      defaultOpen={is_current || locked}
      className={`stage-card fold-card ${locked ? "locked" : ""} ${status.passed ? "ready" : ""}`}
    >
      {body}
    </FoldSection>
  );
}

function WeeklyCard({ progress, locked, on_change, on_reset_week }) {
  const status = weekly_pass_status(progress);
  const checks = progress.checks || {};
  const tallies = progress.weekly_tallies || {};

  function toggle_check(id, val) {
    const synced = toggle_main_check(progress, id, val);
    on_change({ checks: synced.checks, worksheets: synced.worksheets });
  }

  const badge = locked ? <span className="badge">Opens after Stage 3</span> : null;
  const body = locked ? (
    <p className="hint">Finish Stage 3 to open the weekly practice loop.</p>
  ) : (
    <>
      {WEEKLY.worksheet?.worksheet_id ? (
        <p className="worksheet-banner">
          <a
            className="linkish"
            href={worksheet_url(WEEKLY.worksheet.worksheet_id)}
            target="_blank"
            rel="noreferrer"
          >
            {WEEKLY.worksheet.label || "Open worksheet"}
          </a>
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
      <h3>Volume tallies (required)</h3>
      <div className="tallies">
        {WEEKLY.tallies.map((t) => (
          <label key={t.id}>
            <span>
              {t.label} <em>goal {t.goal}</em>
            </span>
            <input
              type="text"
              value={tallies[t.id] || ""}
              onChange={(e) =>
                on_change({ weekly_tallies: { ...tallies, [t.id]: e.target.value } })
              }
              placeholder="Actual"
            />
          </label>
        ))}
      </div>
      <button type="button" className="primary" disabled={!status.passed} onClick={on_reset_week}>
        This week passed — start a fresh week
      </button>
    </>
  );

  return (
    <FoldSection
      id="weekly"
      title={WEEKLY.title}
      badge={badge}
      defaultOpen={!locked && !status.passed}
      className={`stage-card fold-card weekly ${locked ? "locked" : ""}`}
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
  save_status = "saved",
  github_backup_ok = false,
}) {
  const p = progress || empty_progress();
  const foundations_ok = foundations_passed(p);
  const latest_ref = useRef(p);
  const flush_timer = useRef(null);
  const [open_sheet, set_open_sheet] = useState(() => read_ws_param());

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

  function persist(next, opts = {}) {
    latest_ref.current = next;
    set_progress(next);
    on_save(next, opts);
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
    const next_checks = { ...latest_ref.current.checks };
    WEEKLY.items.forEach((item) => {
      delete next_checks[item.id];
    });
    const next = {
      ...latest_ref.current,
      checks: next_checks,
      weekly_tallies: {},
      weekly_of: "",
    };
    persist(next, { silent: false, force_github: true });
  }

  const status_label =
    save_status === "saving" ? "Saving…" : save_status === "error" ? "Save failed" : "Saved";

  const journey = overall_progress(p);

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

  return (
    <div className="checklist-app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Mentorship · Module 4</p>
          <h1>Job Search Progress</h1>
          <p className="sub">
            Highest open stage: <strong>{p.highest_unlocked}</strong>
            <span className={`autosave-note status-${save_status}`}> · {status_label}</span>
            {github_backup_ok ? (
              <span className="autosave-note"> · GitHub backup once/day</span>
            ) : null}
          </p>
          <ProgressPulse
            percent={journey.percent}
            label={`${journey.done} / ${journey.total}`}
          />
        </div>
        {github_backup_ok ? (
          <button
            type="button"
            className="ghost"
            onClick={() => on_save(latest_ref.current, { silent: false, force_github: true })}
          >
            Backup to GitHub
          </button>
        ) : null}
      </header>
      {message ? <p className="toast">{message}</p> : null}
      {!foundations_ok ? (
        <p className="gate" data-testid="mode-gate">
          Foundations · Next: {next_foundation_label(p)}
        </p>
      ) : (
        <p className="hint" data-testid="mode-gate">
          Job Search · Stages open
        </p>
      )}
      <ol className="map">
        {FOUNDATIONS.map((f) => {
          const skip_m2 = is_search_ready(p) && f.id === "m2";
          const passed =
            skip_m2 || stage_pass_status(f, p).passed || foundations_ok;
          return (
            <li key={f.id} className={`${passed ? "open passed" : ""}`}>
              <span className="map-fill" />
              <span className="map-label">{f.id}</span>
            </li>
          );
        })}
        {foundations_ok
          ? STAGES.map((s) => {
              const open = is_stage_open(s.id, p);
              const passed = stage_pass_status(s, p).passed;
              return (
                <li key={s.id} className={`${open ? "open" : ""} ${passed ? "passed" : ""}`}>
                  <span className="map-fill" />
                  <span className="map-label">{s.id}</span>
                </li>
              );
            })
          : null}
        {foundations_ok ? (
          <li
            className={`${weekly_open(p) ? "open" : ""} ${weekly_pass_status(p).passed ? "passed" : ""}`}
          >
            <span className="map-fill" />
            <span className="map-label">W</span>
          </li>
        ) : null}
      </ol>
      <RoleFitPanel progress={p} on_change={patch} />
      <FoldSection
        id="foundations"
        title={foundations_ok ? "Foundations · done" : "Foundations"}
        defaultOpen={!foundations_ok}
        className="foundations-fold"
        testId="foundations-fold"
        summaryClassName="fold-summary fold-summary-section"
      >
        {FOUNDATIONS.map((stage) => (
          <FoundationCard key={stage.id} stage={stage} progress={p} on_open={open_sheet_id} />
        ))}
      </FoldSection>
      {foundations_ok ? (
        <FoldSection
          id="job_search"
          title="Job Search"
          defaultOpen
          className="job-search-fold"
          testId="job-search-fold"
          summaryClassName="fold-summary fold-summary-section"
        >
          {STAGES.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              progress={p}
              locked={!is_stage_open(stage.id, p)}
              on_change={patch}
            />
          ))}
          <WeeklyCard
            progress={p}
            locked={!weekly_open(p)}
            on_change={patch}
            on_reset_week={reset_week}
          />
        </FoldSection>
      ) : null}
    </div>
  );
}
