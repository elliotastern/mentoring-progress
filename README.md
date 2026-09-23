# Job Search Progress Web App

Live site: **https://elliotastern.github.io/mentoring-progress/**

Username/password login (no self-signup). Gated stages. Mentor dashboard.

## Login

- **Mentees:** username + password your mentor assigns (e.g. `melissaR`).
- **Mentor:** `mentor` / `MentorshipMentor2026`

## Add a mentee (in this repo)

Edit `src/lib/localAuth.js` → `SEEDED_USERS`, add:

```js
{
  username: "theirUsername",
  displayName: "Their Name",
  password: "their-password",
  salt: "seed_salt_theirUsername_v1",
  role: "mentee",
},
```

Deploy (push to `mentoring-progress` `main`). They sign in on the live site — there is no Create account button.

## Autosave

- Browser autosave as they check boxes.
- Once/day GitHub backup to private `elliotastern/mentoring` → `progress-backups/`.
