import { useState } from "react";
import {
  ROLE_TRACKS,
  YEARS_OPTIONS,
  SKILL_OPTIONS,
  SEARCH_PATHS,
  LEVEL_OPTIONS,
  LOCATION_MODES,
  suggest_role_track,
  selected_role_tracks,
  role_track_labels,
  format_job_by_label,
  location_modes_from,
  job_target_constraint_bits,
} from "../lib/roleFit.js";
import { FoldSection } from "./FoldSection.jsx";

import { TipText } from "./Tip.jsx";

function gap_check_url(track_id) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}docs/view.html?doc=m1-roadmap.md#${encodeURIComponent(track_id)}`;
}

export function JobTargetFoldTitle({ track_ids, job_by, progress = null }) {
  const labels = role_track_labels(track_ids);
  const when = format_job_by_label(job_by);
  const extras = progress ? job_target_constraint_bits(progress) : [];
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
      {extras.length ? (
        <span className="job-target-extras">
          {" "}
          · {extras.join(" · ")}
        </span>
      ) : null}
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

/** Shared Job Target form body (Track / suggest / Path / hours / constraints / location). */
export function RoleFitFields({
  progress,
  on_change,
  suggest_fold_id = "rolefit_suggest",
  on_submit = null,
}) {
  const answers = progress.answers || {};
  const suggestion = suggest_role_track(answers);
  const selected_ids = selected_role_tracks(answers);
  const search_path = answers.search_path || "";
  const location_modes = location_modes_from(answers);
  const skill_level = progress.skill_level || "";
  const needs_place =
    location_modes.includes("hybrid") || location_modes.includes("onsite");
  const can_submit = Boolean(selected_ids.length && search_path);

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

  function pick_level(id) {
    on_change({ skill_level: skill_level === id ? "" : id });
  }

  function pick_location_mode(id) {
    let next_modes;
    if (location_modes.includes(id)) {
      next_modes = location_modes.filter((x) => x !== id);
    } else {
      next_modes = [...location_modes, id];
    }
    const next = {
      ...answers,
      job_location_modes: next_modes,
    };
    if (!next_modes.includes("hybrid") && !next_modes.includes("onsite")) {
      next.job_location_place = "";
    }
    const sug = suggest_role_track(next);
    next.role_suggested = sug.id || "";
    on_change({ answers: next });
  }

  const suggest_fold = (
    <FoldSection
      id={suggest_fold_id}
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
  );

  return (
    <>
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
                data-testid={`role-track-${track.id}`}
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

      {suggest_fold}

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
              data-testid={`role-path-${path.id}`}
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

      <div className="role-fit-row">
        <span className="role-fit-label">
          <TipText text="Level" />
        </span>
        <div className="role-pills role-pills-tracks" role="group" aria-label="Level">
          {LEVEL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`role-pill track ${skill_level === opt.id ? "selected" : ""}`}
              onClick={() => pick_level(opt.id)}
              aria-pressed={skill_level === opt.id}
              data-testid={`job-level-${opt.id}`}
            >
              <TipText text={opt.label} />
            </button>
          ))}
        </div>
      </div>

      <div className="role-fit-location" data-testid="job-location">
        <p className="role-fit-location-label">
          <TipText text="Remote / hybrid" />
        </p>
        <p className="hint">
          <TipText text="Tap in order of preference. First pick is rank 1." />
        </p>
        <div
          className="role-pills role-pills-tracks"
          role="group"
          aria-label="Remote / hybrid"
        >
          {LOCATION_MODES.map((mode) => {
            const rank = location_modes.indexOf(mode.id);
            const selected = rank >= 0;
            return (
              <button
                key={mode.id}
                type="button"
                className={`role-pill track ${selected ? "selected" : ""}`}
                onClick={() => pick_location_mode(mode.id)}
                aria-pressed={selected}
                data-testid={`job-location-${mode.id}`}
              >
                {selected ? (
                  <span className="role-pill-rank" aria-hidden="true">
                    {rank + 1}
                  </span>
                ) : null}
                <TipText text={mode.label} />
              </button>
            );
          })}
        </div>
        {needs_place ? (
          <label className="role-fit-past">
            <span>
              <TipText text="Location" />
            </span>
            <input
              type="text"
              value={answers.job_location_place || ""}
              onChange={(e) => set_answer("job_location_place", e.target.value)}
              placeholder="City / metro / region"
              data-testid="job-location-place"
            />
          </label>
        ) : null}
      </div>

      <div className="role-fit-plan">
        <label className="role-fit-past">
          <span>
            <TipText text="Industry" />
          </span>
          <input
            type="text"
            value={answers.job_industry || ""}
            onChange={(e) => set_answer("job_industry", e.target.value)}
            placeholder="Health, fintech, climate…"
            data-testid="job-industry"
          />
        </label>
        <label className="role-fit-past">
          <span>
            <TipText text="Compensation floor" />
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={answers.comp_floor || ""}
            onChange={(e) => set_answer("comp_floor", e.target.value)}
            placeholder="$120k"
            data-testid="comp-floor"
          />
        </label>
      </div>

      <label className="role-fit-past">
        <span>
          <TipText text="Notes" />
        </span>
        <textarea
          rows={2}
          value={answers.job_location_notes || ""}
          onChange={(e) => set_answer("job_location_notes", e.target.value)}
          placeholder="Visa, commute max, timezone, etc."
          data-testid="job-location-notes"
        />
      </label>

      <button
        type="button"
        className="primary role-fit-submit"
        data-testid="job-target-submit"
        disabled={!can_submit}
        onClick={() => {
          if (!can_submit) return;
          if (typeof on_submit === "function") on_submit();
        }}
      >
        Submit
      </button>
      {!can_submit ? (
        <p className="hint">
          <TipText text="Pick a Track and Path before submitting" />
        </p>
      ) : null}
    </>
  );
}

export function RoleFitPanel({ progress, on_change }) {
  const answers = progress.answers || {};
  const selected_ids = selected_role_tracks(answers);
  const search_path = answers.search_path || "";
  const track_and_path = Boolean(selected_ids.length && search_path);
  const job_by = answers.job_by || "";
  const [open, set_open] = useState(false);

  const title = (
    <JobTargetFoldTitle track_ids={selected_ids} job_by={job_by} progress={progress} />
  );
  const badge = track_and_path ? (
    <span className="badge ok">Set</span>
  ) : (
    <span className="badge">Required</span>
  );

  return (
    <FoldSection
      id="rolefit"
      title={title}
      badge={badge}
      defaultOpen={false}
      open={open}
      onOpenChange={set_open}
      className="stage-card role-fit fold-card"
      testId="role-fit"
    >
      <RoleFitFields
        progress={progress}
        on_change={on_change}
        on_submit={() => set_open(false)}
      />
    </FoldSection>
  );
}
