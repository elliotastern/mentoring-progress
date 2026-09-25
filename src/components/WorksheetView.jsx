import {
  worksheet_by_id,
  sheet_fillin_stats,
} from "../data/worksheets.js";
import {
  toggle_worksheet_check,
  set_worksheet_text,
  sheet_module_stats,
  SYNC_MAP,
} from "../lib/checkSync.js";
import { ProgressPulse } from "./ProgressPulse.jsx";
import { proof_label_for_track } from "../lib/roleFit.js";
import { TipText } from "./Tip.jsx";

function doc_url(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${href.replace(/^\//, "")}`;
}

function FieldLabel({ text }) {
  return (
    <span>
      <TipText text={text} />
    </span>
  );
}

function FieldInput({ field, value, on_change, check_id }) {
  if (field.type === "checkbox") {
    const link_href = field.href || field.doc?.href;
    return (
      <label className="ws-check" data-check-id={check_id || undefined}>
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
            <FieldLabel text={field.label} />
          </a>
        ) : (
          <FieldLabel text={field.label} />
        )}
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="ws-field">
        <FieldLabel text={field.label} />
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
      <FieldLabel text={field.label} />
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
    blurb: `Finish this Module checklist — build a ${proof}. On Search-ready you can skip with a reason.`,
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

function resolve_sheet(worksheet_id, progress) {
  let sheet = worksheet_by_id(worksheet_id);
  if (!sheet) return null;
  if (sheet.id === "module-exit-2") {
    sheet = patch_module_exit_2(sheet, progress.answers?.role_track || "");
  }
  return sheet;
}

function apply_field(progress, sheet_id, field, value) {
  if (field.type === "checkbox") {
    return toggle_worksheet_check(progress, sheet_id, field.id, value);
  }
  return set_worksheet_text(progress, sheet_id, field.id, value);
}

/** All sections/fields for a worksheet — used inline on module cards and full-page view. */
export function WorksheetFields({ worksheet_id, progress, on_change, className = "" }) {
  const sheet = resolve_sheet(worksheet_id, progress);
  if (!sheet) return null;

  const answers = progress.worksheets?.[sheet.id] || {};

  function set_field(field, value) {
    const synced = apply_field(progress, sheet.id, field, value);
    on_change({
      checks: synced.checks,
      worksheets: synced.worksheets,
      answers: synced.answers,
    });
  }

  return (
    <div className={`ws-inline ${className}`.trim()} data-testid={`ws-inline-${sheet.id}`}>
      {sheet.sections.map((section) => (
        <div key={section.title} className="ws-section">
          <h3>
            <TipText text={section.title} />
          </h3>
          {section.note ? (
            <p className="hint ws-section-note">
              <TipText text={section.note} />
            </p>
          ) : null}
          <div className="ws-fields">
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                check_id={SYNC_MAP[sheet.id]?.[field.id]}
                value={answers[field.id]}
                on_change={(val) => set_field(field, val)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorksheetView({ worksheet_id, progress, on_change, on_close }) {
  const sheet = resolve_sheet(worksheet_id, progress);
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

  const stats = sheet_module_stats(progress, sheet.id);
  const fill = sheet_fillin_stats(progress, sheet.id);
  const pct = stats.total ? Math.round((100 * stats.done) / stats.total) : 0;
  const is_module_exit = sheet.id.startsWith("module-exit-");

  return (
    <section className="worksheet-panel">
      <div className="worksheet-panel-head">
        <div>
          <p className="eyebrow">
            {is_module_exit
              ? "Module worksheet · saved to your login"
              : "Private worksheet · saved to your login"}
          </p>
          <h2>
            <TipText text={sheet.title} />
          </h2>
          <p className="sub">
            <TipText text={sheet.blurb} />
          </p>
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

      <WorksheetFields
        worksheet_id={worksheet_id}
        progress={progress}
        on_change={on_change}
      />

      <p className="hint">
        {is_module_exit ? (
          <TipText text="Saves to your login. This worksheet is the Module — checks and fill-ins unlock the next step." />
        ) : (
          <TipText text="Saves to your login. Checks also update on the main progress page." />
        )}
      </p>
      <button type="button" className="primary" onClick={on_close}>
        Done — back to progress
      </button>
    </section>
  );
}
