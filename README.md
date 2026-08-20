# User Management

Take-home assessment app — paginated/searchable/sortable user list, a detail view with order metrics pulled from the relational data, and CRUD, all against the supplied Postgres dataset.

## Setup

1. Start the db (from the pack root, one level up from here):
   ```bash
   docker compose up -d
   ```
2. Copy the env file:
   ```bash
   cp .env.example .env.local
   ```
   Default value already matches the docker-compose credentials.
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
   http://localhost:3000 redirects to `/users`.

To reset the dataset: `docker compose down && docker compose up -d --force-recreate` (see the pack's top-level README).

## How it's put together

**Stack**: Next.js App Router, TypeScript, `pg` directly — no ORM. Went with node-postgres over Kysely/Drizzle mainly so the SQL in `data/queries.ts` is the actual SQL that runs, nothing generated. Would reach for Kysely first if this grew past a handful of query shapes.

**Folder layout**: everything user-related lives under `src/features/users/`:
- `data/` — raw SQL (`queries.ts`, `mutations.ts`), row-to-domain mapping (`mappers.ts`), pg error classification (`db-errors.ts`)
- `services/` — business logic that isn't SQL: assembling the detail-page metrics, DB-backed form validation
- `actions.ts` — the server actions (create/update/delete)
- `components/` — server components, presentational
- `client/` — the 3 things that actually need `"use client"`: the form, the delete button, the page-size select

`src/app/` is routing only — each page fetches via the feature module and renders. `src/lib/` is the actual cross-cutting stuff (db pool, date/currency formatting).

**DB connection**: one `pg.Pool`, cached on `globalThis` so dev-mode hot reload doesn't spawn a new pool on every save.

**Pagination/search/sort**: all in SQL — `LIMIT`/`OFFSET`, parameterized `ILIKE` for search, sort column picked from a whitelist map so the URL never controls a raw SQL identifier. Every sort also tiebreaks on `id`, because sorting by role (only 3 distinct values across 1,500 rows) with no tiebreaker was giving duplicate rows across pages — Postgres doesn't guarantee stable order over a non-unique `ORDER BY`. Checked it directly against the db: without the tiebreaker, page 2 of a role-sorted list had 13 of its 20 rows already shown on page 1.

Went with offset pagination over cursor-based since the UI needs page numbers / jump-to-page, and 1,500 rows doesn't need anything fancier. `OFFSET` gets expensive at real scale (has to walk and discard N rows first) — cursor pagination would be the fix there, at the cost of losing page numbers.

**Detail page metrics**: six separate queries (status counts, spend, favourite category, top product, recent orders, notes), run in parallel and assembled in `user-metrics.service.ts`. The aggregation (sums, group-bys) happens in SQL since only the summary rows need to cross the wire. The shaping on top of that — filling in zero-counts, computing the average, picking a value tier — happens in TS because it's not reducing any more data, just presenting what SQL already computed.

Spend-based numbers (total spend, average order value, favourite category, top product) skip `CANCELLED` orders — never fulfilled, shouldn't count as spend. Order counts and the status breakdown still include them since that's about activity, not revenue. That's an assumption I made, the schema doesn't say either way.

**Extra metric**: customer value tier (None/Bronze/Silver/Gold/Platinum) bucketed from total spend, shown as a badge. A raw dollar figure needs the reader to already know what counts as "a lot" for this business — a tier is glanceable. Computed in TS, thresholds are just a judgement call.

**Validation**: zod schema in `validation.ts` for shape (required names, valid email, positive company id, valid role, DOB not in the future). DB-backed checks — email uniqueness, company exists — are separate since zod stays sync. The actual guard against two requests racing past that check is still Postgres's `UNIQUE` constraint on email; failures from that get told apart by SQLSTATE code, not by matching error message text.

**Delete**: hard delete. Orders/order_items/notes cascade from users in the supplied schema, so deleting a user takes their order history with it. A system with real financial records would probably soft-delete instead — kept it a hard delete here since that's what the schema as given does.

**Caching**: every `/users` route is `force-dynamic` — always current, simplest correct default for something this DB-backed and URL-driven. One thing left uncached: `listCompanies()` reruns on every visit to the create/edit forms even though companies barely change. Fine at 40 rows, first thing to cache if this needed to scale.

**Bonus stuff skipped**: no auth, no intercepting-route modal, no cursor pagination, no optimistic UI, no state management library (nothing here needs one — it's all server-rendered + URL state).

**What I'd do with more time**: there are no automated tests right now. I'd also cache the company list, swap the native `confirm()` on delete for a proper dialog (it works, just not great to look at or test against), and add a toast/banner after create or edit instead of relying on the redirect alone.
