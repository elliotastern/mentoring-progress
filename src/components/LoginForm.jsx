import { useState } from "react";
import { sign_in, get_mentor_username } from "../lib/localAuth.js";

export function LoginForm({ on_authed }) {
  const [username, set_username] = useState("");
  const [password, set_password] = useState("");
  const [error, set_error] = useState("");
  const [busy, set_busy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    set_error("");
    set_busy(true);
    try {
      const user = await sign_in({ username, password });
      on_authed(user);
    } catch (err) {
      set_error(err.message || "Login failed");
    } finally {
      set_busy(false);
    }
  }

  return (
    <div className="shell login">
      <div className="login-card">
        <p className="eyebrow">DataShip mentorship</p>
        <h1>Job Search Progress</h1>
        <p className="sub">
          Sign in with the username your mentor gave you. Checks and fill-ins unlock the next
          section.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => set_username(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => set_password(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Please wait…" : "Sign in"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
        <p className="hint">
          Mentors: sign in as <code>{get_mentor_username()}</code> (password in app README). Accounts
          are created in the repo, not on this page.
        </p>
      </div>
    </div>
  );
}
