# Job Application Tracker

A personal job application tracker built with Next.js, Turso (SQLite), and Drizzle ORM. Deployed on Vercel.

Single-user app with simple email/password auth — no sign-up needed. Designed for tracking your own job search.

## Features

- **Dashboard** — summary cards (total, active, offers, response rate), status breakdown chart, application timeline, recent activity
- **Applications list** — table and kanban views with search, status filter
- **Status pipeline** — Applied → Phone Screen → Interview → Technical → Offer → Accepted (plus Rejected/Withdrawn/Ghosted)
- **Notes & reminders** — add timestamped notes per application, flag as reminders with due dates
- **Salary tracking** — min/max salary range with currency
- **Single-user auth** — hardcoded credentials via env vars, JWT session in HttpOnly cookies

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- **Database**: [Turso](https://turso.tech) (managed libSQL/SQLite)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Auth**: [jose](https://github.com/panva/jose) (JWT)
- **UI**: [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- **Charts**: [Recharts](https://recharts.org)
- **Deployment**: [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Turso](https://turso.tech) account (free tier works)

### 1. Clone and install

```bash
git clone https://github.com/the-oneironaut/job-application-tracker.git
cd job-application-tracker
npm install
```

### 2. Set up Turso

```bash
turso db create job-tracker
turso db show job-tracker --url     # copy the URL
turso db tokens create job-tracker  # copy the token
```

### 3. Configure environment

Copy `.env.local` and fill in your values:

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token

# Auth (single user)
AUTH_EMAIL=your@email.com
AUTH_PASSWORD_HASH=<sha256-hash-of-your-password>

# JWT
JWT_SECRET=some-random-secret-string
```

Generate your password hash:

```bash
npm run hash-password your-password
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to Turso |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate migrations |
| `npm run hash-password <pw>` | SHA-256 hash a password |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo on [Vercel](https://vercel.com/new)
3. Add these environment variables in the Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_EMAIL`
   - `AUTH_PASSWORD_HASH`
   - `JWT_SECRET`
4. Deploy — Vercel auto-detects Next.js

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── login/page.tsx              # Login page
│   ├── api/auth/                   # Auth API routes
│   └── (dashboard)/
│       ├── layout.tsx              # Sidebar layout
│       ├── page.tsx                # Dashboard
│       └── applications/           # CRUD pages + server actions
├── components/                     # UI components
├── db/
│   ├── schema.ts                   # Drizzle schema
│   └── index.ts                    # DB client
├── lib/
│   └── auth.ts                     # JWT + password utils
└── proxy.ts                        # Auth guard
```

## License

MIT
