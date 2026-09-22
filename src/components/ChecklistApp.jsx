import { useEffect, useRef } from "react";
import { STAGES, WEEKLY } from "../data/stages.js";
import {
  empty_progress,
  stage_pass_status,
  weekly_pass_status,
  is_stage_open,
  weekly_open,
  unlock_next,
} from "../lib/gates.js";

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
            <span>{item.label}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function StageCard({ stage, progress, locked, on_change, on_unlock }) {
  const status = stage_pass_status(stage, progress);
  const checks = progress.checks || {};

  return (
    <section className={`stage-card ${locked ? "locked" : ""} ${status.passed ? "ready" : ""}`}>
      <div className="stage-head">
        <h2>{stage.title}</h2>
        {locked ? <span className="badge">Locked</span> : null}
        {!locked && status.passed ? <span className="badge ok">Ready to unlock</span> : null}
      </div>

      {locked ? (
        <p className="hint">Finish the previous stage to open this one.</p>
      ) : (
        <>
          <p className="gate">
            Pass when: <strong>{status.core_done}/{status.core_need}</strong> checks
            {stage.channel_items ? (
              <> · channels <strong>{status.channel_done}/{status.channel_need}</strong></>
            ) : null}
            {stage.needs_level ? (
              <> · level row <strong>{status.level_done}/{status.level_need || "?"}</strong></>
            ) : null}
            {" · "}
            answer {status.answer_filled ? "✓" : "missing"}
          </p>

          <CheckList
            items={stage.items}
            checks={checks}
            disabled={locked}
            on_toggle={(id, val) => on_change({ checks: { ...checks, [id]: val } })}
          />

          {stage.channel_items ? (
            <>
              <h3>Channel rules ({stage.min_channel_checks} of {stage.channel_items.length})</h3>
              <CheckList
                items={stage.channel_items}
                checks={checks}
                disabled={locked}
                on_toggle={(id, val) => on_change({ checks: { ...checks, [id]: val } })}
              />
            </>
          ) : null}

          {stage.needs_level ? (
            <>
              <h3>Your level</h3>
              <select
                value={progress.skill_level || ""}
                onChange={(e) => on_change({ skill_level: e.target.value })}
              >
                <option value="">Select entry / mid / senior</option>
                <option value="entry">Entry (0–2 yrs)</option>
                <option value="mid">Mid (2–5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
              {progress.skill_level && stage.level_items[progress.skill_level] ? (
                <CheckList
                  items={stage.level_items[progress.skill_level]}
                  checks={checks}
                  disabled={locked}
                  on_toggle={(id, val) => on_change({ checks: { ...checks, [id]: val } })}
                />
              ) : null}
            </>
          ) : null}

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
              placeholder="Required to unlock"
            />
          </label>

          <button
            type="button"
            className="primary"
            disabled={!status.passed}
            onClick={() => on_unlock(stage)}
          >
            {stage.unlocks ? `Unlock Stage ${stage.unlocks}` : "Mark Stage 7 complete"}
          </button>
        </>
      )}
    </section>
  );
}

function WeeklyCard({ progress, locked, on_change, on_reset_week }) {
  const status = weekly_pass_status(progress);
  const checks = progress.checks || {};
  const tallies = progress.weekly_tallies || {};

  return (
    <section className={`stage-card weekly ${locked ? "locked" : ""}`}>
      <div className="stage-head">
        <h2>{WEEKLY.title}</h2>
        {locked ? <span className="badge">Unlocks after Stage 3</span> : null}
      </div>
      {locked ? (
        <p className="hint">Complete Stage 3 to unlock the weekly practice loop.</p>
      ) : (
        <>
          <p className="gate">
            Pass when: <strong>{status.core_done}/{status.core_need}</strong> checks · tallies{" "}
            {status.tallies_ok ? "✓" : "missing"}
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
          <CheckList
            items={WEEKLY.items}
            checks={checks}
            disabled={false}
            on_toggle={(id, val) => on_change({ checks: { ...checks, [id]: val } })}
          />
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
      )}
    </section>
  );
}

export function ChecklistApp({ progress, set_progress, on_save, message }) {
  const p = progress || empty_progress();
  const save_timer = useRef(null);

  function queue_autosave(next) {
    if (save_timer.current) clearTimeout(save_timer.current);
    save_timer.current = setTimeout(() => {
      on_save(next, { silent: true });
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (save_timer.current) clearTimeout(save_timer.current);
    };
  }, []);

  function patch(partial) {
    const next = { ...p, ...partial };
    set_progress(next);
    queue_autosave(next);
  }

  function handle_unlock(stage) {
    const result = unlock_next(stage, p);
    if (!result.ok) {
      alert(result.reason);
      return;
    }
    const next = { ...p, highest_unlocked: result.next };
    set_progress(next);
    on_save(next, { silent: false, force_github: true });
  }

  function reset_week() {
    const next_checks = { ...p.checks };
    WEEKLY.items.forEach((item) => {
      delete next_checks[item.id];
    });
    const next = {
      ...p,
      checks: next_checks,
      weekly_tallies: {},
      weekly_of: "",
    };
    set_progress(next);
    on_save(next, { silent: false, force_github: true });
  }

  return (
    <div className="checklist-app">
      <header className="app-header">
        <div>
          <p className="eyebrow">DataShip · Module 4</p>
          <h1>Job Search Progress</h1>
          <p className="sub">
            Highest unlocked stage: <strong>{p.highest_unlocked}</strong>
            <span className="autosave-note"> · autosaves · GitHub backup once/day</span>
          </p>
        </div>
        <button type="button" onClick={() => on_save(p, { silent: false, force_github: true })}>
          Save now
        </button>
      </header>
      {message ? <p className="toast">{message}</p> : null}
      <ol className="map">
        {STAGES.map((s) => (
          <li key={s.id} className={is_stage_open(s.id, p) ? "open" : ""}>
            {s.id}
          </li>
        ))}
        <li className={weekly_open(p) ? "open" : ""}>W</li>
      </ol>
      {STAGES.map((stage) => (
        <StageCard
          key={stage.id}
          stage={stage}
          progress={p}
          locked={!is_stage_open(stage.id, p)}
          on_change={patch}
          on_unlock={handle_unlock}
        />
      ))}
      <WeeklyCard
        progress={p}
        locked={!weekly_open(p)}
        on_change={patch}
        on_reset_week={reset_week}
      />
    </div>
  );
}
