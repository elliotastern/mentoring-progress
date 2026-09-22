const ACCOUNTS_KEY = "dataship_accounts_v1";
const SESSION_KEY = "dataship_session_v1";
const PROGRESS_PREFIX = "dataship_progress_v1_";

const mentor_email = (
  import.meta.env.VITE_MENTOR_EMAIL || "mentor@dataship.local"
).toLowerCase();
const mentor_password = import.meta.env.VITE_MENTOR_PASSWORD || "DataShipMentor2026";
const mentor_name = import.meta.env.VITE_MENTOR_NAME || "Mentor";

const SEEDED_MENTEES = [
  {
    email: "melissar@dataship.local",
    login: "melissaR",
    displayName: "Melissa R",
    password: "sd7gerh4*",
    salt: "seed_salt_melissaR_v1",
  },
];

function uid_from_email(email) {
  return `local_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

function normalize_login(email_or_login) {
  const raw = String(email_or_login || "").trim();
  if (!raw) return "";
  if (raw.includes("@")) return raw.toLowerCase();
  return `${raw.toLowerCase()}@dataship.local`;
}

async function sha256_hex(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function random_salt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
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

export function get_mentor_email() {
  return mentor_email;
}

export function is_mentor(email) {
  if (!email) return false;
  return email.toLowerCase() === mentor_email;
}

export async function ensure_mentor_account() {
  await ensure_seeded_accounts();
}

export async function ensure_seeded_accounts() {
  const accounts = read_accounts();
  let changed = false;

  if (!accounts[mentor_email]) {
    const salt = random_salt();
    accounts[mentor_email] = {
      email: mentor_email,
      displayName: mentor_name,
      salt,
      password_hash: await hash_password(mentor_password, salt),
      role: "mentor",
      created_at: new Date().toISOString(),
    };
    changed = true;
  }

  for (const mentee of SEEDED_MENTEES) {
    const email = mentee.email.toLowerCase();
    const password_hash = await hash_password(mentee.password, mentee.salt);
    const existing = accounts[email];
    if (!existing || existing.password_hash !== password_hash || existing.salt !== mentee.salt) {
      accounts[email] = {
        email,
        displayName: mentee.displayName,
        salt: mentee.salt,
        password_hash,
        role: "mentee",
        login: mentee.login,
        seeded: true,
        created_at: existing?.created_at || new Date().toISOString(),
      };
      changed = true;
    }
  }

  if (changed) write_accounts(accounts);
}

export async function create_account({ name, email, password }) {
  const clean_email = normalize_login(email);
  const clean_name = String(name || "").trim();
  if (!clean_name) throw new Error("Name is required.");
  if (!clean_email || !clean_email.includes("@")) {
    throw new Error("Valid email or username is required.");
  }
  if (String(password || "").length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }
  if (clean_email === mentor_email) throw new Error("That email is reserved for the mentor.");

  await ensure_seeded_accounts();
  const accounts = read_accounts();
  if (accounts[clean_email]) {
    throw new Error("An account with that email already exists. Sign in instead.");
  }

  const salt = random_salt();
  const password_hash = await hash_password(password, salt);
  accounts[clean_email] = {
    email: clean_email,
    displayName: clean_name,
    salt,
    password_hash,
    role: "mentee",
    created_at: new Date().toISOString(),
  };
  write_accounts(accounts);

  const user = {
    uid: uid_from_email(clean_email),
    email: clean_email,
    displayName: clean_name,
    role: "mentee",
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function sign_in({ email, password }) {
  await ensure_seeded_accounts();
  const clean_email = normalize_login(email);
  const accounts = read_accounts();
  const account = accounts[clean_email];
  if (!account) throw new Error("No account found for that email.");
  const password_hash = await hash_password(password, account.salt);
  if (password_hash !== account.password_hash) throw new Error("Incorrect password.");

  const user = {
    uid: uid_from_email(clean_email),
    email: clean_email,
    displayName: account.displayName,
    role: account.role || (is_mentor(clean_email) ? "mentor" : "mentee"),
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
    email: profile.email || "",
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
      if (data && !is_mentor(data.email)) {
        rows.push({ uid, ...data });
      }
    } catch {
      /* skip */
    }
  }
  rows.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return rows;
}
