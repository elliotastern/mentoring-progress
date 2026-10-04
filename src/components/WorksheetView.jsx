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
import { JobOptimizerView } from "./JobOptimizerView.jsx";
import { CompanyFitView } from "./CompanyFitView.jsx";
import { PortfolioFinalSubmit } from "./PortfolioFinalSubmit.jsx";
import { portfolio_package_complete } from "../lib/portfolioFinal.js";

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

function ws_id_from_href(href) {
  if (!href) return null;
  const raw = String(href);
  if (raw.startsWith("?ws=")) return decodeURIComponent(raw.slice(4).split("&")[0] || "");
  try {
    const u = new URL(raw, "https://example.local/");
    return u.searchParams.get("ws");
  } catch {
    return null;
  }
}

function FieldInput({ field, value, on_change, check_id, on_open }) {
  if (field.type === "checkbox") {
    const link_href = field.href || field.doc?.href;
    const ws_id = ws_id_from_href(field.href);
    const use_in_app = Boolean(on_open && ws_id);
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
            target={use_in_app ? undefined : "_blank"}
            rel={use_in_app ? undefined : "noreferrer"}
            onClick={(e) => {
              e.stopPropagation();
              if (!use_in_app) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
              e.preventDefault();
              on_open(ws_id);
            }}
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
export function WorksheetFields({ worksheet_id, progress, on_change, className = "", on_open }) {
  const sheet = resolve_sheet(worksheet_id, progress);
  if (!sheet) return null;

  const answers = progress.worksheets?.[sheet.id] || {};

  function set_field(field, value) {
    if (
      sheet.id === "search-ready" &&
      field.id === "portfolio_optimized" &&
      value === true &&
      !portfolio_package_complete(progress)
    ) {
      return;
    }
    const synced = apply_field(progress, sheet.id, field, value);
    on_change({
      checks: synced.checks,
      worksheets: synced.worksheets,
      answers: synced.answers,
    });
  }

  const show_portfolio_submit =
    sheet.id === "module-exit-3" || sheet.id === "search-ready";

  return (
    <div className={`ws-inline ${className}`.trim()} data-testid={`ws-inline-${sheet.id}`}>
      {sheet.sections.map((section) => {
        const is_portfolio_section =
          show_portfolio_submit &&
          (section.title === "Portfolio final" ||
            section.title.startsWith("3) Portfolio"));
        return (
          <div key={section.title} className="ws-section">
            <h3>
              <TipText text={section.title} />
            </h3>
            {section.note ? (
              <p className="hint ws-section-note">
                <TipText text={section.note} />
              </p>
            ) : null}
            {is_portfolio_section ? (
              <PortfolioFinalSubmit progress={progress} on_change={on_change} />
            ) : null}
            <div className="ws-fields">
              {section.fields.map((field) => (
                <FieldInput
                  key={field.id}
                  field={field}
                  check_id={SYNC_MAP[sheet.id]?.[field.id]}
                  value={answers[field.id]}
                  on_change={(val) => set_field(field, val)}
                  on_open={on_open}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartEGuide() {
  const base = import.meta.env.BASE_URL || "/";
  const img = `${base}docs/assets/job-search-v8/chart-e.png`;
  return (
    <div className="ws-chart-e-guide" data-testid="chart-e-guide">
      <h3 className="ws-chart-e-guide-title">
        <TipText text="Picture - effort ladder" />
      </h3>
      <img
        className="ws-chart-e-img"
        src={img}
        alt="Job effort score ladder: skip, apply plus one note, or full effort"
      />
      <p className="hint">
        <TipText text="Before you apply, grade the job 0-10. Five scores (0, 1, or 2 each) add up. High = work hard. Low = usually skip." />
      </p>
      <ol className="ws-chart-e-steps">
        <li>
          <TipText text="Score Interest, Core fit, Proof, Human access, Logistics (each 0-2)" />
        </li>
        <li>
          <TipText text="Add them up (Total / 10)" />
        </li>
        <li>
          <TipText text="8-10 full effort · 6-7 apply + one note · 0-5 usually skip" />
        </li>
        <li>
          <TipText text="Apply when you meet core duties and true must-haves" />
        </li>
      </ol>
    </div>
  );
}

export function WorksheetView({ worksheet_id, progress, on_change, on_close, on_open }) {
  if (worksheet_id === "job-optimizer") {
    return (
      <JobOptimizerView
        progress={progress}
        on_change={on_change}
        on_close={on_close}
      />
    );
  }

  if (worksheet_id === "company-fit" || worksheet_id === "chart-e") {
    return (
      <CompanyFitView
        progress={progress}
        on_change={on_change}
        on_close={on_close}
      />
    );
  }

  if (worksheet_id === "search-ready") {
    return (
      <section className="worksheet-panel" data-testid="ws-search-ready-redirect">
        <div className="worksheet-panel-head">
          <div>
            <p className="eyebrow">Moved</p>
            <h2>
              <TipText text="Job Search Ready moved to Module 4" />
            </h2>
            <p className="sub">
              <TipText text="Role, company list, and portfolio now live under Module 4 Setup 1: Pre Requirements. Company names write in Company Fit." />
            </p>
          </div>
          <button type="button" className="ghost" onClick={on_close}>
            ← Back to progress
          </button>
        </div>
        <p className="worksheet-banner">
          <a
            className="linkish"
            href="?ws=company-fit"
            onClick={(e) => {
              if (!on_open) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
              e.preventDefault();
              on_open("company-fit");
            }}
          >
            <TipText text="Open Company Fit" />
          </a>
          {" · "}
          <a
            className="linkish"
            href="?ws=module-exit-3"
            onClick={(e) => {
              if (!on_open) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
              e.preventDefault();
              on_open("module-exit-3");
            }}
          >
            <TipText text="Open Portfolio final" />
          </a>
        </p>
        <button type="button" className="primary" onClick={on_close}>
          Back to Module 4
        </button>
      </section>
    );
  }

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
  const is_chart_e = sheet.id === "chart-e";

  return (
    <section className="worksheet-panel" data-testid={is_chart_e ? "ws-chart-e" : undefined}>
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

      {is_chart_e ? <ChartEGuide /> : null}

      <WorksheetFields
        worksheet_id={worksheet_id}
        progress={progress}
        on_change={on_change}
        on_open={on_open}
      />

      <p className="hint">
        {is_module_exit ? (
          <TipText text="Saves to your login. This worksheet is the Module — checks and fill-ins unlock the next step." />
        ) : (
          <TipText text="Saves to your login. Checks also update on the main progress page." />
        )}
      </p>
      <button type="button" className="primary" onClick={on_close}>
        Done: back to progress
      </button>
    </section>
  );
}
