import { useEffect, useState } from "react";
import {
  current_user,
  ensure_mentor_account,
  is_mentor,
  load_progress_resilient,
  save_progress,
  clear_local_progress,
  list_all_progress,
  sign_out,
  progress_storage_key,
  try_localhost_auto_sign_in,
  merge_progress_never_lose,
  progress_signal,
} from "./lib/localAuth.js";
import {
  backup_progress_to_github,
  github_backup_enabled,
  list_github_progress_backups,
  fetch_github_progress_backup,
} from "./lib/githubBackup.js";
import { empty_progress, auto_unlock_progress } from "./lib/gates.js";
import { reconcile_checks } from "./lib/checkSync.js";
import { ChecklistApp } from "./components/ChecklistApp.jsx";
import { MentorDashboard } from "./components/MentorDashboard.jsx";
import { LoginForm } from "./components/LoginForm.jsx";
import "./App.css";

function localhost_reset_seed_requested() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") return false;
  return new URLSearchParams(window.location.search).has("reset_seed");
}

async function fetch_localhost_seed(uid) {
  const url = `${import.meta.env.BASE_URL}seed-progress/${uid}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

async function resolve_mentee_progress(u) {
  const force_seed = localhost_reset_seed_requested();
  if (force_seed) clear_local_progress(u.uid);

  let loaded = force_seed ? empty_progress() : load_progress_resilient(u.uid) || empty_progress();

  if (progress_signal(loaded) < 3 && github_backup_enabled() && !force_seed) {
    try {
      const remote = await fetch_github_progress_backup(u.uid);
      if (remote && progress_signal(remote) > progress_signal(loaded)) {
        loaded = merge_progress_never_lose(loaded, remote);
      }
    } catch {
      /* keep local */
    }
  }

  // Localhost / preview: restore from committed seed if empty, or ?reset_seed=1.
  // Always merge seed checks into local so a wipe cannot drop restored portfolio ticks.
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      try {
        const seed = await fetch_localhost_seed(u.uid);
        if (seed) {
          if (force_seed || progress_signal(loaded) < 3) {
            loaded = force_seed ? seed : merge_progress_never_lose(loaded, seed);
          } else if (progress_signal(seed) > progress_signal(loaded)) {
            loaded = merge_progress_never_lose(loaded, seed);
          } else {
            // Still OR-merge any seed checks that are true (never lose restored ticks).
            loaded = merge_progress_never_lose(seed, loaded);
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  const reconciled = auto_unlock_progress(reconcile_checks(loaded));
  save_progress(u.uid, reconciled, u, { replace: force_seed });

  if (force_seed && typeof window !== "undefined") {
    const url = new URL(window.location.href);
    url.searchParams.delete("reset_seed");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }

  return reconciled;
}

async function boot_user(u, set_user, set_progress, set_rows) {
  set_user(u);
  if (!u) {
    set_progress(empty_progress());
    set_rows([]);
    return;
  }
  if (is_mentor(u.username || u.email)) {
    if (github_backup_enabled()) {
      try {
        const remote = await list_github_progress_backups();
        if (remote.length) {
          set_rows(remote);
          return;
        }
      } catch {
        /* fall back to local */
      }
    }
    set_rows(list_all_progress());
    return;
  }
  set_progress(await resolve_mentee_progress(u));
}

export default function App() {
  const [user, set_user] = useState(undefined);
  const [progress, set_progress] = useState(empty_progress());
  const [rows, set_rows] = useState([]);
  const [message, set_message] = useState("");
  const [error, set_error] = useState("");

  useEffect(() => {
    ensure_mentor_account()
      .then(() => try_localhost_auto_sign_in())
      .then((u) => boot_user(u || current_user(), set_user, set_progress, set_rows));
  }, []);

  useEffect(() => {
    if (!user || is_mentor(user.username || user.email)) return undefined;
    const key = progress_storage_key(user.uid);
    function on_storage(e) {
      if (e.key !== key || e.newValue == null) return;
      try {
        const incoming = JSON.parse(e.newValue);
        set_progress((prev) => merge_progress_never_lose(prev, incoming));
      } catch {
        /* ignore bad payload */
      }
    }
    window.addEventListener("storage", on_storage);
    return () => window.removeEventListener("storage", on_storage);
  }, [user]);

  async function handle_save(next, opts = {}) {
    if (!user) return;
    const { silent = false, force_github = false } = opts;
    try {
      // Always persist the merge result so UI + GitHub never keep a thinner wipe.
      const saved = save_progress(user.uid, next, user);
      set_progress(saved);
      if (!silent) {
        set_message("Saved.");
        setTimeout(() => set_message(""), 2000);
      }

      if (github_backup_enabled()) {
        const result = await backup_progress_to_github(user.uid, saved, user, {
          force: force_github,
        });
        if (result.ok && !result.skipped) {
          set_message(`Saved · GitHub backup ${result.day}`);
          setTimeout(() => set_message(""), 2500);
        }
      }
    } catch (err) {
      set_error(err.message || "Save failed");
    }
  }

  if (user === undefined) {
    return (
      <div className="shell">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm
        on_authed={async (u) => {
          await boot_user(u, set_user, set_progress, set_rows);
        }}
      />
    );
  }

  const mentor = is_mentor(user.username || user.email);

  return (
    <div className="shell">
      <div className="topbar">
        <span>{user.displayName || user.username || user.email}</span>
        <button
          type="button"
          onClick={async () => {
            sign_out();
            await boot_user(null, set_user, set_progress, set_rows);
          }}
        >
          Sign out
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
      {mentor ? (
        <MentorDashboard
          rows={rows}
          on_refresh={async () => {
            if (github_backup_enabled()) {
              try {
                set_rows(await list_github_progress_backups());
                return;
              } catch {
                /* local fallback */
              }
            }
            set_rows(list_all_progress());
          }}
        />
      ) : (
        <ChecklistApp
          progress={progress}
          set_progress={set_progress}
          on_save={handle_save}
          message={message}
          github_backup_ok={github_backup_enabled()}
        />
      )}
    </div>
  );
}
