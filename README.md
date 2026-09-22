# Job Search Progress Web App

Live site: **https://elliotastern.github.io/mentoring-progress/**

Email/password login. Gated stages. Mentor dashboard.

## Login

- **Mentees:** Create account or Sign in.
- **Mentor:** `mentor@dataship.local` / `DataShipMentor2026`

## Autosave

- Checkmarks and answers **autosave** in the browser as you go.
- **Once per day**, the app also backs up that mentee’s progress to the private GitHub repo `elliotastern/mentoring` under `progress-backups/` (free GitHub API). Unlock / Save now can force an immediate backup.

## Local develop

```bash
cd progress-web
cp .env.example .env
# optional: VITE_GITHUB_BACKUP_TOKEN=ghp_... with repo contents write
npm install
npm run dev
```

## Deploy

Repo: `elliotastern/mentoring-progress`. Pages deploys on push to `main`. Set Actions secret `PROGRESS_BACKUP_TOKEN` (PAT with access to private `mentoring` contents) for daily GitHub backups.
