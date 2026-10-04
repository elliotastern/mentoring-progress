import { COMPANY_LIST_TIERS } from "../data/companyList.js";
import { set_worksheet_text, toggle_worksheet_check } from "../lib/checkSync.js";
import { FoldSection } from "./FoldSection.jsx";
import { TipText } from "./Tip.jsx";

function tier_has_line(value) {
  return String(value || "")
    .split(/\r?\n/)
    .some((line) => line.trim().length > 0);
}

/** True when Stretch, Stepping, and Sandbox each have at least one company line. */
export function company_list_ready(progress) {
  const sheet = progress?.worksheets?.brainstorm || {};
  return COMPANY_LIST_TIERS.every((t) => tier_has_line(sheet[t.id]));
}

/** Apply brainstorm field change; auto-check know_companies when all tiers have a line. */
export function apply_company_list_change(progress, field_id, value) {
  let next = set_worksheet_text(progress, "brainstorm", field_id, value);
  if (company_list_ready(next)) {
    const already =
      Boolean(next.worksheets?.["search-ready"]?.know_companies) ||
      Boolean(next.checks?.m4_know_companies);
    if (!already) {
      next = toggle_worksheet_check(next, "search-ready", "know_companies", true);
    }
  }
  return next;
}

export function CompanyListFields({
  progress,
  on_change,
  on_open,
  readOnly = false,
  testId = "company-list",
  fold_id = "company_list",
}) {
  const sheet = progress?.worksheets?.brainstorm || {};
  const ready = company_list_ready(progress);
  const badge = ready ? (
    <span className="badge ok">Set</span>
  ) : (
    <span className="badge">Required</span>
  );

  function set_tier(field_id, value) {
    if (readOnly) return;
    const next = apply_company_list_change(progress, field_id, value);
    on_change({
      worksheets: next.worksheets,
      checks: next.checks,
      answers: next.answers,
    });
  }

  return (
    <FoldSection
      id={fold_id}
      title="Company list"
      badge={badge}
      defaultOpen={false}
      className="jo-company-list company-list-fields"
      testId={testId}
      summaryClassName="fold-summary fold-summary-nested"
    >
      <p className="hint">
        {readOnly ? (
          <TipText text="Write company names in Company Fit. This list is read-only here." />
        ) : (
          <TipText text="Auto-fills from Company Fit (unscored names → Stepping until scored). Override via Fit Tier column. ≈3 stretch · 4-9 stepping · ≈3 sandbox." />
        )}
      </p>
      {readOnly ? (
        <p className="worksheet-banner">
          <a
            className="linkish"
            href="?ws=company-fit"
            data-testid="company-list-open-fit"
            onClick={(e) => {
              if (!on_open) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
              e.preventDefault();
              on_open("company-fit");
            }}
          >
            <TipText text="Open Company Fit" />
          </a>
        </p>
      ) : null}
      {COMPANY_LIST_TIERS.map((tier) => (
        <label key={tier.id} className="ws-field company-list-tier">
          <span>
            <TipText text={tier.label} />
          </span>
          <textarea
            rows={3}
            value={sheet[tier.id] || ""}
            placeholder={tier.placeholder}
            data-testid={`company-tier-${tier.id}`}
            readOnly={readOnly}
            onChange={(e) => set_tier(tier.id, e.target.value)}
          />
        </label>
      ))}
    </FoldSection>
  );
}
