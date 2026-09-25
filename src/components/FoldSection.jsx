import { useState } from "react";
import { get_fold, set_fold } from "../lib/foldPrefs.js";
import { TipText } from "./Tip.jsx";

/**
 * Persistent <details> section with triangle summary.
 * Remembers open/closed in localStorage via foldPrefs.
 */
export function FoldSection({
  id,
  title,
  badge = null,
  meta = null,
  defaultOpen = true,
  className = "",
  testId,
  children,
  summaryClassName = "fold-summary",
}) {
  const [open, set_open] = useState(() => get_fold(id, defaultOpen));

  return (
    <details
      className={`fold-section ${className}`.trim()}
      data-fold-id={id}
      data-testid={testId || undefined}
      open={open}
      onToggle={(e) => {
        const next = e.currentTarget.open;
        set_open(next);
        set_fold(id, next);
      }}
    >
      <summary className={summaryClassName}>
        <span className="fold-summary-main">
          <span className="fold-title">
            {typeof title === "string" ? <TipText text={title} /> : title}
          </span>
        </span>
        {(badge || meta) ? (
          <span className="fold-summary-end">
            {meta}
            {badge}
          </span>
        ) : null}
        <span className="fold-tri" aria-hidden="true" />
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
