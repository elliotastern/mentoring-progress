import { useState, Fragment } from "react";
import { STAGES } from "../data/stages.js";
import {
  exit_fillin_fields,
  module_exit_sheet_ids,
  worksheet_by_id,
} from "../data/worksheets.js";

function MenteeExitFillins({ worksheets }) {
  const sheets = module_exit_sheet_ids();
  return (
    <div className="mentor-fillins">
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
                      <dd className={value ? "" : "empty"}>{value || "—"}</dd>
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
              <th>Updated</th>
              <th>Title answer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const open = expanded === row.uid;
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
                    <td>{row.displayName || "—"}</td>
                    <td>{row.username || row.email || "—"}</td>
                    <td>
                      <strong>{row.highest_unlocked || "0"}</strong>
                      <span className="stage-name">
                        {" "}
                        {STAGES.find((s) => s.id === (row.highest_unlocked || "0"))?.title || ""}
                      </span>
                    </td>
                    <td>{row.updated_at ? String(row.updated_at).slice(0, 19) : "—"}</td>
                    <td>{row.answers?.title || "—"}</td>
                  </tr>
                  {open ? (
                    <tr className="mentor-detail-row">
                      <td colSpan={6}>
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
