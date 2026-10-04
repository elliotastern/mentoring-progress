import { useState } from "react";
import {
  SCORE_MAX,
  SCORE_MIN,
  TIER_IDS,
  TIER_LABELS,
  WEIGHT_MAX,
  WEIGHT_MIN,
  assign_auto_tiers,
  can_seed_from_brainstorm,
  company_fit_from_progress,
  company_names_from_brainstorm,
  effective_tier,
  effort_action_label,
  effort_incomplete_label,
  empty_effort,
  empty_fit_row,
  fit_score,
  format_effort_breakdown,
  format_fit_score,
  job_effort_score,
  logistics_auto_label,
  new_fit_id,
  parse_fit_override,
  rank_summary,
  seed_rows_from_names,
  sorted_rows,
  with_company_fit,
} from "../lib/companyFit.js";
import { TipText, Tip } from "./Tip.jsx";

const CORE_OPTIONS = [
  { value: "", label: "Pick" },
  { value: "0", label: "0 Major gaps" },
  { value: "1", label: "1 Mostly qualified" },
  { value: "2", label: "2 Direct match" },
];

const PROOF_OPTIONS = [
  { value: "", label: "Pick" },
  { value: "0", label: "0 Weak" },
  { value: "1", label: "1 Related" },
  { value: "2", label: "2 Strong quantified" },
];

const ACCESS_OPTIONS = [
  { value: "", label: "Pick" },
  { value: "0", label: "0 No contact" },
  { value: "1", label: "1 Possible" },
  { value: "2", label: "2 Warm / referral" },
];

function logistics_options(row, traits) {
  return [
    { value: "", label: logistics_auto_label(row, traits) },
    { value: "0", label: "0 Conflict" },
    { value: "1", label: "1 Workable" },
    { value: "2", label: "2 Fit" },
  ];
}

const INTEREST_OPTIONS = [
  { value: "", label: "Pick" },
  { value: "high", label: "high (2)" },
  { value: "med", label: "medium (1)" },
  { value: "low", label: "low (0)" },
];

function doc_url(href) {
  if (!href) return "";
  if (/^https?:\/\//i.test(href)) return href;
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${href.replace(/^\//, "")}`;
}

function save_fit(progress, on_change, sheet, resort = true) {
  const next = with_company_fit(progress, sheet, resort);
  on_change({
    worksheets: next.worksheets,
    checks: next.checks,
    answers: next.answers,
  });
}

function trait_header(label) {
  return label;
}

function tier_select_value(row) {
  const mode = row.tier_mode || "auto";
  return mode === "auto" ? "auto" : mode;
}

function interest_select_value(raw) {
  const text = String(raw || "")
    .trim()
    .toLowerCase();
  if (!text) return "";
  if (text === "high" || text.startsWith("high")) return "high";
  if (text === "med" || text === "medium" || text.startsWith("med")) return "med";
  if (text === "low" || text.startsWith("low")) return "low";
  return "";
}

function effort_select_value(raw) {
  if (raw === "" || raw === null || raw === undefined) return "";
  return String(raw);
}

function EffortSelect({ value, options, aria_label, test_id, on_change }) {
  return (
    <select
      className="cf-effort-select"
      value={effort_select_value(value)}
      aria-label={aria_label}
      data-testid={test_id}
      onChange={(e) => on_change(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt.value || "blank"} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function FieldInfoLabel({ term, label }) {
  return (
    <span className="cf-job-field-head">
      <Tip term={term}>
        <span className="cf-info-i" aria-label={`About ${label}`}>
          i
        </span>
      </Tip>
      <span className="cf-job-field-name">{label}</span>
    </span>
  );
}

function ResearchDirections() {
  const base = import.meta.env.BASE_URL || "/";
  const google_img = `${base}docs/assets/target-companies/glassdoor-google-ratings.png`;
  const tesla_img = `${base}docs/assets/target-companies/glassdoor-tesla-ratings.png`;
  return (
    <details className="cf-fold cf-research" data-testid="company-fit-research">
      <summary className="cf-fold-summary">
        <span className="cf-fold-title">
          <TipText text="How to research a company" />
        </span>
        <span className="cf-fold-hint">Open for step-by-step directions</span>
      </summary>
      <div className="cf-fold-body">
        <p className="hint">
          <TipText text="Glassdoor (or Levels.fyi / Blind / company careers pages) helps you answer: Would I accept this company if they offered? Not just “is the title right?”" />
        </p>
        <ol className="cf-research-steps">
          <li>
            <TipText text="Search the company name" />
          </li>
          <li>
            <TipText text="Open the Reviews tab" />
          </li>
          <li>
            <TipText text="Click into the stars / ratings breakdown (not only the overall number)" />
          </li>
          <li>
            <TipText text="Skim recent reviews for role families close to yours (data, eng, analytics)" />
          </li>
          <li>
            <TipText text="Set Interest (high / medium / low), one green flag, and one red flag on the row" />
          </li>
          <li>
            <TipText text="When you have a posting: pick Core / Proof / Access from the dropdowns, then read Effort" />
          </li>
        </ol>
        <p className="hint">
          <TipText text="Example (directional): Google work/life balance near ~4.2 vs Tesla near ~2.9. Use your priorities: work/life balance, culture, career growth, compensation, remote policy. Numbers move over time; re-check before you invest a full tailor." />
        </p>
        <div className="cf-research-images" data-testid="company-fit-research-images">
          <figure className="cf-research-figure">
            <img
              className="cf-research-img"
              src={google_img}
              alt="Glassdoor: Google ratings (Work/Life Balance about 4.2)"
            />
            <figcaption>Google ratings example (Work/Life Balance about 4.2)</figcaption>
          </figure>
          <figure className="cf-research-figure">
            <img
              className="cf-research-img"
              src={tesla_img}
              alt="Glassdoor: Tesla ratings (Work/Life Balance about 2.9)"
            />
            <figcaption>Tesla ratings example (Work/Life Balance about 2.9)</figcaption>
          </figure>
        </div>
        <p className="hint">
          <TipText text="If Glassdoor is behind a login wall, use the company careers page, LinkedIn employee posts, or a short warm ask: “What is it like on the data team?”" />
        </p>
        <p className="hint">
          <a
            className="doc-link"
            href={doc_url(
              "docs/view.html?doc=target-companies.md#glassdoor-research-interest-check",
            )}
          >
            Full Guide: Glassdoor research
          </a>
        </p>
      </div>
    </details>
  );
}

function EffortGuide() {
  const base = import.meta.env.BASE_URL || "/";
  const img = `${base}docs/assets/job-search-v8/chart-e.png`;
  return (
    <details className="cf-fold cf-effort-guide" data-testid="company-fit-effort-guide">
      <summary className="cf-fold-summary">
        <span className="cf-fold-title">
          <TipText text="Job effort score (when you have a posting)" />
        </span>
        <span className="cf-fold-hint">Open for step-by-step directions</span>
      </summary>
      <div className="cf-fold-body">
        <p className="hint">
          <TipText text="Fill the job form below (or the same columns on the sheet). Interest, Core, Proof, and Access add up. Logistics can stay Auto from Compensation / Remote traits. Effort shows Skip, Apply + one note, or Full effort." />
        </p>
        <div className="cf-effort-guide-body">
          <img
            className="cf-effort-img"
            src={img}
            alt="Job effort score ladder: skip, apply plus one note, or full effort"
          />
          <ol className="cf-effort-steps">
            <li>
              <TipText text="Enter company and role, then Interest, Core, Proof, and Access" />
            </li>
            <li>
              <TipText text="Total auto-fills: 8-10 Full effort · 6-7 Apply + one note · 0-5 Skip" />
            </li>
            <li>
              <TipText text="Continue only at 6+ unless you are practicing" />
            </li>
          </ol>
        </div>
      </div>
    </details>
  );
}

function JobEffortForm({
  row,
  traits,
  rows,
  active_id,
  on_select_row,
  on_new_row,
  on_field,
  on_effort,
}) {
  const effort = row?.effort || empty_effort();
  const total = row ? job_effort_score(row, traits) : null;
  const action = effort_action_label(total);
  const incomplete = row ? effort_incomplete_label(row) : "";
  const breakdown = row && total !== null ? format_effort_breakdown(row, traits) : "";
  const result =
    total !== null
      ? `${total}/10 · ${action}`
      : incomplete || "—";
  const action_slug =
    total !== null && action
      ? action
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "")
      : incomplete
        ? "incomplete"
        : "";
  const notes_open =
    Boolean(row?.url) || Boolean(row?.green_flag) || Boolean(row?.red_flag);

  return (
    <div className="cf-job-form" data-testid="company-fit-job-form">
      <div className="cf-job-form-toolbar">
        <label className="cf-job-form-pick">
          <span>Editing</span>
          <select
            value={active_id || ""}
            aria-label="Which job to edit"
            data-testid="company-fit-job-pick"
            onChange={(e) => on_select_row(e.target.value)}
          >
            {rows.map((r) => {
              const label =
                [r.company, r.role].filter(Boolean).join(" · ") || "Untitled job";
              return (
                <option key={r.id} value={r.id}>
                  {label}
                </option>
              );
            })}
          </select>
        </label>
        <button
          type="button"
          className="ghost"
          data-testid="company-fit-job-new"
          onClick={on_new_row}
        >
          New job
        </button>
      </div>
      <p className="hint">
        <TipText text="Fill this in. It updates the Companies sheet as you type." />
      </p>
      <div className="cf-job-form-grid">
        <label className="cf-job-field">
          <span>Company</span>
          <input
            type="text"
            value={row?.company || ""}
            placeholder="Company"
            aria-label="Company"
            data-testid="company-fit-job-company"
            onChange={(e) => on_field("company", e.target.value)}
          />
        </label>
        <label className="cf-job-field">
          <span>Role</span>
          <input
            type="text"
            value={row?.role || ""}
            placeholder="Role title"
            aria-label="Role"
            data-testid="company-fit-job-role"
            onChange={(e) => on_field("role", e.target.value)}
          />
        </label>
        <div className="cf-job-field">
          <FieldInfoLabel term="Interest" label="Interest" />
          <select
            value={interest_select_value(row?.interest)}
            aria-label="Interest"
            data-testid="company-fit-job-interest"
            onChange={(e) => on_field("interest", e.target.value)}
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt.value || "blank"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="cf-job-field">
          <FieldInfoLabel term="Core fit" label="Core fit" />
          <EffortSelect
            value={effort.core}
            options={CORE_OPTIONS}
            aria_label="Core fit 0-2"
            test_id="company-fit-job-core"
            on_change={(v) => on_effort("core", v)}
          />
        </div>
        <div className="cf-job-field">
          <FieldInfoLabel term="Proof" label="Proof" />
          <EffortSelect
            value={effort.proof}
            options={PROOF_OPTIONS}
            aria_label="Proof 0-2"
            test_id="company-fit-job-proof"
            on_change={(v) => on_effort("proof", v)}
          />
        </div>
        <div className="cf-job-field">
          <FieldInfoLabel term="Human access" label="Human access" />
          <EffortSelect
            value={effort.access}
            options={ACCESS_OPTIONS}
            aria_label="Human access 0-2"
            test_id="company-fit-job-access"
            on_change={(v) => on_effort("access", v)}
          />
        </div>
        <div className="cf-job-field">
          <FieldInfoLabel term="Logistics" label="Logistics" />
          <EffortSelect
            value={effort.logistics}
            options={logistics_options(row, traits)}
            aria_label="Logistics 0-2"
            test_id="company-fit-job-logistics"
            on_change={(v) => on_effort("logistics", v)}
          />
        </div>
      </div>
      <details
        className="cf-job-notes"
        data-testid="company-fit-job-notes"
        {...(notes_open ? { defaultOpen: true } : {})}
      >
        <summary>Add notes</summary>
        <div className="cf-job-form-grid cf-job-notes-grid">
          <label className="cf-job-field cf-job-field-wide">
            <span>Careers page URL</span>
            <input
              type="url"
              value={row?.url || ""}
              placeholder="https://"
              aria-label="Careers page URL"
              data-testid="company-fit-job-url"
              onChange={(e) => on_field("url", e.target.value)}
            />
          </label>
          <div className="cf-job-field">
            <FieldInfoLabel term="Green flag" label="Green flag" />
            <input
              type="text"
              value={row?.green_flag || ""}
              placeholder="One green flag"
              aria-label="Green flag"
              data-testid="company-fit-job-green"
              onChange={(e) => on_field("green_flag", e.target.value)}
            />
          </div>
          <div className="cf-job-field">
            <FieldInfoLabel term="Red flag" label="Red flag" />
            <input
              type="text"
              value={row?.red_flag || ""}
              placeholder="One red flag"
              aria-label="Red flag"
              data-testid="company-fit-job-red"
              onChange={(e) => on_field("red_flag", e.target.value)}
            />
          </div>
        </div>
      </details>
      <div className="cf-job-form-result">
        <span className="cf-job-form-result-label">Effort</span>
        <span
          className={`cf-effort-result ${action_slug ? `cf-effort-action-${action_slug}` : ""}`}
          data-testid="company-fit-job-effort-total"
        >
          {result}
        </span>
        {breakdown ? (
          <p className="cf-job-form-breakdown" data-testid="company-fit-job-effort-breakdown">
            {breakdown}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function CompanyFitView({ progress, on_change, on_close }) {
  const [draft_id] = useState(() => new_fit_id("r"));
  const [active_row_id, set_active_row_id] = useState(null);
  const sheet = company_fit_from_progress(progress);
  const traits = sheet.traits;
  const rows = sheet.rows.length
    ? sheet.rows
    : [{ ...empty_fit_row(), id: draft_id }];
  const show_seed = can_seed_from_brainstorm(progress, sheet);
  const auto_map = assign_auto_tiers(rows, traits);
  const display_rows = sorted_rows(rows, traits);
  const active_id = rows.some((r) => r.id === active_row_id)
    ? active_row_id
    : rows[0]?.id;
  const active_row = rows.find((r) => r.id === active_id) || rows[0];

  function commit(next_traits, next_rows, resort = true) {
    save_fit(progress, on_change, { traits: next_traits, rows: next_rows }, resort);
  }

  function set_trait_weight(trait_id, weight) {
    const next = traits.map((t) =>
      t.id === trait_id ? { ...t, weight: Number(weight) || t.weight } : t,
    );
    commit(next, rows, true);
  }

  function set_trait_label(trait_id, label) {
    const next = traits.map((t) => (t.id === trait_id ? { ...t, label } : t));
    commit(next, rows, false);
  }

  function add_trait() {
    commit(
      [...traits, { id: new_fit_id("t"), label: "New trait", weight: 3 }],
      rows,
      true,
    );
  }

  function remove_trait(trait_id) {
    if (traits.length <= 1) return;
    const next_traits = traits.filter((t) => t.id !== trait_id);
    const next_rows = rows.map((r) => {
      const scores = { ...r.scores };
      delete scores[trait_id];
      return { ...r, scores };
    });
    commit(next_traits, next_rows, true);
  }

  function set_row_field(row_id, field, value) {
    const next = rows.map((r) => (r.id === row_id ? { ...r, [field]: value } : r));
    const resort = field === "tier_mode" || field === "fit_override";
    commit(traits, next, resort);
  }

  function set_row_fit(row_id, value) {
    const next = rows.map((r) => {
      if (r.id !== row_id) return r;
      return { ...r, fit_override: parse_fit_override(value) };
    });
    commit(traits, next, true);
  }

  function set_row_score(row_id, trait_id, value) {
    const next = rows.map((r) => {
      if (r.id !== row_id) return r;
      const scores = { ...r.scores };
      if (value === "" || value === null || value === undefined) {
        delete scores[trait_id];
      } else {
        scores[trait_id] = Number(value);
      }
      return { ...r, scores };
    });
    commit(traits, next, true);
  }

  function set_effort_part(row_id, field, value) {
    const next = rows.map((r) => {
      if (r.id !== row_id) return r;
      const effort = { ...(r.effort || empty_effort()) };
      if (value === "" || value === null || value === undefined) {
        effort[field] = "";
      } else {
        effort[field] = Number(value);
      }
      return { ...r, effort };
    });
    commit(traits, next, false);
  }

  function add_row() {
    const next_row = empty_fit_row();
    commit(traits, [...rows, next_row], false);
    set_active_row_id(next_row.id);
  }

  function remove_row(row_id) {
    const next = rows.filter((r) => r.id !== row_id);
    const kept = next.length ? next : [empty_fit_row()];
    commit(traits, kept, true);
    set_active_row_id(kept[0]?.id || null);
  }

  function load_from_list() {
    const names = company_names_from_brainstorm(progress?.worksheets?.brainstorm);
    if (!names.length) return;
    const seeded = seed_rows_from_names(names);
    commit(traits, seeded, false);
    set_active_row_id(seeded[0]?.id || null);
  }

  function patch_active_field(field, value) {
    if (!active_id) return;
    set_row_field(active_id, field, value);
  }

  function patch_active_effort(field, value) {
    if (!active_id) return;
    set_effort_part(active_id, field, value);
  }

  const ranks = rank_summary(rows, traits);

  return (
    <section className="worksheet-panel" data-testid="company-fit">
      <div className="worksheet-panel-head">
        <div>
          <h2>
            <TipText text="Company Fit" />
          </h2>
          <div className="cf-blurb" data-testid="company-fit-blurb">
            <p className="sub">
              <TipText text="Aim: pick what matters, then score companies (Stretch, Stepping, or Sandbox)." />
            </p>
            <p className="sub">
              <TipText text="Apply: fill Core, Proof, and Access on a posting. Effort says Skip, Apply + one note, or Full effort." />
            </p>
          </div>
        </div>
        <button type="button" onClick={on_close} className="ghost">
          ← Back to progress
        </button>
      </div>

      <ResearchDirections />

      <div className="ws-section cf-section">
        <h3>What matters (weights 1-5)</h3>
        <p className="hint">
          <TipText text="Higher weight moves Fit and tiers more. Score each company 1-5 in the table." />
        </p>
        <div className="cf-traits" data-testid="company-fit-traits">
          {traits.map((trait) => (
            <div key={trait.id} className="cf-trait">
              <input
                className="cf-trait-label"
                value={trait.label}
                aria-label="Trait name"
                data-testid={`company-fit-trait-label-${trait.id}`}
                onChange={(e) => set_trait_label(trait.id, e.target.value)}
              />
              <label className="cf-trait-weight">
                <span>Weight</span>
                <input
                  type="number"
                  min={WEIGHT_MIN}
                  max={WEIGHT_MAX}
                  value={trait.weight}
                  data-testid={`company-fit-trait-weight-${trait.id}`}
                  onChange={(e) => set_trait_weight(trait.id, e.target.value)}
                />
              </label>
              <button
                type="button"
                className="ghost cf-remove"
                disabled={traits.length <= 1}
                data-testid={`company-fit-trait-remove-${trait.id}`}
                onClick={() => remove_trait(trait.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="ghost" data-testid="company-fit-add-trait" onClick={add_trait}>
          Add trait
        </button>

        <div className="cf-effort-highlight" data-testid="company-fit-effort-highlight">
          <div className="cf-effort-highlight-head">
            <p className="cf-effort-highlight-eyebrow">Apply step</p>
            <h4 className="cf-effort-highlight-title">
              <TipText text="Job effort score" />
            </h4>
            <p className="hint">
              <TipText text="Fit ranks the company. Job effort grades one posting (0-10). Fill the form below; it updates the sheet." />
            </p>
            <ul className="cf-effort-bands" aria-label="Job effort actions">
              <li className="cf-effort-action-skip">
                <strong>0-5</strong> Skip
              </li>
              <li className="cf-effort-action-apply-one-note">
                <strong>6-7</strong> Apply + one note
              </li>
              <li className="cf-effort-action-full-effort">
                <strong>8-10</strong> Full effort
              </li>
            </ul>
          </div>
          <EffortGuide />
          <JobEffortForm
            row={active_row}
            traits={traits}
            rows={rows}
            active_id={active_id}
            on_select_row={set_active_row_id}
            on_new_row={add_row}
            on_field={patch_active_field}
            on_effort={patch_active_effort}
          />
        </div>
      </div>

      <div className="ws-section cf-section">
        <div className="cf-rows-head">
          <h3>Companies</h3>
          <div className="cf-row-actions">
            {show_seed ? (
              <button
                type="button"
                className="ghost"
                data-testid="company-fit-seed"
                onClick={load_from_list}
              >
                Load from company list
              </button>
            ) : null}
            <button type="button" className="ghost" data-testid="company-fit-add-row" onClick={add_row}>
              Add company
            </button>
          </div>
        </div>
        <p className="hint cf-table-hint">
          <TipText text="Same data as the form above. Traits set Fit and Tier. Interest, Core, Proof, and Access set Effort." />
        </p>
        <div className="cf-table-wrap">
          <table className="cf-table" data-testid="company-fit-table">
            <thead>
              <tr>
                <th className="cf-col-company">Company</th>
                <th className="cf-col-role">Role</th>
                {traits.map((t) => (
                  <th key={t.id} className="cf-col-score" title={t.label}>
                    {trait_header(t.label)}
                  </th>
                ))}
                <th className="cf-col-fit">Fit</th>
                <th className="cf-col-tier">Tier</th>
                <th className="cf-col-interest">Interest</th>
                <th className="cf-col-effort" title="Core fit to this job (0-2)">
                  Core
                </th>
                <th className="cf-col-effort" title="Proof for this job (0-2)">
                  Proof
                </th>
                <th className="cf-col-effort" title="Human access (0-2)">
                  Access
                </th>
                <th
                  className="cf-col-effort"
                  title="Logistics 0-2 (blank uses Compensation / Remote traits)"
                >
                  Logistics
                </th>
                <th className="cf-col-effort-result" title="Auto total and what to do">
                  Effort
                </th>
                <th className="cf-col-flag">Green</th>
                <th className="cf-col-flag">Red</th>
                <th className="cf-col-url">URL</th>
                <th className="cf-col-notes">Notes</th>
                <th className="cf-remove-cell" />
              </tr>
            </thead>
            <tbody>
              {display_rows.map((row) => {
                const auto_score = fit_score(row, traits);
                const auto_tier = auto_map.get(row.id) || "";
                const eff = effective_tier(row, auto_map);
                const fit_value =
                  row.fit_override !== null && row.fit_override !== undefined
                    ? format_fit_score(row.fit_override)
                    : format_fit_score(auto_score);
                const effort = row.effort || empty_effort();
                const effort_total = job_effort_score(row, traits);
                const action = effort_action_label(effort_total);
                const incomplete = effort_incomplete_label(row);
                const action_slug =
                  effort_total !== null && action
                    ? action
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/-+/g, "-")
                        .replace(/^-|-$/g, "")
                    : incomplete
                      ? "incomplete"
                      : "";
                const action_class = action_slug ? `cf-effort-action-${action_slug}` : "";
                const result_text =
                  effort_total !== null
                    ? `${effort_total}/10 · ${action}`
                    : incomplete || "—";
                return (
                  <tr key={row.id} data-testid={`company-fit-row-${row.id}`}>
                    <td className="cf-col-company">
                      <textarea
                        rows={2}
                        value={row.company}
                        placeholder="Company"
                        aria-label="Company"
                        data-testid={`company-fit-company-${row.id}`}
                        onFocus={() => set_active_row_id(row.id)}
                        onChange={(e) => set_row_field(row.id, "company", e.target.value)}
                      />
                    </td>
                    <td className="cf-col-role">
                      <textarea
                        rows={2}
                        value={row.role}
                        placeholder="Role"
                        aria-label="Role"
                        data-testid={`company-fit-role-${row.id}`}
                        onFocus={() => set_active_row_id(row.id)}
                        onChange={(e) => set_row_field(row.id, "role", e.target.value)}
                      />
                    </td>
                    {traits.map((t) => (
                      <td key={t.id} className="cf-col-score">
                        <input
                          type="number"
                          min={SCORE_MIN}
                          max={SCORE_MAX}
                          value={row.scores?.[t.id] ?? ""}
                          aria-label={`${t.label} score`}
                          data-testid={`company-fit-score-${row.id}-${t.id}`}
                          onChange={(e) => set_row_score(row.id, t.id, e.target.value)}
                        />
                      </td>
                    ))}
                    <td className="cf-fit cf-col-fit">
                      <input
                        type="number"
                        min={SCORE_MIN}
                        max={SCORE_MAX}
                        step="0.1"
                        value={fit_value}
                        placeholder={auto_score == null ? "Fit" : format_fit_score(auto_score)}
                        title={
                          row.fit_override != null
                            ? "Manual Fit (clear to use trait average)"
                            : "Fit from traits (edit to override)"
                        }
                        aria-label="Fit score"
                        data-testid={`company-fit-total-${row.id}`}
                        onChange={(e) => set_row_fit(row.id, e.target.value)}
                      />
                    </td>
                    <td className="cf-tier-cell cf-col-tier">
                      <select
                        value={tier_select_value(row)}
                        aria-label="Tier"
                        data-testid={`company-fit-tier-${row.id}`}
                        title={
                          row.tier_mode === "auto" && auto_tier
                            ? `Auto: ${TIER_LABELS[auto_tier] || auto_tier}`
                            : undefined
                        }
                        onChange={(e) => set_row_field(row.id, "tier_mode", e.target.value)}
                      >
                        <option value="auto">
                          {auto_tier ? `· ${TIER_LABELS[auto_tier] || auto_tier}` : "Auto"}
                        </option>
                        {TIER_IDS.map((id) => (
                          <option key={id} value={id}>
                            {TIER_LABELS[id]}
                          </option>
                        ))}
                      </select>
                      <span className="visually-hidden" data-testid={`company-fit-tier-effective-${row.id}`}>
                        {eff}
                      </span>
                    </td>
                    <td className="cf-col-interest">
                      <select
                        className="cf-interest-select"
                        value={interest_select_value(row.interest)}
                        aria-label="Interest"
                        data-testid={`company-fit-interest-${row.id}`}
                        onChange={(e) => set_row_field(row.id, "interest", e.target.value)}
                      >
                        {INTEREST_OPTIONS.map((opt) => (
                          <option key={opt.value || "blank"} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="cf-col-effort">
                      <EffortSelect
                        value={effort.core}
                        options={CORE_OPTIONS}
                        aria_label="Core fit 0-2"
                        test_id={`company-fit-effort-core-${row.id}`}
                        on_change={(v) => set_effort_part(row.id, "core", v)}
                      />
                    </td>
                    <td className="cf-col-effort">
                      <EffortSelect
                        value={effort.proof}
                        options={PROOF_OPTIONS}
                        aria_label="Proof 0-2"
                        test_id={`company-fit-effort-proof-${row.id}`}
                        on_change={(v) => set_effort_part(row.id, "proof", v)}
                      />
                    </td>
                    <td className="cf-col-effort">
                      <EffortSelect
                        value={effort.access}
                        options={ACCESS_OPTIONS}
                        aria_label="Human access 0-2"
                        test_id={`company-fit-effort-access-${row.id}`}
                        on_change={(v) => set_effort_part(row.id, "access", v)}
                      />
                    </td>
                    <td className="cf-col-effort">
                      <EffortSelect
                        value={effort.logistics}
                        options={logistics_options(row, traits)}
                        aria_label="Logistics 0-2"
                        test_id={`company-fit-effort-logistics-${row.id}`}
                        on_change={(v) => set_effort_part(row.id, "logistics", v)}
                      />
                    </td>
                    <td className="cf-col-effort-result">
                      <span
                        className={`cf-effort-result ${action_class}`}
                        data-testid={`company-fit-effort-total-${row.id}`}
                      >
                        {result_text}
                      </span>
                      <span className="visually-hidden" data-testid={`company-fit-effort-action-${row.id}`}>
                        {action || "—"}
                      </span>
                    </td>
                    <td className="cf-col-flag">
                      <textarea
                        rows={2}
                        value={row.green_flag}
                        placeholder={"Green\nflag"}
                        aria-label="Green flag"
                        data-testid={`company-fit-green-${row.id}`}
                        onChange={(e) => set_row_field(row.id, "green_flag", e.target.value)}
                      />
                    </td>
                    <td className="cf-col-flag">
                      <textarea
                        rows={2}
                        value={row.red_flag}
                        placeholder={"Red\nflag"}
                        aria-label="Red flag"
                        data-testid={`company-fit-red-${row.id}`}
                        onChange={(e) => set_row_field(row.id, "red_flag", e.target.value)}
                      />
                    </td>
                    <td className="cf-col-url">
                      <textarea
                        rows={1}
                        value={row.url}
                        placeholder="URL"
                        aria-label="URL"
                        title={row.url || "URL"}
                        data-testid={`company-fit-url-${row.id}`}
                        onChange={(e) => set_row_field(row.id, "url", e.target.value)}
                      />
                    </td>
                    <td className="cf-col-notes">
                      <textarea
                        rows={2}
                        value={row.notes}
                        placeholder="Notes"
                        aria-label="Notes"
                        data-testid={`company-fit-notes-${row.id}`}
                        onChange={(e) => set_row_field(row.id, "notes", e.target.value)}
                      />
                    </td>
                    <td className="cf-remove-cell">
                      <button
                        type="button"
                        className="ghost cf-remove"
                        aria-label="Remove company"
                        title="Remove"
                        data-testid={`company-fit-remove-${row.id}`}
                        onClick={() => remove_row(row.id)}
                      >
                        −
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="cf-rank-summary" data-testid="company-fit-summary">
          <h4>Auto-rank from this sheet</h4>
          <dl>
            {["stretch", "stepping", "sandbox"].map((id) => (
              <div key={id}>
                <dt>{TIER_LABELS[id]}</dt>
                <dd>{ranks[id].length ? ranks[id].join(", ") : "-"}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="cf-save-row">
          <button
            type="button"
            className="primary"
            data-testid="company-fit-save"
            onClick={() => commit(traits, rows, true)}
          >
            Save
          </button>
        </div>
        <p className="hint">
          <TipText text="Fit auto-ranks: top ~3 Stretch, middle Stepping, bottom ~3 Sandbox. Unscored names sit in Stepping. Override Tier on a row. Syncs to Module 4. Job effort on a row syncs to Apply when 6+." />{" "}
          <a
            className="doc-link"
            href={doc_url("docs/view.html?doc=target-companies.md#rank-by-what-matters")}
          >
            Guide
          </a>
          {" · "}
          <a
            className="doc-link"
            href={doc_url(
              "docs/view.html?doc=overview-v8.md#before-you-apply-chart-e-effort-score-0-10",
            )}
          >
            Job effort how-to
          </a>
        </p>
      </div>

      <button type="button" className="primary" onClick={on_close}>
        Done: back to progress
      </button>
    </section>
  );
}
