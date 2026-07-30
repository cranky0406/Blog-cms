# Blog CMS — shadcn/ui Integration

## Files Changed in This Update

| File | What changed |
|---|---|
| `vite.config.js` | Added `@` path alias |
| `jsconfig.json` | NEW — enables `@/` imports in JSX |
| `src/index.css` | Added shadcn CSS variables (`:root` + `.dark`) |
| `src/main.jsx` | Added `<Toaster />` from sonner |
| `src/components/ProfileMenu.jsx` | Uses `DropdownMenu`, `Avatar` |
| `src/pages/admin/Login.jsx` | Uses `Card`, `Input`, `Label`, `Button` |
| `src/pages/admin/Profile.jsx` | Uses `Card`, `Input`, `Label`, `Textarea`, `Avatar`, `Badge` |
| `src/pages/admin/Posts.jsx` | Uses `Table`, `Badge`, `Button`, `Dialog`, `Select` |
| `src/pages/admin/Dashboard.jsx` | Uses `Card`, `Button`, `Badge` |

---

## Setup Steps (run in order)

### 1. Run shadcn init
```bash
cd blog-cms/frontend
npx shadcn@latest init --preset b5J5RBjYQ --template vite
```
When prompted: pick **New York** style, **Slate** color, and **Yes** to CSS variables.

### 2. Install required shadcn components
```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add separator
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add select
npx shadcn@latest add sonner
npx shadcn@latest add table
```

Or install all at once:
```bash
npx shadcn@latest add button input label card badge avatar separator textarea dialog dropdown-menu select sonner table
```

### 3. Install @types/node (for vite.config.js path import)
```bash
npm i -D @types/node
```

### 4. Replace files
Copy each updated file from this folder into your `frontend/` directory at the same relative path.

> ⚠️ After `shadcn init` edits your `index.css`, replace it with the one in this package — it merges the shadcn variables with your existing dark mode setup.

### 5. Run dev server
```bash
npm run dev
```

---

## shadcn component map

| shadcn component | Used in |
|---|---|
| `Button` | Login, Posts, Profile, Dashboard |
| `Input` | Login, Profile |
| `Label` | Login, Profile |
| `Card / CardContent / CardHeader` | Login, Profile, Dashboard |
| `Badge` | Posts, Profile, Dashboard |
| `Avatar / AvatarImage / AvatarFallback` | Profile, ProfileMenu |
| `Separator` | Profile |
| `Textarea` | Profile |
| `Dialog / DialogContent / DialogFooter` | Posts (delete confirm) |
| `DropdownMenu` | ProfileMenu |
| `Select / SelectTrigger / SelectContent` | Posts (sort filter) |
| `Toaster` (sonner) | main.jsx — app-wide |
| `Table / TableHeader / TableBody / TableRow` | Posts |

---

## Hasura setup on `8080`

The repo's `docker-compose.yml` now starts Hasura on `http://localhost:8080` and can point it at either:

- the local Postgres container, or
- your Railway Postgres database if you provide the env vars below.

Set these in the root `.env` file before running `docker compose up`:

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require
HASURA_GRAPHQL_DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require
HASURA_GRAPHQL_METADATA_DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require
HASURA_GRAPHQL_ADMIN_SECRET=your-secret
```

Notes:

- `DATABASE_URL` is for the Node backend in `backend/db.js`.
- The two `HASURA_*_URL` values should point to the same Railway database.
- If you leave them unset, compose falls back to the local `postgres` service.
- After `docker compose up`, open the Hasura console at `http://localhost:8080`.

---

## Current Database Snapshot

The live Railway database currently has 3 tables and 3 foreign keys:

| Table | Rows | Notes |
|---|---:|---|
| `users` | 5 | Registered users and profile data |
| `posts` | 4 | Blog posts linked to authors |
| `comments` | 1 | Post comments linked to a post and a user |

### Relationships

| From | To | Constraint |
|---|---|---|
| `posts.user_id` | `users.id` | `posts_user_id_fkey` |
| `comments.post_id` | `posts.id` | `comments_post_id_fkey` |
| `comments.user_id` | `users.id` | `comments_user_id_fkey` |

### Sample Rows

The rows below are a small reference snapshot from the live database. Sensitive fields such as passwords and emails are intentionally omitted.

#### users

| id | name | username | created_at |
|---:|---|---|---|
| 2 | Himanshu | himanshu | 2026-04-28 17:33:11.481704 |
| 6 | shamiksha | shamikshayadav | 2026-04-28 18:36:31.113752 |
| 7 | Prateek | maxsilver | 2026-04-29 05:44:44.576629 |
| 12 | Ishpreet Singh | ishpreetsingh | 2026-04-30 07:18:35.210812 |
| 24 | Amit kumar | amit | 2026-05-05 11:37:29.539956 |

#### posts

| id | title | slug | category | user_id | status | created_at |
|---:|---|---|---|---:|---|---|
| 12 | The quiet power of almost all moments | the-quiet-power-of-almost-all-moments-1777402230148 | General | 6 | published | 2026-04-28 18:50:30.47343+00 |
| 39 | Crash-Site | steal-1777547312338 | General | 12 | published | 2026-04-30 11:08:26.658761+00 |
| 70 | FROM: A Psychological Horror That Redefines Survival | from-a-psychological-horror-that-redefines-survival-1777871358469 | series | 7 | published | 2026-05-04 05:09:23.528291+00 |
| 72 | Why Dogs Are More Than Just Pets | why-dogs-are-more-than-just-pets-1777871850188 | animals | 7 | published | 2026-05-04 05:17:08.638155+00 |

#### comments

| id | post_id | user_id | body_preview | created_at |
|---:|---:|---:|---|---|
| 4 | 70 | 7 | On episode 3 | 2026-05-04 05:36:28.91722+00 |

### Recreate or Connect Later

If you want to recreate this schema in another app or environment, use the ordered SQL in [db.md](db.md). The key flow is:

1. Create `users` first.
2. Create `posts` next so `posts.user_id` can reference `users.id`.
3. Create `comments` last so both `post_id` and `user_id` foreign keys resolve.
4. Apply the `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements for compatibility with existing data.
5. Point the new app at the same Postgres database with `DATABASE_URL`.
