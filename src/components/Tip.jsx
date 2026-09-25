import { glossary_def, tip_parts } from "../lib/glossary.js";

/** Single hover/focus definition chip. */
export function Tip({ term, children }) {
  const def = glossary_def(term);
  if (!def) return <>{children}</>;
  return (
    <span className="tip" data-tip={term} tabIndex={0}>
      <span className="tip-word">{children}</span>
      <span className="tip-bubble" role="tooltip" aria-hidden="true">
        {def}
      </span>
    </span>
  );
}

/** Auto-wrap known glossary terms inside a plain string. */
export function TipText({ text }) {
  const parts = tip_parts(text);
  return (
    <>
      {parts.map((p, i) =>
        p.type === "tip" ? (
          <Tip key={`${p.term}-${i}`} term={p.term}>
            {p.text}
          </Tip>
        ) : (
          <span key={`t-${i}`}>{p.text}</span>
        ),
      )}
    </>
  );
}
