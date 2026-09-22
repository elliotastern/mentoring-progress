import { useEffect, useState } from "react";
import {
  current_user,
  ensure_mentor_account,
  is_mentor,
  load_progress,
  save_progress,
  list_all_progress,
  sign_out,
} from "./lib/localAuth.js";
import {
  backup_progress_to_github,
  github_backup_enabled,
  list_github_progress_backups,
} from "./lib/githubBackup.js";
import { empty_progress } from "./lib/gates.js";
import { ChecklistApp } from "./components/ChecklistApp.jsx";
import { MentorDashboard } from "./components/MentorDashboard.jsx";
import { LoginForm } from "./components/LoginForm.jsx";
import "./App.css";

async function boot_user(u, set_user, set_progress, set_rows) {
  set_user(u);
  if (!u) {
    set_progress(empty_progress());
    set_rows([]);
    return;
  }
  if (is_mentor(u.email)) {
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
  set_progress(load_progress(u.uid) || empty_progress());
}

export default function App() {
  const [user, set_user] = useState(undefined);
  const [progress, set_progress] = useState(empty_progress());
  const [rows, set_rows] = useState([]);
  const [message, set_message] = useState("");
  const [error, set_error] = useState("");

  useEffect(() => {
    ensure_mentor_account().then(() => {
      boot_user(current_user(), set_user, set_progress, set_rows);
    });
  }, []);

  async function handle_save(next, opts = {}) {
    if (!user) return;
    const { silent = false, force_github = false } = opts;
    try {
      save_progress(user.uid, next, user);
      if (!silent) {
        set_message("Saved locally.");
        setTimeout(() => set_message(""), 2000);
      } else {
        set_message("Autosaved.");
        setTimeout(() => set_message(""), 1200);
      }

      if (github_backup_enabled()) {
        const result = await backup_progress_to_github(user.uid, next, user, {
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

  const mentor = is_mentor(user.email);

  return (
    <div className="shell">
      <div className="topbar">
        <span>{user.displayName || user.email}</span>
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
        />
      )}
    </div>
  );
}
