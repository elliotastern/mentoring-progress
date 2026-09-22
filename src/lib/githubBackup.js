const OWNER = import.meta.env.VITE_GITHUB_BACKUP_OWNER || "elliotastern";
const REPO = import.meta.env.VITE_GITHUB_BACKUP_REPO || "mentoring";
const TOKEN = import.meta.env.VITE_GITHUB_BACKUP_TOKEN || "";
const PATH_PREFIX = "progress-backups";

function today_key() {
  return new Date().toISOString().slice(0, 10);
}

function backup_stamp_key(uid) {
  return `dataship_github_backup_day_${uid}`;
}

export function github_backup_enabled() {
  return Boolean(TOKEN && OWNER && REPO);
}

function api_headers() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${TOKEN}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function file_path(uid) {
  const safe = String(uid).replace(/[^a-zA-Z0-9_-]/g, "_");
  return `${PATH_PREFIX}/${safe}.json`;
}

async function get_existing_sha(path) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, { headers: api_headers() });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub read failed (${res.status}): ${text.slice(0, 160)}`);
  }
  const data = await res.json();
  return data.sha || null;
}

export async function backup_progress_to_github(uid, progress, profile, { force = false } = {}) {
  if (!github_backup_enabled()) {
    return { ok: false, skipped: true, reason: "GitHub backup not configured" };
  }
  const day = today_key();
  const stamp = localStorage.getItem(backup_stamp_key(uid));
  if (!force && stamp === day) {
    return { ok: true, skipped: true, reason: "Already backed up today" };
  }

  const path = file_path(uid);
  const payload = {
    uid,
    email: profile.email || "",
    displayName: profile.displayName || "",
    highest_unlocked: progress.highest_unlocked || "0",
    checks: progress.checks || {},
    answers: progress.answers || {},
    skill_level: progress.skill_level || "",
    weekly_tallies: progress.weekly_tallies || {},
    weekly_of: progress.weekly_of || "",
    backed_up_at: new Date().toISOString(),
    backup_day: day,
  };
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  const sha = await get_existing_sha(path);
  const body = {
    message: `progress backup ${day} — ${profile.email || uid}`,
    content,
    branch: "master",
  };
  if (sha) body.sha = sha;

  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: api_headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub backup failed (${res.status}): ${text.slice(0, 200)}`);
  }

  localStorage.setItem(backup_stamp_key(uid), day);
  return { ok: true, skipped: false, path, day };
}

export async function list_github_progress_backups() {
  if (!github_backup_enabled()) return [];
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH_PREFIX}?ref=master`;
  const res = await fetch(url, { headers: api_headers() });
  if (res.status === 404) return [];
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub list failed (${res.status}): ${text.slice(0, 160)}`);
  }
  const files = await res.json();
  if (!Array.isArray(files)) return [];

  const rows = [];
  for (const file of files) {
    if (!file.name?.endsWith(".json") || !file.download_url) continue;
    const file_res = await fetch(file.download_url, { headers: api_headers() });
    if (!file_res.ok) continue;
    const data = await file_res.json();
    rows.push({
      uid: data.uid || file.name.replace(/\.json$/, ""),
      email: data.email || "",
      displayName: data.displayName || "",
      highest_unlocked: data.highest_unlocked || "0",
      updated_at: data.backed_up_at || "",
      answers: data.answers || {},
    });
  }
  rows.sort((a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")));
  return rows;
}
