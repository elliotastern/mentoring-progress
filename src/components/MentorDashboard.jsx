import { STAGES } from "../data/stages.js";

export function MentorDashboard({ rows, on_refresh }) {
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
              <th>Mentee</th>
              <th>Username</th>
              <th>Stage</th>
              <th>Updated</th>
              <th>Title answer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.uid}>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
