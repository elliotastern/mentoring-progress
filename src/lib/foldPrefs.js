const STORAGE_KEY = "mentorship_fold_v1";
const LEGACY_MAP = {
  fold_rolefit: "rolefit",
  fold_foundations: "foundations",
};

let migrated = false;

function read_all() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function write_all(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** One-time: copy sessionStorage fold_* into localStorage map. */
export function migrate_fold_prefs() {
  if (migrated) return;
  migrated = true;
  const map = read_all();
  let changed = false;
  for (const [old_key, new_id] of Object.entries(LEGACY_MAP)) {
    if (map[new_id] !== undefined) continue;
    try {
      const v = sessionStorage.getItem(old_key);
      if (v === "1" || v === "0") {
        map[new_id] = v === "1";
        changed = true;
        sessionStorage.removeItem(old_key);
      }
    } catch {
      /* ignore */
    }
  }
  if (changed) write_all(map);
}

export function get_fold(id, fallback) {
  migrate_fold_prefs();
  const map = read_all();
  if (Object.prototype.hasOwnProperty.call(map, id)) return Boolean(map[id]);
  return fallback;
}

export function set_fold(id, open) {
  migrate_fold_prefs();
  const map = read_all();
  map[id] = Boolean(open);
  write_all(map);
}
