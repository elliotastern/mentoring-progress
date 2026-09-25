import { TipText } from "./Tip.jsx";
import { build_mentee_overview } from "../lib/menteeOverview.js";

function StatusDot({ status }) {
  const ok = status === "pass";
  return (
    <span className={`mentee-ov-dot ${ok ? "ok" : "bad"}`} aria-hidden="true">
      {ok ? "✓" : "—"}
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className="mentee-ov-row">
      <span className="mentee-ov-label">
        <TipText text={label} />
      </span>
      <span className="mentee-ov-value">{value}</span>
    </div>
  );
}

/** Toggle button only — lives in the Modules header. */
export function MenteeOverviewButton({ open, on_toggle }) {
  return (
    <button
      type="button"
      className={`ghost mentee-ov-btn ${open ? "open" : ""}`}
      aria-expanded={open}
      data-testid="mentee-overview-btn"
      onClick={on_toggle}
    >
      {open ? "Back to Modules" : "Overview"}
    </button>
  );
}

/** Full-view mentee snapshot — replaces the modules list when open. */
export function MenteeOverviewView({ progress, on_close }) {
  const ov = build_mentee_overview(progress);
  const best =
    ov.skills.best.length > 0
      ? ov.skills.best.map((s) => `${s.label} (${s.value})`).join(", ")
      : "None marked Solid/Strong yet";

  return (
    <section className="mentee-ov-full" data-testid="mentee-overview-panel">
      <div className="mentee-ov-full-head">
        <div>
          <p className="eyebrow">
            <TipText text="Mentee snapshot" />
          </p>
          <h2>
            <TipText text="Overview" />
          </h2>
        </div>
        <button type="button" className="ghost" onClick={on_close}>
          ← Back to Modules
        </button>
      </div>

      <div className="mentee-ov-grid">
        <section className="mentee-ov-section">
          <h3>
            <TipText text="Job target" />
          </h3>
          <Row label="Role" value={ov.job_target.tracks || "—"} />
          <Row label="Primary title" value={ov.job_target.title} />
          <Row label="Path" value={ov.job_target.path} />
          <Row label="Years" value={ov.job_target.years} />
          <Row label="Hours/week" value={ov.job_target.hours_week} />
          <Row label="Want a job by" value={ov.job_target.job_by} />
        </section>

        <section className="mentee-ov-section">
          <h3>
            <TipText text="Skills" />
          </h3>
          <Row label="Best skills" value={best} />
          <Row
            label="Self-test"
            value={ov.skills.all.map((s) => `${s.label} ${s.value}`).join(" · ")}
          />
          <Row label="Job Search level" value={ov.skills.level} />
          <Row label="Skill focus" value={ov.skills.focus} />
        </section>

        <section className="mentee-ov-section">
          <h3>
            <TipText text="Portfolio" />
          </h3>
          <ul className="mentee-ov-checks">
            {ov.portfolio.map((row) => (
              <li key={row.id}>
                <StatusDot status={row.status} />
                <span>{row.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mentee-ov-section">
          <h3>
            <TipText text="Modules" />
          </h3>
          <ul className="mentee-ov-checks">
            {ov.modules.map((row) => (
              <li key={row.id}>
                <StatusDot status={row.status} />
                <span>
                  {row.label}
                  {row.note ? ` · ${row.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mentee-ov-section mentee-ov-span">
          <h3>
            <TipText text="Job Search" />
          </h3>
          <Row label="Current stage" value={ov.search.stage_title} />
        </section>
      </div>

      <button type="button" className="primary" onClick={on_close}>
        Done — back to Modules
      </button>
    </section>
  );
}
