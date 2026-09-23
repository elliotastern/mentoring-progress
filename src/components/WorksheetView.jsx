import {
  worksheet_by_id,
  sheet_fillin_stats,
} from "../data/worksheets.js";
import {
  toggle_worksheet_check,
  set_worksheet_text,
  sheet_module_stats,
} from "../lib/checkSync.js";
import { ProgressPulse } from "./ProgressPulse.jsx";
import { proof_label_for_track } from "../lib/roleFit.js";

function doc_url(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${href.replace(/^\//, "")}`;
}

function FieldInput({ field, value, on_change }) {
  if (field.type === "checkbox") {
    const link_href = field.href || field.doc?.href;
    return (
      <label className="ws-check">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => on_change(e.target.checked)}
        />
        {link_href ? (
          <a
            className="doc-link"
            href={doc_url(link_href)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {field.label}
          </a>
        ) : (
          <span>{field.label}</span>
        )}
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="ws-field">
        <span>{field.label}</span>
        <textarea
          rows={4}
          value={value || ""}
          placeholder={field.placeholder || "Fill in…"}
          onChange={(e) => on_change(e.target.value)}
        />
      </label>
    );
  }
  return (
    <label className="ws-field">
      <span>{field.label}</span>
      <input
        type="text"
        value={value || ""}
        placeholder={field.placeholder || "Fill in…"}
        onChange={(e) => on_change(e.target.value)}
      />
    </label>
  );
}

function patch_module_exit_2(sheet, track_id) {
  const proof = proof_label_for_track(track_id);
  return {
    ...sheet,
    blurb: `End-of-module checklist — build a ${proof}. Skip with reason if on Search-ready path.`,
    sections: sheet.sections.map((section) => ({
      ...section,
      fields: section.fields.map((field) => {
        if (field.id === "why") {
          return { ...field, label: `Why build a ${proof}` };
        }
        if (field.id === "project_name") {
          return { ...field, label: `${proof} name (or N/A)` };
        }
        return field;
      }),
    })),
  };
}

export function WorksheetView({ worksheet_id, progress, on_change, on_close }) {
  let sheet = worksheet_by_id(worksheet_id);
  if (!sheet) {
    return (
      <section className="worksheet-panel">
        <p className="error">Worksheet not found.</p>
        <button type="button" onClick={on_close}>
          Back
        </button>
      </section>
    );
  }

  if (sheet.id === "module-exit-2") {
    sheet = patch_module_exit_2(sheet, progress.answers?.role_track || "");
  }

  const answers = progress.worksheets?.[sheet.id] || {};
  const stats = sheet_module_stats(progress, sheet.id);
  const fill = sheet_fillin_stats(progress, sheet.id);
  const pct = stats.total ? Math.round((100 * stats.done) / stats.total) : 0;
  const is_module_exit = sheet.id.startsWith("module-exit-");

  function set_field(field, value) {
    if (field.type === "checkbox") {
      const synced = toggle_worksheet_check(progress, sheet.id, field.id, value);
      on_change({
        checks: synced.checks,
        worksheets: synced.worksheets,
        answers: synced.answers,
      });
      return;
    }
    const synced = set_worksheet_text(progress, sheet.id, field.id, value);
    on_change({
      checks: synced.checks,
      worksheets: synced.worksheets,
      answers: synced.answers,
    });
  }

  return (
    <section className="worksheet-panel">
      <div className="worksheet-panel-head">
        <div>
          <p className="eyebrow">
            {is_module_exit
              ? "Module worksheet · saved to your login"
              : "Private worksheet · saved to your login"}
          </p>
          <h2>{sheet.title}</h2>
          <p className="sub">{sheet.blurb}</p>
          {stats.total > 0 ? (
            <ProgressPulse
              compact
              percent={pct}
              label={
                fill.total > 0
                  ? `${stats.done}/${stats.total} · checks ${stats.sync.done}/${stats.sync.total} · fill-ins ${fill.done}/${fill.total}`
                  : `Synced checks ${stats.sync.done}/${stats.sync.total}`
              }
            />
          ) : null}
        </div>
        <button type="button" className="ghost" onClick={on_close}>
          ← Back to progress
        </button>
      </div>

      {sheet.sections.map((section) => (
        <div key={section.title} className="ws-section">
          <h3>{section.title}</h3>
          <div className="ws-fields">
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={answers[field.id]}
                on_change={(val) => set_field(field, val)}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="hint">
        {is_module_exit
          ? "Autosaves to your account. This worksheet is the module — checks and fill-ins count toward unlock."
          : "Autosaves to your account. Checks sync with the main progress page."}
      </p>
      <button type="button" className="primary" onClick={on_close}>
        Done — back to progress
      </button>
    </section>
  );
}
