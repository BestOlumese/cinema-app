# PROGRESS.md — Living State Tracker

> Read this file first, every session. Update it last, every session.

## Current Phase: 0 — Infrastructure & Foundation Setup

## Phase Checklist

- [ ] **Phase 0** — Infrastructure & Foundation Setup
- [ ] **Phase 1** — Core Auth & Multi-Tenancy
- [ ] **Phase 2** — Film & Session Management
- [ ] **Phase 3** — Ticketing & Booking (seat maps, tiered pricing, real-time locking)
- [ ] **Phase 4** — Box Office & POS (offline-critical)
- [ ] **Phase 5** — Payments Integration (Paystack, USSD, mobile money, cash)
- [ ] **Phase 6** — Concessions Inventory Management
- [ ] **Phase 7** — CRM & Loyalty (points, tiers, gift cards)
- [ ] **Phase 8** — Marketing & Communications (Termii, Nodemailer, campaigns)
- [ ] **Phase 9** — Group & Private Screening Bookings
- [ ] **Phase 10** — Multi-Site / Chain Management (head office, circuit reporting)
- [ ] **Phase 11** — Digital Signage
- [ ] **Phase 12** — Reporting & Analytics + AI Layer (Gemini insights/forecasting/chatbot)
- [ ] **Phase 13** — Distributor & Regulatory Reporting (NFVCB)
- [ ] **Phase 14** — Polish & Extreme Responsiveness Audit

*All 15 phases (`/phases/phase-0.md` through `/phases/phase-14.md`) have full detailed task files, acceptance criteria, and out-of-scope notes. If real-world implementation reveals a phase file needs adjustment once earlier phases are actually built, update that phase file directly and note the change in the Session Log below — don't silently deviate from what's written.*

## Session Log

### 2026-07-13 — Phase 0
- Task completed: Verified Next.js 16 project init — TS strict mode already on (`tsconfig.json`), added `src/proxy.ts` (App Router proxy, replaces deprecated `middleware.ts`) with a pass-through handler and matcher config, ready for Phase 1 tenant resolution logic.
- Verified: `tsc --noEmit` clean, `eslint` clean, dev server boots and `proxy.ts` executes on requests (confirmed via Turbopack compile log), then server stopped.
- Notes: Next unchecked Phase 0 task is styling setup — install/configure Tailwind + shadcn/ui and wire STYLE.md tokens.

### 2026-07-13 — Phase 0 (cont.)
- Task completed: Installed shadcn/ui (`components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`) and rewrote `src/app/globals.css` to wire every STYLE.md token — exact hex colors, 8/10/12px radius scale, barely-there shadows, Geist Sans/Mono — with shadcn's semantic `primary`/`accent` roles mapped onto STYLE.md's `accent`/`accent-tint` (naming collision: shadcn's "accent" = subtle hover fill, STYLE's "accent" = brand red primary action — resolved by mapping STYLE accent → shadcn primary, STYLE accent-tint → shadcn accent).
- Removed all `dark:` Tailwind variants and the `.dark` CSS block that shadcn's generator adds by default (STYLE.md §8 forbids dark mode entirely) — **note for future sessions: every `npx shadcn add <component>` will re-introduce `dark:` classes and must be stripped again.**
- Fixed generated Button radius (was `rounded-lg`/12px) down to `rounded-sm`/8px per STYLE.md §4 ("buttons... radius-sm"), and changed hover state to use the explicit `--accent-hover` token instead of an opacity trick.
- Replaced the default create-next-app placeholder in `src/app/page.tsx` with a STYLE.md-token demo (booking-ref card: mono ticket code, tint status badge, primary/outline buttons) and updated `layout.tsx` metadata.
- Verified: `tsc --noEmit` and `eslint .` clean; dev server screenshotted at 375px and 1440px via a scratch Playwright script (no project run-skill existed yet) — accent red, Geist fonts, radius, and shadows all render correctly, zero console errors, no horizontal scroll; server stopped after.
- Notes: Next unchecked Phase 0 task is Database — create Neon Postgres project and connect Drizzle ORM.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: Connected Drizzle ORM to the human's existing Neon Postgres project. Installed `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`; added `db/index.ts` (neon-http client, exported `db`), `db/schema/index.ts` (empty placeholder — first tables land in Phase 1 per `DATABASE.md`), `drizzle.config.ts` (schema/migrations paths, uses `DATABASE_URL_UNPOOLED`), and `db:generate`/`db:migrate`/`db:studio` npm scripts.
- Secrets handling: connection string supplied in chat was written directly to `.env` (confirmed already covered by the `.env*` gitignore rule, never staged/committed) — human then filled in `DATABASE_URL_UNPOOLED` directly. Any scratch scripts used to smoke-test the connection were deleted immediately after use rather than left in the scratchpad.
- Verified: a real read/write query against both the pooled and unpooled connection strings succeeded (`SELECT 1+1` → `2`, `SELECT current_database(), version()`).
- Logical replication: found `wal_level = replica` on first check — `ALTER SYSTEM` is blocked for the app role (Neon-managed setting, not a plain Postgres permission), so this required the human to flip "Enable logical replication" in the Neon Console themselves. Re-verified after: `wal_level = logical`. Confirmed via SQL, matching the Phase 0 DoD requirement.
- Notes: `DATABASE_URL_UNPOOLED` is populated in `.env` but Vercel's env var dashboard (production/preview) still needs both `DATABASE_URL` and `DATABASE_URL_UNPOOLED` added when the Deployment task runs. Next unchecked Phase 0 task: Auth — install Better Auth with the Organization plugin and define the six-tier role access-control statement structure.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: Installed Better Auth with the Organization plugin (`src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts`) and defined the access-control statement structure (`src/lib/permissions.ts`) for the six-tier role hierarchy.
- Scope decisions made with the human (asked rather than assumed, per AGENTS.md §1.7):
  - **Sign-in method**: email + password for now (Better Auth's built-in default) — final method (possibly phone/OTP via Termii) is a Phase 1 decision, not Phase 0.
  - **Platform Super-Admin**: modeled as *outside* the Organization plugin's roles entirely — it's CineSuite's own operator concept, not a role a cinema assigns its own staff, so the access-control statement only defines the other five (Cashier, Concessions Staff, Box Office, Manager, Site Admin). Exact mechanism (Better Auth's `admin` plugin vs. a platform-level field) is a Phase 1 decision.
  - **Creator role**: a cinema signing up gets assigned `siteAdmin` (not Better Auth's default `"owner"`), matching the hierarchy's top per-cinema role.
  - `team` statement key intentionally omitted — branches are modeled as our own `branch` table (DATABASE.md §1), not Better Auth's Organization "teams" feature.
  - Permission grants beyond Site Admin's baseline org-management access are structural placeholders (empty role objects) — full mapping is explicitly a Phase 1 task, not done here.
- Generated Better Auth's own schema via `npx @better-auth/cli generate` into `db/schema/auth.ts` (user/session/account/verification/organization/member/invitation), re-exported from `db/schema/index.ts`, migrated into Neon via `drizzle-kit generate` + `migrate`. Added a `@db` tsconfig path alias since `DATABASE.md` places `/db` at repo root, outside the `@/*` → `./src/*` alias shadcn established.
- Verified end-to-end against the live Neon DB: signed up a real test user via `POST /api/auth/sign-up/email`, created a real test organization via `POST /api/auth/organization/create`, confirmed the creator was assigned `role: "siteAdmin"` — then deleted all test rows afterward. `tsc --noEmit` and `eslint .` both clean.
- No RLS or `branch`/`audit_log` tables yet — those are explicitly Phase 1 scope (`concerns/security.md` RLS rule applies once tenant-scoped app tables exist, which they don't yet beyond Better Auth's own `member`/`invitation`).
- Notes: Remaining Phase 0 tasks — Deployment (Vercel), CI (GitHub Actions), Sentry, PowerSync Cloud connection, Inngest. Next up: Deployment.

<!--
Format:
### YYYY-MM-DD — Phase N
- Task completed: [description]
- Notes: [anything the next session needs to know]
-->
