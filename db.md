# Database Migration Reference

This file contains the SQL used to create and maintain the current blog CMS schema, plus the inspection queries that helped verify the live Railway database.

## Current Schema

### Tables

- `users`
- `posts`
- `comments`

### Foreign Keys

- `posts.user_id` -> `users.id`
- `comments.post_id` -> `posts.id`
- `comments.user_id` -> `users.id`

## Current Data Snapshot

The live Railway database currently has these rows:

| Table | Rows |
|---|---:|
| `users` | 5 |
| `posts` | 4 |
| `comments` | 1 |

### users

| id | name | username | created_at |
|---:|---|---|---|
| 2 | Himanshu | himanshu | 2026-04-28 17:33:11.481704 |
| 6 | shamiksha | shamikshayadav | 2026-04-28 18:36:31.113752 |
| 7 | Prateek | maxsilver | 2026-04-29 05:44:44.576629 |
| 12 | Ishpreet Singh | ishpreetsingh | 2026-04-30 07:18:35.210812 |
| 24 | Amit kumar | amit | 2026-05-05 11:37:29.539956 |

### posts

| id | title | slug | category | user_id | status | created_at |
|---:|---|---|---|---:|---|---|
| 12 | The quiet power of almost all moments | the-quiet-power-of-almost-all-moments-1777402230148 | General | 6 | published | 2026-04-28 18:50:30.47343+00 |
| 39 | Crash-Site | steal-1777547312338 | General | 12 | published | 2026-04-30 11:08:26.658761+00 |
| 70 | FROM: A Psychological Horror That Redefines Survival | from-a-psychological-horror-that-redefines-survival-1777871358469 | series | 7 | published | 2026-05-04 05:09:23.528291+00 |
| 72 | Why Dogs Are More Than Just Pets | why-dogs-are-more-than-just-pets-1777871850188 | animals | 7 | published | 2026-05-04 05:17:08.638155+00 |

### comments

| id | post_id | user_id | body_preview | created_at |
|---:|---:|---:|---|---|
| 4 | 70 | 7 | On episode 3 | 2026-05-04 05:36:28.91722+00 |

## Rebuild SQL

Run the statements below in order when recreating the schema in a fresh Postgres database.

```sql
-- USERS TABLE FIRST (important for FK)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  avatar TEXT,
  bio TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) UNIQUE;

-- POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  slug TEXT,
  category TEXT,
  thumbnail TEXT,
  description TEXT,
  content TEXT,
  tags TEXT[],
  parent_post TEXT,
  access TEXT,
  edit_access TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS parent_post TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS access TEXT DEFAULT 'Anyone';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edit_access TEXT DEFAULT 'Logged-in Users';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Optional Cleanup Queries

Use these only if you need to tidy duplicate or stale rows in an existing database.

```sql
-- Keep only one row per slug in posts
DELETE FROM posts
WHERE id NOT IN (
  SELECT MIN(id)
  FROM posts
  GROUP BY slug
);

-- Remove a known bad comment row
DELETE FROM comments
WHERE user_id = 7 AND post_id = 72;
```

## Inspection Queries

These queries are useful when checking the current live schema.

```sql
-- List public tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- List foreign keys in public schema
SELECT
  tc.table_name AS table_name,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Row counts
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM public.users
UNION ALL
SELECT 'posts', COUNT(*) FROM public.posts
UNION ALL
SELECT 'comments', COUNT(*) FROM public.comments
ORDER BY table_name;

-- Small row snapshot for reference
SELECT id, name, username, created_at
FROM public.users
ORDER BY id
LIMIT 5;

SELECT id, title, slug, category, user_id, status, created_at
FROM public.posts
ORDER BY id
LIMIT 5;

SELECT id, post_id, user_id, LEFT(body, 120) AS body_preview, created_at
FROM public.comments
ORDER BY id
LIMIT 5;
```

## Copying This Database Elsewhere

If you want the same data and schema in another app, the simplest path is:

1. Recreate the schema with the SQL above.
2. Point the app at the new database with `DATABASE_URL`.
3. Track the schema in Hasura or your new ORM after the tables exist.
4. If you need the actual rows, export and import with `pg_dump` / `psql` or a Railway backup.

## Notes

- `users` must exist before `posts` because `posts.user_id` references `users.id`.
- `posts` must exist before `comments` because `comments.post_id` references `posts.id`.
- The live database currently has one FK per relationship, so Hasura can track them cleanly.