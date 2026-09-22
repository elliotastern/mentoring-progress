import { useState } from "react";
import { create_account, sign_in, get_mentor_email } from "../lib/localAuth.js";

export function LoginForm({ on_authed }) {
  const [mode, set_mode] = useState("signin");
  const [name, set_name] = useState("");
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [error, set_error] = useState("");
  const [busy, set_busy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    set_error("");
    set_busy(true);
    try {
      const user =
        mode === "create"
          ? await create_account({ name, email, password })
          : await sign_in({ email, password });
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
          Sign in to unlock stages. Checks and fill-ins are required before the next section opens.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "signin" ? "tab active" : "tab"}
            onClick={() => set_mode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "create" ? "tab active" : "tab"}
            onClick={() => set_mode("create")}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === "create" ? (
            <label>
              <span>Name</span>
              <input
                value={name}
                onChange={(e) => set_name(e.target.value)}
                autoComplete="name"
                required
              />
            </label>
          ) : null}
          <label>
            <span>Email or username</span>
            <input
              type="text"
              value={email}
              onChange={(e) => set_email(e.target.value)}
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
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="primary" disabled={busy}>
            {busy ? "Please wait…" : mode === "create" ? "Create account" : "Sign in"}
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
        <p className="hint">
          Mentors: sign in with <code>{get_mentor_email()}</code> (password in app README).
        </p>
      </div>
    </div>
  );
}
