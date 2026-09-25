import {
  progress_signal,
  merge_progress_never_lose,
  looks_like_wipe,
} from "./progressMerge.js";

export { progress_signal, merge_progress_never_lose, looks_like_wipe };

const ACCOUNTS_KEY = "mentorship_accounts_v2";
const SESSION_KEY = "mentorship_session_v2";
const PROGRESS_PREFIX = "mentorship_progress_v2_";
const PROGRESS_TEST_PREFIX = "mentorship_progress_test_v2_";
const DAILY_BACKUP_PREFIX = "mentorship_daily_backup_v1_";
const DAILY_TEST_BACKUP_PREFIX = "mentorship_daily_backup_test_v1_";
const DAILY_KEEP_DAYS = 30;

const mentor_username = (import.meta.env.VITE_MENTOR_USERNAME || "mentor").toLowerCase();
const mentor_password = import.meta.env.VITE_MENTOR_PASSWORD || "MentorshipMentor2026";
const mentor_name = import.meta.env.VITE_MENTOR_NAME || "Mentor";

/** Seeded accounts for local auth. Passwords are for localhost testing only. */
export const SEEDED_USERS = [
  {
    username: "mentor",
    displayName: mentor_name,
    password: mentor_password,
    salt: "seed_salt_mentor_v1",
    role: "mentor",
  },
  {
    username: "melissaR",
    displayName: "Melissa R",
    password: "sd7gerh4*",
    salt: "seed_salt_melissaR_v2",
    role: "mentee",
  },
];

/** Default mentee used for localhost auto sign-in / Playwright. */
export const LOCALHOST_TEST_USER = SEEDED_USERS.find((u) => u.username === "melissaR");

function normalize_username(value) {
  return String(value || "").trim();
}

function username_key(value) {
  return normalize_username(value).toLowerCase();
}

function uid_from_username(username) {
  return `local_${username_key(username).replace(/[^a-z0-9]/g, "_")}`;
}

async function sha256_hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hash_password(password, salt) {
  return sha256_hex(`${salt}:${password}`);
}

function read_accounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function write_accounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function get_mentor_username() {
  return mentor_username;
}

export function is_mentor(username_or_email) {
  if (!username_or_email) return false;
  return username_key(username_or_email) === mentor_username;
}

export async function ensure_mentor_account() {
  await ensure_seeded_accounts();
}

export async function ensure_seeded_accounts() {
  const accounts = read_accounts();
  let changed = false;

  for (const user of SEEDED_USERS) {
    const key = username_key(user.username);
    const password_hash = await hash_password(user.password, user.salt);
    const existing = accounts[key];
    // Always resync seeded accounts so password/salt changes in the repo take effect.
    if (
      !existing ||
      existing.password_hash !== password_hash ||
      existing.salt !== user.salt ||
      existing.username !== user.username ||
      existing.displayName !== user.displayName ||
      existing.role !== user.role
    ) {
      accounts[key] = {
        username: user.username,
        displayName: user.displayName,
        salt: user.salt,
        password_hash,
        role: user.role,
        seeded: true,
        created_at: existing?.created_at || new Date().toISOString(),
      };
      changed = true;
    }
  }

  if (changed) write_accounts(accounts);
}

export async function sign_in({ username, password }) {
  await ensure_seeded_accounts();
  const key = username_key(username);
  if (!key) throw new Error("Username is required.");
  const accounts = read_accounts();
  const account = accounts[key];
  if (!account) throw new Error("No account found for that username.");
  const password_hash = await hash_password(String(password || "").trim(), account.salt);
  if (password_hash !== account.password_hash) throw new Error("Incorrect password.");

  const user = {
    uid: uid_from_username(account.username),
    username: account.username,
    // kept for older progress/backup fields
    email: account.username,
    displayName: account.displayName,
    role: account.role || (is_mentor(account.username) ? "mentor" : "mentee"),
  };
  // localStorage so worksheet/guide tabs opened with target=_blank stay signed in
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  sessionStorage.removeItem(SESSION_KEY);
  return user;
}

export function sign_out() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function current_user() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function is_localhost_host() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/**
 * On localhost only: if no session, sign in as the test mentee (or ?as=mentor).
 * Never runs on GitHub Pages / production hosts.
 */
export async function try_localhost_auto_sign_in() {
  if (!is_localhost_host()) return current_user();
  if (current_user()) return current_user();

  await ensure_seeded_accounts();
  let want = LOCALHOST_TEST_USER;
  try {
    const as = new URLSearchParams(window.location.search).get("as");
    if (as === "mentor") {
      want = SEEDED_USERS.find((u) => u.role === "mentor") || want;
    }
  } catch {
    /* ignore */
  }
  if (!want) return null;
  return sign_in({ username: want.username, password: want.password });
}

function today_key() {
  return new Date().toISOString().slice(0, 10);
}

/** Playwright / test tabs use an isolated progress key so real mentee data is never wiped. */
export function test_storage_isolated() {
  try {
    if (typeof window === "undefined") return false;
    if (window.__MENTORSHIP_TEST_ISOLATE__) return true;
    if (navigator.webdriver) return true;
  } catch {
    /* ignore */
  }
  return false;
}

function progress_prefix() {
  return test_storage_isolated() ? PROGRESS_TEST_PREFIX : PROGRESS_PREFIX;
}

function daily_prefix() {
  return test_storage_isolated() ? DAILY_TEST_BACKUP_PREFIX : DAILY_BACKUP_PREFIX;
}

export function progress_storage_key(uid) {
  return progress_prefix() + uid;
}

function is_thin_progress(progress) {
  return progress_signal(progress) < 3;
}

/** Keep up to 30 daily local copies so a wiped main key can be restored. */
export function save_daily_local_backup(uid, progress) {
  if (!uid || !progress) return;
  try {
    const day = today_key();
    const key = daily_backup_key(uid);
    const map = JSON.parse(localStorage.getItem(key) || "{}") || {};
    map[day] = {
      ...progress,
      backed_up_at: new Date().toISOString(),
      backup_day: day,
    };
    const days = Object.keys(map).sort();
    while (days.length > DAILY_KEEP_DAYS) {
      delete map[days.shift()];
    }
    localStorage.setItem(key, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

/** Newest daily snapshot with the most checklist signal. */
export function load_best_daily_backup(uid) {
  try {
    const map = JSON.parse(localStorage.getItem(daily_backup_key(uid)) || "{}") || {};
    let best = null;
    let best_score = -1;
    for (const day of Object.keys(map).sort().reverse()) {
      const snap = map[day];
      const score = progress_signal(snap);
      if (score > best_score) {
        best = snap;
        best_score = score;
      }
    }
    return best_score > 0 ? best : null;
  } catch {
    return null;
  }
}

export function load_progress(uid) {
  try {
    const raw = localStorage.getItem(progress_prefix() + uid);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Drop main progress + daily backups for a uid (localhost seed reset). */
export function clear_local_progress(uid) {
  if (!uid) return;
  try {
    localStorage.removeItem(progress_prefix() + uid);
    localStorage.removeItem(daily_backup_key(uid));
  } catch {
    /* ignore */
  }
}

/**
 * Load progress, falling back to the strongest local daily backup if the
 * main key is missing or nearly empty (e.g. accidental clear / new profile).
 * Always OR-merges richer daily snapshot checks into the result.
 */
export function load_progress_resilient(uid) {
  const main = load_progress(uid);
  const daily = load_best_daily_backup(uid);

  // Main looks like a wipe vs daily → heal and write back.
  if (main && daily && looks_like_wipe(daily, main)) {
    const merged = merge_progress_never_lose(daily, main);
    try {
      localStorage.setItem(progress_prefix() + uid, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
    return merged;
  }

  if (main && !is_thin_progress(main)) {
    if (daily && progress_signal(daily) > progress_signal(main)) {
      return merge_progress_never_lose(main, daily);
    }
    if (daily) return merge_progress_never_lose(daily, main);
    return main;
  }
  if (daily && progress_signal(daily) > progress_signal(main)) {
    const merged = merge_progress_never_lose(main, daily);
    try {
      localStorage.setItem(progress_prefix() + uid, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
    return merged;
  }
  return main;
}

/**
 * Save progress. Never lets a thinner wipe erase checked items.
 * Pass `{ replace: true }` only for explicit reset_seed.
 */
export function save_progress(uid, progress, profile, opts = {}) {
  const existing = load_progress(uid);
  const merged =
    opts.replace || test_storage_isolated()
      ? progress
      : merge_progress_never_lose(existing, progress);
  const checks = { ...(merged.checks || {}) };
  // Keep test anchors off the real mentee key (Playwright uses the isolated prefix).
  if (!test_storage_isolated()) {
    for (const id of Object.keys(checks)) {
      if (id.startsWith("_test")) delete checks[id];
    }
  }
  const payload = {
    ...merged,
    checks,
    username: profile.username || profile.email || "",
    email: profile.username || profile.email || "",
    displayName: profile.displayName || "",
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(progress_prefix() + uid, JSON.stringify(payload));
  save_daily_local_backup(uid, payload);
  return payload;
}

export function list_all_progress() {
  const rows = [];
  const prefix = progress_prefix();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    const uid = key.slice(prefix.length);
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (data && !is_mentor(data.username || data.email)) {
        rows.push({ uid, ...data });
      }
    } catch {
      /* skip */
    }
  }
  rows.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return rows;
}
