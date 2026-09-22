const ACCOUNTS_KEY = "dataship_accounts_v2";
const SESSION_KEY = "dataship_session_v2";
const PROGRESS_PREFIX = "dataship_progress_v2_";

const mentor_username = (import.meta.env.VITE_MENTOR_USERNAME || "mentor").toLowerCase();
const mentor_password = import.meta.env.VITE_MENTOR_PASSWORD || "DataShipMentor2026";
const mentor_name = import.meta.env.VITE_MENTOR_NAME || "Mentor";

/** Add mentees here in the repo — they appear on Sign in after deploy. */
const SEEDED_USERS = [
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
    salt: "seed_salt_melissaR_v1",
    role: "mentee",
  },
];

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
    if (
      !existing ||
      existing.password_hash !== password_hash ||
      existing.salt !== user.salt ||
      existing.username !== user.username
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
  const password_hash = await hash_password(password, account.salt);
  if (password_hash !== account.password_hash) throw new Error("Incorrect password.");

  const user = {
    uid: uid_from_username(account.username),
    username: account.username,
    // kept for older progress/backup fields
    email: account.username,
    displayName: account.displayName,
    role: account.role || (is_mentor(account.username) ? "mentor" : "mentee"),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function sign_out() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function current_user() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function load_progress(uid) {
  try {
    const raw = localStorage.getItem(PROGRESS_PREFIX + uid);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save_progress(uid, progress, profile) {
  const payload = {
    ...progress,
    username: profile.username || profile.email || "",
    email: profile.username || profile.email || "",
    displayName: profile.displayName || "",
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(PROGRESS_PREFIX + uid, JSON.stringify(payload));
  return payload;
}

export function list_all_progress() {
  const rows = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(PROGRESS_PREFIX)) continue;
    const uid = key.slice(PROGRESS_PREFIX.length);
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
