# Job Application Tracker — Project Plan

## Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Turso (managed libSQL/SQLite)
- **ORM**: Drizzle ORM
- **Auth**: Hardcoded single-user, JWT via `jose`, HttpOnly cookies
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Deployment**: Vercel

---

## 1. Scaffold Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npx shadcn@latest init
npm install drizzle-orm @libsql/client jose recharts date-fns
npm install -D drizzle-kit
```

---

## 2. Set Up Turso Database

```bash
turso db create job-tracker
turso db tokens create job-tracker
```

Environment variables (`.env.local` locally, Vercel env vars for prod):

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
AUTH_EMAIL=your@email.com
AUTH_PASSWORD_HASH=<sha256-hash>
JWT_SECRET=<random-secret>
```

---

## 3. Database Schema

### `applications` table

| Column           | Type    | Notes                                                                                              |
| ---------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `id`             | text    | UUID, primary key                                                                                  |
| `company`        | text    | not null                                                                                           |
| `role`           | text    | not null                                                                                           |
| `status`         | text    | applied · phone_screen · interview · technical · offer · accepted · rejected · withdrawn · ghosted |
| `dateApplied`    | text    | ISO date                                                                                           |
| `salaryMin`      | integer | nullable                                                                                           |
| `salaryMax`      | integer | nullable                                                                                           |
| `salaryCurrency` | text    | default "USD"                                                                                      |
| `location`       | text    | nullable                                                                                           |
| `url`            | text    | nullable (job posting link)                                                                        |
| `createdAt`      | text    | ISO timestamp                                                                                      |
| `updatedAt`      | text    | ISO timestamp                                                                                      |

### `notes` table

| Column          | Type    | Notes                                     |
| --------------- | ------- | ----------------------------------------- |
| `id`            | text    | UUID, primary key                         |
| `applicationId` | text    | FK → applications.id, cascade delete      |
| `content`       | text    | not null                                  |
| `isReminder`    | integer | boolean (0/1)                             |
| `reminderDate`  | text    | nullable ISO date                         |
| `createdAt`     | text    | ISO timestamp                             |

### Drizzle config (`drizzle.config.ts`)

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
```

Apply schema: `npx drizzle-kit push`

---

## 4. Authentication

Single user — no sign-up, no users table.

- **Env vars**: `AUTH_EMAIL`, `AUTH_PASSWORD_HASH`, `JWT_SECRET`
- **`src/lib/auth.ts`**: `signToken()`, `verifyToken()` using `jose`; `verifyPassword()` using SHA-256
- **`src/app/api/auth/login/route.ts`**: POST — validate credentials → sign JWT → set HttpOnly/Secure/SameSite=Lax cookie
- **`src/app/api/auth/logout/route.ts`**: POST — clear auth cookie
- **`src/middleware.ts`**: Check JWT cookie on all routes except `/login` and public assets; redirect to `/login` if invalid
- **`src/lib/session.ts`**: `getSession()` for server components to read session from cookie

---

## 5. UI Layout

### Route Structure

```
src/app/
├── layout.tsx                          # Root layout (Tailwind, fonts, dark mode)
├── (auth)/
│   └── login/page.tsx                  # Login page
├── (dashboard)/
│   ├── layout.tsx                      # Authenticated layout with sidebar
│   ├── page.tsx                        # Dashboard (analytics)
│   └── applications/
│       ├── page.tsx                    # Applications list (table + kanban)
│       ├── new/page.tsx                # Create application form
│       ├── [id]/page.tsx               # View/edit application + notes
│       └── actions.ts                  # Server Actions for mutations
```

### Sidebar Navigation

- **Dashboard** — chart icon
- **Applications** — list icon
- **Add New** — plus icon

### shadcn/ui Components

```bash
npx shadcn@latest add button input card badge dialog dropdown-menu table select textarea tabs toast form calendar popover sheet
```

---

## 6. Dashboard Page

`src/app/(dashboard)/page.tsx`

- **Summary cards**: Total applications, Active (non-terminal), Offers, Response rate %
- **Status breakdown**: Bar or pie chart (Recharts) — count by status
- **Timeline**: Line/area chart — applications per week/month
- **Recent activity**: Last 5 applications added/updated
- Data fetched via server components → Drizzle queries

---

## 7. Applications List Page

`src/app/(dashboard)/applications/page.tsx`

Two view modes (tabs):

### Table View
- Sortable columns: company, role, status, date applied, salary
- Filterable by status
- Searchable by company/role

### Kanban View
- Columns per status
- Cards showing company + role
- Click-to-change-status (or lightweight DnD)

"Add Application" button opens dialog/sheet.

---

## 8. Application Detail & Forms

### Create: `src/app/(dashboard)/applications/new/page.tsx`
- Form with all fields from schema

### Detail: `src/app/(dashboard)/applications/[id]/page.tsx`
- View/edit all fields
- Visual status pipeline indicator
- Notes section below:
  - List of notes with timestamps
  - "Add note" form
  - Toggle for reminder with date picker

---

## 9. Server Actions

`src/app/(dashboard)/applications/actions.ts`

```ts
"use server"

createApplication(formData)
updateApplication(id, formData)
deleteApplication(id)
updateStatus(id, newStatus)
addNote(applicationId, content, isReminder, reminderDate)
deleteNote(noteId)
```

- All actions verify JWT session before executing
- Use `revalidatePath()` after mutations

---

## 10. Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set env vars in Vercel dashboard:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_EMAIL`
   - `AUTH_PASSWORD_HASH`
   - `JWT_SECRET`
4. Framework preset: Next.js (auto-detected)
5. No special build config needed

---

## Verification Checklist

- [ ] `npm run dev` — login, CRUD, dashboard charts work against Turso
- [ ] Unauthenticated requests redirect to `/login`
- [ ] Login sets cookie, logout clears it, middleware blocks protected routes
- [ ] Deploy to Vercel → add data → redeploy → data persists
- [ ] `npx drizzle-kit push` applies schema changes cleanly
- [ ] Mobile responsive — sidebar collapses to hamburger menu

---

## Key Design Decisions

| Decision                            | Rationale                                                        |
| ----------------------------------- | ---------------------------------------------------------------- |
| Turso over Cloudflare D1            | Pairs natively with Vercel + Next.js, no adapter complexity      |
| Drizzle over Prisma                 | Better SQLite/Turso support, lighter bundle, no engine binary    |
| `jose` over `jsonwebtoken`          | Works in all runtimes (Edge, Node), no native dependencies       |
| Server Actions over API routes      | Less boilerplate, automatic form handling, built-in revalidation |
| Notes as separate table             | Multiple timestamped notes per application vs. single text field |
| No sign-up flow                     | Single user — credentials set via env vars, no users table       |
