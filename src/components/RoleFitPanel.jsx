import {
  ROLE_TRACKS,
  YEARS_OPTIONS,
  SKILL_OPTIONS,
  SEARCH_PATHS,
  suggest_role_track,
} from "../lib/roleFit.js";
import { FoldSection } from "./FoldSection.jsx";

function gap_check_url(track_id) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}docs/view.html?doc=m1-roadmap.md#${encodeURIComponent(track_id)}`;
}

function PillRow({ label, options, value, on_pick }) {
  return (
    <div className="role-fit-row">
      <span className="role-fit-label">{label}</span>
      <div className="role-pills" role="group" aria-label={label}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`role-pill ${value === opt ? "selected" : ""}`}
            onClick={() => on_pick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function RoleFitPanel({ progress, on_change }) {
  const answers = progress.answers || {};
  const suggestion = suggest_role_track(answers);
  const selected = answers.role_track || "";
  const selected_label = ROLE_TRACKS.find((t) => t.id === selected)?.label || "";
  const search_path = answers.search_path || "";
  const path_label = SEARCH_PATHS.find((p) => p.id === search_path)?.label || "";
  const track_and_path = Boolean(selected && search_path);

  const title = track_and_path ? `${selected_label} · ${path_label}` : "Role + path";
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

  function pick_track(id) {
    set_answer("role_track", id);
  }

  function use_suggestion() {
    if (!suggestion.id) return;
    set_answer("role_track", suggestion.id);
  }

  return (
    <FoldSection
      id="rolefit"
      title={title}
      badge={badge}
      defaultOpen={!track_and_path}
      className="stage-card role-fit fold-card"
      testId="role-fit"
    >
      <div className="role-fit-row">
        <span className="role-fit-label">Track</span>
        <div className="role-pills role-pills-tracks" role="group" aria-label="Target role track">
          {ROLE_TRACKS.map((track) => {
            const is_selected = selected === track.id;
            const is_suggested = suggestion.id === track.id;
            return (
              <button
                key={track.id}
                type="button"
                className={`role-pill track ${is_selected ? "selected" : ""} ${
                  is_suggested && !is_selected ? "suggested" : ""
                }`}
                onClick={() => pick_track(track.id)}
              >
                {track.label}
              </button>
            );
          })}
        </div>
      </div>

      {selected ? (
        <p className="role-fit-gap">
          <a className="role-gap-link" href={gap_check_url(selected)} target="_blank" rel="noreferrer">
            Gap check
          </a>
        </p>
      ) : null}

      <div className="role-fit-row">
        <span className="role-fit-label">Path</span>
        <div className="role-pills role-pills-tracks" role="group" aria-label="Search path">
          {SEARCH_PATHS.map((path) => (
            <button
              key={path.id}
              type="button"
              className={`role-pill track ${search_path === path.id ? "selected" : ""}`}
              onClick={() => set_answer("search_path", path.id)}
              title={path.hint}
            >
              {path.label}
            </button>
          ))}
        </div>
      </div>
      {!search_path ? (
        <p className="hint">Search-ready skips Module 2 · Build-proof requires it</p>
      ) : null}

      <FoldSection
        id="rolefit_suggest"
        title="Suggest track from skills"
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
            {suggestion.id && suggestion.id !== selected ? (
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
