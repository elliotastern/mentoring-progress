import { useEffect, useRef, useState } from "react";
import { progress_report } from "../lib/progressReport.js";
import { get_fold, set_fold } from "../lib/foldPrefs.js";
import { TipText } from "./Tip.jsx";

const PRECURSOR_IDS = ["docs", "weekly"];
const PORTFOLIO_BAND_IDS = ["proof", "skills", "application"];
const NEXT_STEPS = 3;

function all_lines(pillar) {
  if (pillar.groups?.length) {
    return pillar.groups.flatMap((group) =>
      group.lines.map((line) => ({ ...line, group: group.title })),
    );
  }
  return pillar.lines || [];
}

/** Up to half of completed items + next few incomplete steps. */
function preview_lines(pillar) {
  const lines = all_lines(pillar);
  const done = lines.filter((line) => line.done);
  const pending = lines.filter((line) => !line.done);
  const done_cap = Math.ceil(done.length / 2);
  const shown_done = done.slice(Math.max(0, done.length - done_cap));
  const shown_next = pending.slice(0, NEXT_STEPS);
  return {
    shown: [...shown_done, ...shown_next],
    more_done: done.length - shown_done.length,
    more_next: Math.max(0, pending.length - shown_next.length),
    total: lines.length,
  };
}

function LineRow({ line, on_work_on }) {
  const work = line.work;

  function activate(e) {
    e.preventDefault();
    e.stopPropagation();
    if (work && on_work_on) on_work_on(work);
  }

  const label = (
    <>
      <TipText text={line.label} />
      {line.detail ? <em> {line.detail}</em> : null}
    </>
  );

  return (
    <li className={line.done ? "done" : "next"} data-line-id={line.id}>
      <span
        className={`pr-check ${line.done ? "checked" : ""}`}
        aria-hidden="true"
      >
        {line.done ? "✓" : ""}
      </span>
      {work && on_work_on ? (
        <button type="button" className="pr-line-link" onClick={activate}>
          {label}
        </button>
      ) : (
        <span className="pr-line-label">{label}</span>
      )}
    </li>
  );
}

function PillarCard({ pillar, on_expand, on_work_on }) {
  const preview = preview_lines(pillar);
  const title = pillar.short_label || pillar.label;
  return (
    <div className="pr-pillar compact" data-testid={`pr-pillar-${pillar.id}`}>
      <div className="pr-pillar-top">
        <div className="pr-pillar-head">
          <span className="pr-pillar-title" title={pillar.label}>
            {title}
          </span>
          <span className="pr-pillar-pct">{pillar.percent}%</span>
        </div>
        <div className="pr-mini-track" aria-hidden="true">
          <div className="pr-mini-fill" style={{ width: `${pillar.percent}%` }} />
        </div>
        {pillar.detail ? (
          <p className="pr-pillar-detail">{pillar.detail}</p>
        ) : (
          <p className="pr-pillar-detail">&nbsp;</p>
        )}
      </div>
      <ul className="pr-lines pr-preview-lines">
        {preview.shown.map((line) => (
          <LineRow key={line.id} line={line} on_work_on={on_work_on} />
        ))}
      </ul>
      <p className="pr-more-hint">
        {preview.shown.length === 0
          ? "No steps yet"
          : [
              preview.more_done > 0 ? `+${preview.more_done} done` : null,
              preview.more_next > 0 ? `+${preview.more_next} ahead` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "\u00a0"}
      </p>
      <button type="button" className="pr-expand-btn" onClick={() => on_expand(pillar)}>
        Expand
      </button>
    </div>
  );
}

function PillarPage({ pillar, on_close, on_work_on }) {
  useEffect(() => {
    function on_key(e) {
      if (e.key === "Escape") on_close();
    }
    window.addEventListener("keydown", on_key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", on_key);
      document.body.style.overflow = prev;
    };
  }, [on_close]);

  const kicker = PRECURSOR_IDS.includes(pillar.id) ? "Precursor" : "Portfolio";

  return (
    <div className="pr-page" role="dialog" aria-modal="true" aria-label={pillar.label}>
      <div className="pr-page-bar">
        <div>
          <p className="pr-page-kicker">{kicker}</p>
          <h2>{pillar.label}</h2>
        </div>
        <div className="pr-page-bar-meta">
          <span className="pr-pillar-pct">{pillar.percent}%</span>
          <button type="button" className="pr-page-close" onClick={on_close}>
            Close
          </button>
        </div>
      </div>
      <div className="pr-page-track" aria-hidden="true">
        <div className="pr-mini-fill" style={{ width: `${pillar.percent}%` }} />
      </div>
      {pillar.detail ? <p className="pr-page-detail">{pillar.detail}</p> : null}
      <div className="pr-page-body">
        {pillar.groups?.map((group) => (
          <div key={group.title} className="pr-group">
            <h3>
              <TipText text={group.title} />
            </h3>
            <ul className="pr-lines">
              {group.lines.map((line) => (
                <LineRow key={line.id} line={line} on_work_on={on_work_on} />
              ))}
            </ul>
          </div>
        ))}
        {!pillar.groups?.length ? (
          <ul className="pr-lines">
            {pillar.lines.map((line) => (
              <LineRow key={line.id} line={line} on_work_on={on_work_on} />
            ))}
          </ul>
        ) : null}
        {pillar.id === "weekly" && pillar.streak > 0 ? (
          <p className="pr-streak-note">
            Streak {pillar.streak}
            {pillar.best_streak > pillar.streak ? ` · best ${pillar.best_streak}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function map_pillars(report, ids) {
  return ids
    .map((id) => {
      const pillar = report.pillars.find((p) => p.id === id);
      if (!pillar) return null;
      if (id === "weekly") {
        return { ...pillar, label: "Progress", short_label: "Progress" };
      }
      return pillar;
    })
    .filter(Boolean);
}

export function ProgressReport({ progress, on_work_on, next_hint = "" }) {
  const report = progress_report(progress || {});
  const [open, set_open] = useState(() => get_fold("progress_report", false));
  const [page_pillar, set_page_pillar] = useState(null);
  const prev = useRef(report.overall);
  const [bump, set_bump] = useState(false);

  useEffect(() => {
    if (report.overall > prev.current) {
      set_bump(true);
      const t = setTimeout(() => set_bump(false), 500);
      prev.current = report.overall;
      return () => clearTimeout(t);
    }
    prev.current = report.overall;
    return undefined;
  }, [report.overall]);

  function go_work(work) {
    // Docs must open inside the user gesture — a setTimeout before
    // window.open is blocked by Chrome/Safari popup policies.
    if (work?.kind === "doc") {
      on_work_on?.(work);
      set_page_pillar(null);
      set_open(false);
      set_fold("progress_report", false);
      return;
    }
    set_page_pillar(null);
    set_open(false);
    set_fold("progress_report", false);
    window.setTimeout(() => on_work_on?.(work), 40);
  }

  function toggle() {
    set_open((was_open) => {
      const next = !was_open;
      set_fold("progress_report", next);
      if (!next) set_page_pillar(null);
      return next;
    });
  }

  const weekly = report.pillars.find((p) => p.id === "weekly");
  const precursor_pillars = map_pillars(report, PRECURSOR_IDS);
  const portfolio_pillars = map_pillars(report, PORTFOLIO_BAND_IDS);
  const all_pillars = [...precursor_pillars, ...portfolio_pillars];

  const live_page =
    page_pillar && (all_pillars.find((p) => p.id === page_pillar.id) || page_pillar);

  return (
    <section
      className={`progress-report ${open ? "open fold-fill" : ""} ${bump ? "bump" : ""}`}
      data-testid="progress-report"
    >
      <div className="progress-report-top">
        <button
          type="button"
          className="progress-report-summary"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="progress-report-body"
        >
          <div className="progress-report-title-row">
            <h1>Progress</h1>
            <span className="progress-report-caret" aria-hidden="true" />
          </div>
          <div className="progress-report-meta">
            <span className={`progress-report-pct ${bump ? "pop" : ""}`} data-testid="progress-overall">
              {report.overall}%
            </span>
            {report.delta_text ? (
              <span className="progress-report-delta" data-testid="progress-delta">
                {report.delta_text}
              </span>
            ) : null}
            {weekly?.streak > 0 ? (
              <span className="progress-report-streak">Streak {weekly.streak}</span>
            ) : null}
          </div>
          <div
            className="progress-report-track"
            aria-hidden="true"
            title={report.delta_label || `${report.overall}%`}
          >
            <div className="progress-report-base" style={{ width: `${report.base_fill}%` }} />
            {report.delta > 0 ? (
              <div
                className="progress-report-gain"
                style={{ left: `${report.base_fill}%`, width: `${report.delta}%` }}
              />
            ) : null}
          </div>
          <p className="progress-report-hint" data-testid="progress-next-hint">
            {open ? (
              "Hide breakdown"
            ) : next_hint ? (
              <>
                <span className="progress-next-label">Recommended next</span>
                <span className="progress-next-action">{next_hint}</span>
              </>
            ) : (
              "Open for Modules · Progress · Portfolio · Skills · Apply"
            )}
          </p>
        </button>
        <figure className="perspective-hero" data-testid="perspective-hero">
          <img
            src={`${import.meta.env.BASE_URL}perspective-comic.png`}
            alt="When you feel like I am getting nowhere — Remember I've come so far"
            width={1024}
            height={572}
            decoding="async"
          />
        </figure>
      </div>
      <div
        id="progress-report-body"
        className="progress-report-body"
        aria-hidden={!open}
      >
        <div className="pr-body-inner">
          <div className="pr-bands" data-testid="pr-bands">
            <div className="pr-band pr-band-precursor" data-testid="pr-band-precursor">
              <p className="pr-section-label">Precursor</p>
              <div className="pr-band-pillars">
                {precursor_pillars.map((pillar) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}
                    on_expand={set_page_pillar}
                    on_work_on={go_work}
                  />
                ))}
              </div>
            </div>
            <div className="pr-band pr-band-portfolio" data-testid="pr-band-portfolio">
              <p className="pr-section-label">Portfolio</p>
              <div className="pr-band-pillars">
                {portfolio_pillars.map((pillar) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}
                    on_expand={set_page_pillar}
                    on_work_on={go_work}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {live_page ? (
        <PillarPage
          pillar={live_page}
          on_close={() => set_page_pillar(null)}
          on_work_on={go_work}
        />
      ) : null}
    </section>
  );
}
