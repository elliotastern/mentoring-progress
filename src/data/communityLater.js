/**
 * Optional peer-Slack / mentee-contact tasks — deferred from module gates.
 *
 * ## How to restore into required modules later
 *
 * 1. foundations.js (Module 0):
 *    - Append m0_slack_intro item back to m0.items (label below).
 *    - Set m0.min_checks from 4 → 5.
 *
 * 2. foundations.js (Module 3):
 *    - Append m3_slack item back to m3.items (before m3_habit).
 *
 * 3. stages.js (Stage 5):
 *    - Append m5_mock item back to stage "5" items (before drills_habit).
 *
 * 4. worksheets.js:
 *    - module-exit-0: re-add section "Networking task" with slack_replies + intro_draft.
 *    - module-exit-3: re-add slack_posted + asked_feedback to "Product summary".
 *    - interview-drills or community-later: re-add mock_peers text field if desired.
 *    - EXIT_REQUIRED module-exit-0: add slack_replies, intro_draft.
 *    - EXIT_REQUIRED module-exit-3: add slack_posted back to all[].
 *    - Remove COMMUNITY_LATER_WORKSHEET from WORKSHEETS (or leave as duplicate).
 *
 * 5. checkSync.js:
 *    - module-exit-3 SYNC_MAP: asked_feedback: "m3_slack".
 *    - FILLIN_CHECK_RULES: sheet module-exit-0 → m0_slack_intro require_all [slack_replies, intro_draft].
 *    - Remove "community-later" SYNC_MAP + FILLIN_CHECK_RULES entries below.
 *
 * 6. ChecklistApp.jsx: remove Community (later) FoldSection; items live on modules again.
 */

function text(id, label, placeholder = "") {
  return { id, type: "text", label, placeholder };
}

function area(id, label, placeholder = "") {
  return { id, type: "textarea", label, placeholder };
}

function check(id, label) {
  return { id, type: "checkbox", label };
}

export const COMMUNITY_LATER = {
  id: "community_later",
  title: "Community (later)",
  blurb:
    "Optional peer Slack tasks — do when ready. These do not block Modules or Job Search.",
  worksheet_id: "community-later",
  items: [
    {
      id: "m0_slack_intro",
      label:
        "Introduced myself in Slack #0-overview-introduction and replied to 2–3 others",
    },
    {
      id: "m3_slack",
      label:
        "Posted product summary + one-liner in #3-optimizing-portfolio and asked for feedback",
    },
    {
      id: "m5_mock",
      label:
        "Asked for peer mock interviews in #5-interview-prep (or booked 2 peers)",
    },
  ],
};

/** Optional fill-ins — not in EXIT_REQUIRED. */
export const COMMUNITY_LATER_WORKSHEET = {
  id: "community-later",
  title: "Community (later)",
  stage: "community",
  blurb:
    "Optional peer Slack / mentee contact — not required to unlock modules.",
  sections: [
    {
      title: "Slack intro (#0-overview-introduction)",
      fields: [
        text("slack_replies", "Names of 2–3 people I replied to"),
        area("intro_draft", "My intro (fill-in blanks used)"),
      ],
    },
    {
      title: "Portfolio feedback (#3-optimizing-portfolio)",
      fields: [
        text("slack_posted", "Posted in #3-optimizing-portfolio (date)"),
        check("asked_feedback", "Asked for feedback"),
      ],
    },
    {
      title: "Peer mocks (#5-interview-prep)",
      fields: [
        text(
          "mock_peers",
          "Mock interview partners (2 names) or ask posted in #5-interview-prep"
        ),
      ],
    },
  ],
};
