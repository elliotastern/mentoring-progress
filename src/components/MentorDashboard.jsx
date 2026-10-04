import { useState, Fragment } from "react";
import { STAGES } from "../data/stages.js";
import {
  exit_fillin_fields,
  module_exit_sheet_ids,
  worksheet_by_id,
} from "../data/worksheets.js";
import { motivation_pulse } from "../lib/motivationPulse.js";
import {
  PORTFOLIO_PIECES,
  format_submit_date,
  portfolio_final_from_sheet,
  portfolio_package_complete,
} from "../lib/portfolioFinal.js";

function PulseRow({ label, value }) {
  const text = String(value || "").trim();
  return (
    <div className="mentor-field">
      <dt>{label}</dt>
      <dd className={text ? "" : "empty"}>{text || "-"}</dd>
    </div>
  );
}

function MotivationPulse({ worksheets }) {
  const pulse = motivation_pulse({ worksheets });
  return (
    <div className="mentor-sheet mentor-pulse" data-testid="mentor-motivation-pulse">
      <h4>Motivation pulse</h4>
      <dl>
        <PulseRow label="Importance (0-10)" value={pulse.importance} />
        <PulseRow label="Confidence (0-10)" value={pulse.confidence} />
        <PulseRow label="Last commitment" value={pulse.commitment} />
        <PulseRow label="Path / week value" value={pulse.path_value} />
        <PulseRow label="Fuel reason" value={pulse.fuel_reason} />
        <PulseRow label="Next ≤30m action" value={pulse.fuel_next} />
        <PulseRow
          label="Fuel after miss"
          value={pulse.fuel_filled_after_miss ? "Yes (balance / willing filled)" : ""}
        />
      </dl>
    </div>
  );
}

function PortfolioFinalMentor({ worksheets }) {
  const sheet = worksheets?.["module-exit-3"] || {};
  const pf = portfolio_final_from_sheet(sheet);
  const complete = portfolio_package_complete({ worksheets });
  return (
    <div className="mentor-sheet" data-testid="mentor-portfolio-final">
      <h4>Portfolio final</h4>
      <p className="hint">
        {complete
          ? `Package submitted: ${format_submit_date(pf.package_submitted_at) || "yes"}`
          : "Package not submitted yet"}
      </p>
      <dl>
        {PORTFOLIO_PIECES.map((piece) => {
          const row = pf[piece.id] || {};
          const url = String(row.url || "").trim();
          const when = format_submit_date(row.submitted_at);
          const note = String(row.note || "").trim();
          return (
            <div key={piece.id} className="mentor-field">
              <dt>{piece.label}</dt>
              <dd className={url || when ? "" : "empty"}>
                {when ? <div>Submitted: {when}</div> : <div>Not submitted</div>}
                {url ? (
                  <div>
                    <a href={url} target="_blank" rel="noreferrer">
                      {url}
                    </a>
                  </div>
                ) : (
                  "-"
                )}
                {note ? <div className="hint">{note}</div> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function MenteeExitFillins({ worksheets }) {
  const sheets = module_exit_sheet_ids();
  return (
    <div className="mentor-fillins">
      <MotivationPulse worksheets={worksheets} />
      <PortfolioFinalMentor worksheets={worksheets} />
      {sheets.map((sheet_id) => {
        const meta = worksheet_by_id(sheet_id);
        const answers = worksheets?.[sheet_id] || {};
        const fields = exit_fillin_fields(sheet_id);
        return (
          <div key={sheet_id} className="mentor-sheet">
            <h4>{meta?.title || sheet_id}</h4>
            {fields.length === 0 ? (
              <p className="hint">No fill-in fields.</p>
            ) : (
              <dl>
                {fields.map((field) => {
                  const raw = answers[field.id];
                  const value = String(raw || "").trim();
                  return (
                    <div key={field.id} className="mentor-field">
                      <dt>{field.label}</dt>
                      <dd className={value ? "" : "empty"}>{value || "-"}</dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MentorDashboard({ rows, on_refresh }) {
  const [expanded, set_expanded] = useState(null);

  function toggle_row(uid) {
    set_expanded((cur) => (cur === uid ? null : uid));
  }

  return (
    <div className="mentor">
      <header className="app-header">
        <div>
          <p className="eyebrow">Mentor view</p>
          <h1>Mentee progress</h1>
          <p className="sub">{rows.length} mentee{rows.length === 1 ? "" : "s"}</p>
        </div>
        <button type="button" onClick={on_refresh}>
          Refresh
        </button>
      </header>
      {rows.length === 0 ? (
        <p className="hint">No mentee progress saved yet. Ask them to sign in and save.</p>
      ) : (
        <table className="mentor-table">
          <thead>
            <tr>
              <th />
              <th>Mentee</th>
              <th>Username</th>
              <th>Stage</th>
              <th>I / C</th>
              <th>Updated</th>
              <th>Title answer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const open = expanded === row.uid;
              const pulse = motivation_pulse({ worksheets: row.worksheets || {} });
              const ic =
                pulse.importance || pulse.confidence
                  ? `${pulse.importance || "-"} / ${pulse.confidence || "-"}`
                  : "-";
              return (
                <Fragment key={row.uid}>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="ghost mentor-expand"
                        onClick={() => toggle_row(row.uid)}
                        aria-expanded={open}
                      >
                        {open ? "Hide" : "Fill-ins"}
                      </button>
                    </td>
                    <td>{row.displayName || "-"}</td>
                    <td>{row.username || row.email || "-"}</td>
                    <td>
                      <strong>{row.highest_unlocked || "0"}</strong>
                      <span className="stage-name">
                        {" "}
                        {STAGES.find((s) => s.id === (row.highest_unlocked || "0"))?.title || ""}
                      </span>
                    </td>
                    <td title={pulse.commitment || "Importance / Confidence"}>
                      {ic}
                      {pulse.fuel_filled_after_miss ? (
                        <span className="badge">Fuel</span>
                      ) : null}
                    </td>
                    <td>{row.updated_at ? String(row.updated_at).slice(0, 19) : "-"}</td>
                    <td>{row.answers?.title || "-"}</td>
                  </tr>
                  {open ? (
                    <tr className="mentor-detail-row">
                      <td colSpan={7}>
                        <MenteeExitFillins worksheets={row.worksheets || {}} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
