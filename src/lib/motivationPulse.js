/** Mentor-facing motivation pulse from Module exits + Weekly Fuel. */

function trim(value) {
  return String(value || "").trim();
}

function sheet(progress, id) {
  return progress?.worksheets?.[id] || {};
}

function first_filled(...values) {
  for (const value of values) {
    const text = trim(value);
    if (text) return text;
  }
  return "";
}

export function motivation_pulse(progress) {
  const m0 = sheet(progress, "module-exit-0");
  const m1 = sheet(progress, "module-exit-1");
  const weekly = sheet(progress, "weekly-loop");

  const importance = first_filled(m0.importance);
  const confidence = first_filled(m1.confidence, m0.confidence);
  const commitment = first_filled(
    weekly.fuel_willing,
    m1.commitment_7d,
    m0.commitment_7d,
  );
  const path_value = first_filled(weekly.fuel_value, m1.path_value);
  const fuel_reason = trim(weekly.fuel_reason);
  const fuel_next = trim(weekly.fuel_next_30m);
  const fuel_filled_after_miss = Boolean(
    trim(weekly.balance_status_pros) ||
      trim(weekly.balance_apply_pros) ||
      (trim(weekly.fuel_willing) &&
        (trim(weekly.balance_status_cons) || trim(weekly.balance_apply_cons))),
  );

  return {
    importance,
    confidence,
    commitment,
    path_value,
    fuel_reason,
    fuel_next,
    fuel_filled_after_miss,
    has_pulse: Boolean(importance || confidence || commitment),
  };
}
