import { worksheet_by_id } from "../data/worksheets.js";

function FieldInput({ field, value, on_change }) {
  if (field.type === "checkbox") {
    return (
      <label className="ws-check">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => on_change(e.target.checked)}
        />
        <span>{field.label}</span>
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

export function WorksheetView({ worksheet_id, progress, on_change, on_close }) {
  const sheet = worksheet_by_id(worksheet_id);
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

  const answers = progress.worksheets?.[sheet.id] || {};

  function set_field(field_id, value) {
    on_change({
      worksheets: {
        ...(progress.worksheets || {}),
        [sheet.id]: { ...answers, [field_id]: value },
      },
    });
  }

  return (
    <section className="worksheet-panel">
      <div className="worksheet-panel-head">
        <div>
          <p className="eyebrow">Private worksheet · saved to your login</p>
          <h2>{sheet.title}</h2>
          <p className="sub">{sheet.blurb}</p>
        </div>
        <button type="button" className="ghost" onClick={on_close}>
          ← Back to checklist
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
                on_change={(val) => set_field(field.id, val)}
              />
            ))}
          </div>
        </div>
      ))}

      <p className="hint">Autosaves to your account. Only you see these answers when signed in.</p>
      <button type="button" className="primary" onClick={on_close}>
        Done — back to checklist
      </button>
    </section>
  );
}
