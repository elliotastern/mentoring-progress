import { useEffect, useState } from "react";
import {
  PORTFOLIO_PIECES,
  all_piece_urls_filled,
  format_submit_date,
  portfolio_final_from_sheet,
  portfolio_package_complete,
  submit_portfolio_all,
  submit_portfolio_piece,
  with_piece_draft,
} from "../lib/portfolioFinal.js";
import { TipText } from "./Tip.jsx";

function piece_drafts_from_pf(pf) {
  const drafts = {};
  for (const piece of PORTFOLIO_PIECES) {
    drafts[piece.id] = {
      url: pf[piece.id]?.url || "",
      note: pf[piece.id]?.note || "",
    };
  }
  return drafts;
}

function persist_progress(next, on_change) {
  on_change({
    checks: next.checks,
    worksheets: next.worksheets,
    answers: next.answers,
  });
}

export function PortfolioFinalSubmit({ progress, on_change }) {
  const sheet = progress.worksheets?.["module-exit-3"] || {};
  const pf = portfolio_final_from_sheet(sheet);
  const [drafts, set_drafts] = useState(() => piece_drafts_from_pf(pf));

  useEffect(() => {
    set_drafts(piece_drafts_from_pf(pf));
    // Sync when saved package stamps or URLs change from parent.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pf fields are the source of truth
  }, [
    pf.package_submitted_at,
    pf.linkedin?.url,
    pf.linkedin?.submitted_at,
    pf.resume?.url,
    pf.resume?.submitted_at,
    pf.github?.url,
    pf.github?.submitted_at,
    pf.site?.url,
    pf.site?.submitted_at,
  ]);

  const package_ok = portfolio_package_complete(progress);
  const merged = {
    ...pf,
    linkedin: { ...pf.linkedin, ...drafts.linkedin },
    resume: { ...pf.resume, ...drafts.resume },
    github: { ...pf.github, ...drafts.github },
    site: { ...pf.site, ...drafts.site },
  };
  const can_submit_all = all_piece_urls_filled(merged);

  function set_draft(piece_id, patch) {
    set_drafts((cur) => ({
      ...cur,
      [piece_id]: { ...cur[piece_id], ...patch },
    }));
  }

  function save_draft(piece_id) {
    const draft = drafts[piece_id] || { url: "", note: "" };
    persist_progress(with_piece_draft(progress, piece_id, draft), on_change);
  }

  function on_submit_piece(piece_id) {
    const draft = drafts[piece_id] || { url: "", note: "" };
    if (!String(draft.url || "").trim()) return;
    persist_progress(submit_portfolio_piece(progress, piece_id, draft), on_change);
  }

  function on_submit_all() {
    if (!can_submit_all) return;
    persist_progress(submit_portfolio_all(progress, drafts), on_change);
  }

  return (
    <div className="pf-submit" data-testid="portfolio-final-submit">
      <p className="hint pf-submit-lead">
        <TipText text="Paste each link (or a Drive / Word / screenshot Doc link). Submit saves to your login with the date. Awesome Screenshot is the fastest way to capture pages." />
      </p>

      <div className="pf-submit-status" data-testid="portfolio-final-package-status">
        {package_ok ? (
          <p className="pf-submitted">
            Package submitted: {format_submit_date(pf.package_submitted_at) || "yes"}
          </p>
        ) : (
          <p className="hint">Package not submitted yet. Submit each piece, or Submit all four.</p>
        )}
      </div>

      <div className="pf-pieces">
        {PORTFOLIO_PIECES.map((piece) => {
          const saved = pf[piece.id] || {};
          const draft = drafts[piece.id] || { url: "", note: "" };
          const submitted = Boolean(saved.submitted_at);
          return (
            <div
              key={piece.id}
              className="pf-piece"
              data-testid={`portfolio-final-piece-${piece.id}`}
            >
              <div className="pf-piece-head">
                <h4>
                  <TipText text={piece.label} />
                </h4>
                <span
                  className={submitted ? "pf-date pf-date-ok" : "pf-date pf-date-miss"}
                  data-testid={`portfolio-final-date-${piece.id}`}
                >
                  {submitted
                    ? `Submitted: ${format_submit_date(saved.submitted_at)}`
                    : "Not submitted"}
                </span>
              </div>
              <label className="ws-field">
                <span>URL</span>
                <input
                  type="url"
                  value={draft.url}
                  placeholder={piece.placeholder}
                  onChange={(e) => set_draft(piece.id, { url: e.target.value })}
                  onBlur={() => save_draft(piece.id)}
                  data-testid={`portfolio-final-url-${piece.id}`}
                />
              </label>
              <label className="ws-field">
                <span>Note (optional: screenshot Doc / Slack)</span>
                <input
                  type="text"
                  value={draft.note}
                  placeholder="e.g. Awesome Screenshot Doc link or Slack date"
                  onChange={(e) => set_draft(piece.id, { note: e.target.value })}
                  onBlur={() => save_draft(piece.id)}
                  data-testid={`portfolio-final-note-${piece.id}`}
                />
              </label>
              <button
                type="button"
                className="primary pf-piece-submit"
                disabled={!String(draft.url || "").trim()}
                onClick={() => on_submit_piece(piece.id)}
                data-testid={`portfolio-final-submit-${piece.id}`}
              >
                {submitted ? "Re-submit" : "Submit"} {piece.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="pf-submit-all-wrap">
        <button
          type="button"
          className="primary"
          disabled={!can_submit_all}
          onClick={on_submit_all}
          data-testid="portfolio-final-submit-all"
        >
          Submit all four
        </button>
        {!can_submit_all ? (
          <p className="hint">Fill a URL for every piece to enable Submit all four.</p>
        ) : null}
      </div>
    </div>
  );
}
