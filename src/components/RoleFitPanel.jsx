import {
  ROLE_TRACKS,
  YEARS_OPTIONS,
  SKILL_OPTIONS,
  SEARCH_PATHS,
  suggest_role_track,
  selected_role_tracks,
  role_track_labels,
  format_job_by_label,
} from "../lib/roleFit.js";
import { FoldSection } from "./FoldSection.jsx";

import { TipText } from "./Tip.jsx";

function gap_check_url(track_id) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}docs/view.html?doc=m1-roadmap.md#${encodeURIComponent(track_id)}`;
}

function JobTargetFoldTitle({ track_ids, job_by }) {
  const labels = role_track_labels(track_ids);
  const when = format_job_by_label(job_by);
  return (
    <>
      <TipText text="Job Target" />
      {labels.length ? (
        <>
          {": "}
          {labels.map((label, i) => (
            <span key={label}>
              {i > 0 ? ", " : null}
              <TipText text={label} />
            </span>
          ))}
        </>
      ) : null}
      {when ? <span className="job-target-when"> {when}</span> : null}
    </>
  );
}

function PillRow({ label, options, value, on_pick }) {
  return (
    <div className="role-fit-row">
      <span className="role-fit-label">
        <TipText text={label} />
      </span>
      <div className="role-pills" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`role-pill ${value === opt ? "selected" : ""}`}
            onClick={() => on_pick(opt)}
          >
            <TipText text={opt} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function RoleFitPanel({ progress, on_change }) {
  const answers = progress.answers || {};
  const suggestion = suggest_role_track(answers);
  const selected_ids = selected_role_tracks(answers);
  const search_path = answers.search_path || "";
  const track_and_path = Boolean(selected_ids.length && search_path);
  const job_by = answers.job_by || "";

  const title = <JobTargetFoldTitle track_ids={selected_ids} job_by={job_by} />;
  const badge = track_and_path ? (
    <span className="badge ok">Set</span>
  ) : (
    <span className="badge">Required</span>
  );

  function set_answer(key, value) {
    const next = { ...answers, [key]: value };
    const sug = suggest_role_track(next);
    next.role_suggested = sug.id || "";
    on_change({ answers: next });
  }

  function set_tracks(ids) {
    const ordered = ROLE_TRACKS.map((t) => t.id).filter((id) => ids.includes(id));
    const next = {
      ...answers,
      role_tracks: ordered,
      role_track: ordered[0] || "",
    };
    const sug = suggest_role_track(next);
    next.role_suggested = sug.id || "";
    on_change({ answers: next });
  }

  function pick_track(id) {
    if (selected_ids.includes(id)) {
      set_tracks(selected_ids.filter((x) => x !== id));
      return;
    }
    set_tracks([...selected_ids, id]);
  }

  function use_suggestion() {
    if (!suggestion.id) return;
    if (selected_ids.includes(suggestion.id)) return;
    set_tracks([...selected_ids, suggestion.id]);
  }

  return (
    <FoldSection
      id="rolefit"
      title={title}
      badge={badge}
      defaultOpen={false}
      className="stage-card role-fit fold-card"
      testId="role-fit"
    >
      <div className="role-fit-row">
        <span className="role-fit-label">
          <TipText text="Track" />
        </span>
        <div className="role-pills role-pills-tracks" role="group" aria-label="Target job titles">
          {ROLE_TRACKS.map((track) => {
            const is_selected = selected_ids.includes(track.id);
            const is_suggested = suggestion.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                className={`role-pill track ${is_selected ? "selected" : ""} ${
                  is_suggested && !is_selected ? "suggested" : ""
                }`}
                onClick={() => pick_track(track.id)}
                aria-pressed={is_selected}
              >
                <TipText text={track.label} />
              </button>
            );
          })}
        </div>
      </div>

      {selected_ids.length ? (
        <p className="role-fit-gap">
          {selected_ids.map((id, i) => {
            const label = ROLE_TRACKS.find((t) => t.id === id)?.label || id;
            const link_text = selected_ids.length === 1 ? "Gap check" : `${label} gap`;
            return (
              <span key={id}>
                {i > 0 ? <span aria-hidden="true"> · </span> : null}
                <a
                  className="role-gap-link"
                  href={gap_check_url(id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <TipText text={link_text} />
                </a>
              </span>
            );
          })}
        </p>
      ) : null}

      <div className="role-fit-row">
        <span className="role-fit-label">
          <TipText text="Path" />
        </span>
        <div className="role-pills role-pills-tracks" role="group" aria-label="Search path">
          {SEARCH_PATHS.map((path) => (
            <button
              key={path.id}
              type="button"
              className={`role-pill track ${search_path === path.id ? "selected" : ""}`}
              onClick={() => set_answer("search_path", path.id)}
            >
              <TipText text={path.label} />
            </button>
          ))}
        </div>
      </div>
      {!search_path ? (
        <p className="hint">
          <TipText text="Search-ready skips Project · Build-proof requires it" />
        </p>
      ) : null}

      <div className="role-fit-plan">
        <label className="role-fit-past">
          <span>
            <TipText text="Hours/week" />
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={answers.target_hours_week || ""}
            onChange={(e) => set_answer("target_hours_week", e.target.value)}
            placeholder="Applying + skill building, e.g. 10"
            data-testid="target-hours-week"
          />
        </label>
        <div className="role-fit-past role-fit-job-by">
          <span>
            <TipText text="Want a job by" />
          </span>
          <div className="role-fit-job-by-controls">
            <button
              type="button"
              className={`role-pill ${answers.job_by === "asap" ? "selected" : ""}`}
              onClick={() => set_answer("job_by", answers.job_by === "asap" ? "" : "asap")}
              data-testid="job-by-asap"
            >
              ASAP
            </button>
            <input
              type="date"
              value={/^\d{4}-\d{2}-\d{2}$/.test(answers.job_by || "") ? answers.job_by : ""}
              onChange={(e) => set_answer("job_by", e.target.value)}
              data-testid="job-by"
            />
          </div>
        </div>
      </div>

      <FoldSection
        id="rolefit_suggest"
        title="Suggest from your skills"
        defaultOpen={false}
        className="role-fit-suggest-fold"
        summaryClassName="fold-summary fold-summary-nested"
      >
        <PillRow
          label="Years"
          options={YEARS_OPTIONS}
          value={answers.role_years || ""}
          on_pick={(v) => set_answer("role_years", v)}
        />
        <PillRow
          label="Python"
          options={SKILL_OPTIONS}
          value={answers.role_python || ""}
          on_pick={(v) => set_answer("role_python", v)}
        />
        <PillRow
          label="SQL"
          options={SKILL_OPTIONS}
          value={answers.role_sql || ""}
          on_pick={(v) => set_answer("role_sql", v)}
        />
        <PillRow
          label="R"
          options={SKILL_OPTIONS}
          value={answers.role_r || ""}
          on_pick={(v) => set_answer("role_r", v)}
        />
        <label className="role-fit-past">
          <span>Past jobs (optional)</span>
          <input
            type="text"
            value={answers.role_past_jobs || ""}
            onChange={(e) => set_answer("role_past_jobs", e.target.value)}
            placeholder="BI analyst 2y · or · pipelines"
          />
        </label>
        {suggestion.ready ? (
          <p className="role-fit-suggest">
            {suggestion.reason}
            {suggestion.id && !selected_ids.includes(suggestion.id) ? (
              <>
                {" "}
                <button type="button" className="linkish" onClick={use_suggestion}>
                  Use suggestion
                </button>
              </>
            ) : null}
          </p>
        ) : null}
      </FoldSection>
    </FoldSection>
  );
}
