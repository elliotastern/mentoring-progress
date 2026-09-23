import { useEffect, useRef, useState } from "react";

export function ProgressPulse({ percent, label, compact = false }) {
  const prev = useRef(percent);
  const [bump, set_bump] = useState(false);

  useEffect(() => {
    if (percent > prev.current) {
      set_bump(true);
      const t = setTimeout(() => set_bump(false), 450);
      prev.current = percent;
      return () => clearTimeout(t);
    }
    prev.current = percent;
    return undefined;
  }, [percent]);

  const clamped = Math.max(0, Math.min(100, percent || 0));

  return (
    <div className={`progress-pulse ${compact ? "compact" : ""} ${bump ? "bump" : ""}`}>
      <div className="progress-pulse-meta">
        <span className="progress-pulse-label">{label}</span>
        <span className={`progress-pulse-pct ${bump ? "pop" : ""}`}>{clamped}%</span>
      </div>
      <div className="progress-pulse-track" aria-hidden="true">
        <div className="progress-pulse-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
