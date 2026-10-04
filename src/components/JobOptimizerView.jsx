import {
  allocate_week,
  channel_done_from_worksheet,
  done_field_key,
  format_hours,
  format_minutes,
  tried_field_key,
  tried_from_worksheet,
} from "../lib/jobOptimizer.js";
import {
  company_fit_from_progress,
  high_effort_jobs,
} from "../lib/companyFit.js";
import {
  set_worksheet_text,
  toggle_worksheet_check,
} from "../lib/checkSync.js";
import { TipText } from "./Tip.jsx";

function opt_field(progress, key, fallback = "") {
  const v = progress?.worksheets?.["job-optimizer"]?.[key];
  if (v === undefined || v === null) return fallback;
  return v;
}

function AttemptStepper({ strategy_id, value, max, on_change }) {
  const n = Number(value) || 0;

  function bump(delta) {
    const next = Math.max(0, Math.min(max, n + delta));
    on_change(String(next));
  }

  return (
    <div
      className="jo-done-stepper"
      data-testid={`jo-tried-${strategy_id}`}
      onClick={(e) => e.preventDefault()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="jo-done-btn"
        aria-label="Decrease attempts"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          bump(-1);
        }}
      >
        −
      </button>
      <input
        type="number"
        min="0"
        max={max}
        step="1"
        inputMode="numeric"
        value={n}
        aria-label="Attempts done this week"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            on_change("0");
            return;
          }
          const v = Number(raw);
          if (!Number.isFinite(v)) return;
          on_change(String(Math.max(0, Math.min(max, Math.floor(v)))));
        }}
      />
      <button
        type="button"
        className="jo-done-btn"
        aria-label="Increase attempts"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          bump(1);
        }}
      >
        +
      </button>
    </div>
  );
}

function StrategyTable({ rows, top_recommend_id, set_tried, section }) {
  return (
    <div className="jo-table-wrap">
      <table className={`jo-table jo-table-week jo-table-${section}`}>
        <thead>
          <tr>
            <th scope="col">Rank</th>
            <th scope="col">Strategy</th>
            <th scope="col">Attempts</th>
            <th scope="col">Do next</th>
            <th scope="col">Time left</th>
            <th scope="col">Payoff</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={row.exhausted ? "jo-row-exhausted" : ""}
              data-testid={
                row.id === top_recommend_id ? "jo-top-recommend" : undefined
              }
            >
              <td colSpan={6} className="jo-row-cell">
                <details
                  className="jo-details"
                  data-testid={`jo-row-${row.id}`}
                >
                  <summary className="jo-summary jo-summary-week">
                    <span className="jo-rank">{row.rank}</span>
                    <span className="jo-name">
                      <TipText text={row.name} />
                    </span>
                    <span className="jo-done">
                      <AttemptStepper
                        strategy_id={row.id}
                        value={row.done}
                        max={row.max_attempts}
                        on_change={(v) => set_tried(row.id, v)}
                      />
                    </span>
                    <span
                      className="jo-attempts"
                      data-testid={`jo-next-${row.id}`}
                    >
                      {row.planned_more}
                    </span>
                    <span className="jo-time">
                      {format_minutes(row.planned_min)}
                    </span>
                    <span className="jo-roi">{row.roi}</span>
                  </summary>
                  <div className="jo-directions">
                    <p>
                      <strong>HOW to use this strategy?</strong>{" "}
                      <TipText text={row.how} />
                    </p>
                    {row.craft ? (
                      <p data-testid={`jo-craft-${row.id}`}>
                        <strong>Craft a message:</strong>{" "}
                        <TipText text={row.craft} />
                      </p>
                    ) : null}
                    <p>
                      <strong>WHY use this strategy?</strong>{" "}
                      <TipText text={row.details} />
                    </p>
                    <p className="hint">
                      Typical per attempt: {row.time_label}. Capacity:{" "}
                      {row.capacity}. Week cap: {row.max_attempts}.
                    </p>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FitApplyQueue({ progress }) {
  const sheet = company_fit_from_progress(progress);
  const jobs = high_effort_jobs(sheet);

  return (
    <div className="jo-fit-queue" data-testid="jo-fit-queue">
      <h3 className="jo-fit-queue-title">
        <TipText text="Apply these first (Job effort 6+)" />
      </h3>
      {jobs.length === 0 ? (
        <p className="hint" data-testid="jo-fit-queue-empty">
          Score a posting in Company Fit (Core, Proof, Human access). Jobs at 6+ show up here.
        </p>
      ) : (
        <ul className="jo-fit-list">
          {jobs.map((job) => {
            const title = [job.company, job.role].filter(Boolean).join(" · ");
            const band_slug =
              job.action === "full"
                ? "full-effort"
                : job.action === "note"
                  ? "apply-one-note"
                  : "skip";
            return (
              <li
                key={job.id}
                className="jo-fit-row"
                data-testid={`jo-fit-row-${job.id}`}
              >
                <div className="jo-fit-row-main">
                  <span className="jo-fit-row-title">{title}</span>
                  <span
                    className={`cf-effort-result cf-effort-action-${band_slug}`}
                    data-testid={`jo-fit-effort-${job.id}`}
                  >
                    {job.total}/10 · {job.action_label}
                  </span>
                </div>
                {job.url ? (
                  <a
                    className="jo-fit-url"
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid={`jo-fit-url-${job.id}`}
                  >
                    Careers page
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function JobOptimizerView({ progress, on_change, on_close }) {
  const sheet = progress?.worksheets?.["job-optimizer"] || {};
  const hours_raw = opt_field(progress, "hours_this_week", "");
  const hours_this_week = Number(hours_raw) || 0;
  const include_easy = Boolean(opt_field(progress, "include_easy_apply", false));
  const tried = tried_from_worksheet(sheet);
  const channel_done = channel_done_from_worksheet(sheet);
  const warm_exhausted = Boolean(channel_done.warm);
  const plan = allocate_week({
    hours_this_week,
    tried,
    channel_done: { warm: warm_exhausted },
    include_easy_apply: include_easy,
    prereqs_ok: true,
  });
  const active_rows = plan.active_rows || plan.rows.filter((r) => !r.exhausted);
  const done_rows = plan.done_rows || plan.rows.filter((r) => r.exhausted);
  const top_recommend_id =
    active_rows.find((r) => r.planned_more > 0)?.id || active_rows[0]?.id || null;

  function set_hours(value) {
    on_change(set_worksheet_text(progress, "job-optimizer", "hours_this_week", value));
  }

  function set_tried(strategy_id, value) {
    on_change(
      set_worksheet_text(progress, "job-optimizer", tried_field_key(strategy_id), value),
    );
  }

  function set_warm_exhausted(checked) {
    on_change(
      toggle_worksheet_check(progress, "job-optimizer", done_field_key("warm"), checked),
    );
  }

  function set_easy(checked) {
    on_change(
      toggle_worksheet_check(progress, "job-optimizer", "include_easy_apply", checked),
    );
  }

  return (
    <section className="worksheet-panel jo-dashboard" data-testid="job-optimizer">
      <div className="worksheet-panel-head jo-dash-head">
        <div>
          <p className="eyebrow">Private worksheet · saved to your login</p>
          <h2>
            <TipText text="Weekly Application Dashboard" />
          </h2>
          <p className="sub">
            <TipText text="Enter hours, log attempts. Finished strategies move to the bottom. Expand a row for how-to. Jobs you scored 6+ in Company Fit appear under Apply these first." />
          </p>
        </div>
        <button type="button" className="ghost" onClick={on_close}>
          ← Back to progress
        </button>
      </div>

      <div className="jo-week-bar" data-testid="jo-week-bar">
        <label className="ws-field jo-hours-field">
          <span>
            <TipText text="Hours this week" />
          </span>
          <input
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            data-testid="jo-hours"
            value={hours_raw}
            placeholder="e.g. 8"
            onChange={(e) => set_hours(e.target.value)}
          />
        </label>
        <label className="ws-check jo-warm-exhausted" data-testid="jo-warm-exhausted">
          <input
            type="checkbox"
            checked={warm_exhausted}
            aria-label="Warm lead / referral exhausted"
            onChange={(e) => set_warm_exhausted(e.target.checked)}
          />
          <span>
            <TipText text="Warm lead / referral exhausted" />
          </span>
        </label>
        <label className="ws-check jo-easy-opt" data-testid="jo-easy-opt">
          <input
            type="checkbox"
            checked={include_easy}
            onChange={(e) => set_easy(e.target.checked)}
          />
          <span>
            <TipText text="Include mass Easy Apply" />
          </span>
        </label>
      </div>

      <div className="ws-section jo-section jo-plan-section" data-testid="jo-plan">
        <FitApplyQueue progress={progress} />
        {plan.reason === "no_time" || hours_this_week <= 0 ? (
          <p className="hint">Enter hours above to see your plan.</p>
        ) : (
          <>
            <p className="jo-budget" data-testid="jo-budget">
              {format_hours(plan.spent_min)} used of {format_hours(plan.budget_min)}
              {" · "}
              {format_hours(Math.max(0, plan.budget_min - plan.spent_min))} left
              {plan.leftover_min > 0
                ? ` · ${format_minutes(plan.leftover_min)} unallocated`
                : ""}
            </p>

            {active_rows.length > 0 ? (
              <div data-testid="jo-active">
                <StrategyTable
                  rows={active_rows}
                  top_recommend_id={top_recommend_id}
                  set_tried={set_tried}
                  section="active"
                />
              </div>
            ) : (
              <p className="hint" data-testid="jo-active-empty">
                All listed strategies are done for this week.
              </p>
            )}

            {done_rows.length > 0 ? (
              <div className="jo-done-section" data-testid="jo-done-section">
                <h3>Done this week</h3>
                <StrategyTable
                  rows={done_rows}
                  top_recommend_id={null}
                  set_tried={set_tried}
                  section="done"
                />
              </div>
            ) : null}

            {plan.leftover_min > 0 ? (
              <p className="hint" data-testid="jo-leftover">
                Leftover: {format_minutes(plan.leftover_min)} (too little for another
                full attempt, or higher ranks are at capacity).
              </p>
            ) : null}
            {!include_easy ? (
              <p className="hint jo-hint-compact">
                Mass Easy Apply is omitted unless you opt in above.
              </p>
            ) : null}
          </>
        )}
      </div>

      <p className="hint jo-hint-compact">
        <TipText text="Saves to your login." />
      </p>
      <button type="button" className="primary" onClick={on_close}>
        Done: back to progress
      </button>
    </section>
  );
}
