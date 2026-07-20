# PROGRESS.md — Living State Tracker

> Read this file first, every session. Update it last, every session.

## Current Phase: 1 — Core Auth & Multi-Tenancy

## Phase Checklist

- [x] **Phase 0** — Infrastructure & Foundation Setup — `APPROVED: PHASE 0` received 2026-07-20
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

### 2026-07-19 — Phase 0 (cont.)
- Task completed: Deployment. Created the GitHub repo (`https://github.com/BestOlumese/cinema-app`, human's call) and pushed the first real commit (everything from today — previously only the create-next-app initial commit existed locally). Human ran `vercel login`; from there I linked the Vercel project (`bests-projects-ccd0566e/cinema-app`, connected to the GitHub repo) and populated all 5 env vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`) across Production/Preview/Development — `BETTER_AUTH_SECRET` uses a distinct generated value per environment, never reusing the local dev one.
- Deployed to production twice (second deploy to bake in the `NEXT_PUBLIC_*` var, which is inlined at build time) — confirmed the live URL (`https://cinema-app-psi-sage.vercel.app`) renders the STYLE.md placeholder page correctly, and confirmed Better Auth actually works end-to-end against the live Neon DB in production (signed up a real test user via the deployed API, then deleted it).
- Two asked-not-assumed decisions: used the human's own GitHub repo (didn't invent one), and confirmed Vercel CLI auth via `vercel whoami` rather than assuming login succeeded.
- Open item logged in `ENV.md`: Preview's `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` are pinned to the production alias as a placeholder since real preview deployments get unique per-deploy URLs — needs a `trustedOrigins` wildcard before auth is tested on a preview deployment (Phase 1).
- Notes: Next unchecked Phase 0 task is CI — GitHub Actions workflow for lint/typecheck/test on every PR.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: CI. There was no test suite yet, so asked the human whether to scaffold Vitest with a real test or a no-op test step — chose to scaffold: installed Vitest, added `vitest.config.ts` (with `@`/`@db` aliases matching `tsconfig.json`), and wrote `src/lib/permissions.test.ts` — a real structural test of the access-control statement (resource/action shape, the five org-scoped roles exist, Site Admin's baseline permissions authorize correctly, the other four roles' cinema-specific permissions correctly do NOT authorize yet since that's Phase 1's job). Not a placeholder — it actually documents and guards this session's permission design.
- Added `.github/workflows/ci.yml` (lint → typecheck → test, triggered on every PR and on push to main/master).
- Verified: pushed to GitHub and confirmed via the Actions API that the workflow actually ran and completed with `conclusion: success` — not just "the YAML looks right."
- Notes: Remaining Phase 0 tasks — Sentry, PowerSync Cloud connection, Inngest. Next up: Sentry.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: Sentry. Human provided the DSN from their existing Sentry project. Wired `@sentry/nextjs` via the current `instrumentation.ts`/`src/instrumentation-client.ts` convention (not the deprecated `sentry.*.config.ts` files — those don't work under Turbopack, which this project uses by default), plus `global-error.tsx` for React render errors and `withSentryConfig` in `next.config.ts`.
- Verified for real, not just "should work": added a temporary route that deliberately threw, ran it locally with Sentry debug logging on, confirmed the log showed `Captured error event` → `Flushing events...` → `Done flushing events`, then removed the debug flag and the temporary route.
- Source map upload (`SENTRY_AUTH_TOKEN`) intentionally left unconfigured — flagged as an open item in `ENV.md` rather than guessed at, since it needs a separate auth token the human hasn't provided. Error capture works fully without it.
- Added `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` to Vercel across all three environments and redeployed production.
- Caught mid-task: the CI push for this commit failed on the `npm ci` step (exit 1, no further detail visible — GitHub's job-log API 403'd without admin/write access to the repo). Reproduced `npm ci` locally against the exact committed lockfile and it succeeded cleanly, so this looks like a transient CI runner issue rather than a real lockfile problem — re-verifying on the next push rather than assuming it's fixed.
- Notes: Remaining Phase 0 tasks — PowerSync Cloud connection, Inngest. Next up: PowerSync. **Also confirm the CI run on the next push actually goes green before treating the CI task as done** — the last one failed and needs re-verification.

### 2026-07-19 — Phase 0 (cont.)
- CI went red 4 times in a row after the Sentry commit — root-caused and fixed, documented in detail since this was a genuinely tricky one:
  1. `npm ci` failed in CI (but not locally) with "Missing: webpack@5.108.4 from lock file" — `@sentry/webpack-plugin` (pulled in transitively by `@sentry/nextjs`) declares `webpack >=5.0.0` as a **required** (non-optional) peer dependency, but local npm wasn't writing a lockfile entry for it.
  2. First fix attempt — explicitly adding `webpack` as a devDependency — traded one bug for another: it pulled in `ajv-keywords@5` (needs `ajv@^8.8.2`), and npm's hoisting incorrectly deduped it against ESLint's `ajv@6.15.0`, producing an actually-invalid tree (`npm ls ajv` failed with `ELSPROBLEMS`) that `npm install` silently accepted but `npm ci` correctly rejected.
  3. Also discovered a real environment mismatch along the way: CI runs `npm 11.16.0` (bundled with the workflow's `node-version: 24`), local was `10.9.2` — upgraded local npm to match, since different npm majors resolve/record peer deps differently enough to produce divergent lockfiles from the identical source files.
  4. Real fix: we don't actually need webpack installed at all — Sentry's webpack integration no-ops under Turbopack (confirmed via the SDK's own doc comments), so the peer requirement is pure install-time bookkeeping with zero runtime effect. Added `.npmrc` with `legacy-peer-deps=true`, which stops npm from auto-installing it and removes the conflicting `ajv-keywords` subtree entirely. Verified clean: `npm ci`, `npm ls ajv`, `tsc --noEmit`, `eslint`, `vitest`, and `next build` all pass; CI confirmed green (`conclusion: success`) via direct API check, not assumed.
- Human provided a fine-grained GitHub PAT (Actions: read-only, scoped to this repo) so future CI failures can be self-diagnosed directly instead of round-tripping error text through the human — used only for reading job logs, never for pushing/writing. Not stored in the repo; only used in-session.
- CI task (from the earlier log entry) is now genuinely confirmed done, not just "should be fine."
- Notes: Remaining Phase 0 tasks — PowerSync Cloud connection, Inngest. Next up: PowerSync.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: PowerSync Cloud connection. Human signed up and created a PowerSync instance, no prior account. Before handing over a connection string, set up Postgres-side prerequisites directly on Neon: a dedicated least-privilege role (`powersync_role` — `REPLICATION` + `SELECT` on `public` schema only, not the `neondb_owner` admin credentials) and a publication (`powersync`).
- **Caught mid-setup**: my first publication used `FOR ALL TABLES`, which — because Postgres publications aren't schema-scoped by default — also swept in a `neon_auth` schema neither of us knew existed on this Neon project. Investigated before proceeding: it's Neon's own "Neon Auth" platform feature, auto-provisioned, completely separate from our own Better Auth setup, including a `jwks` table shaped to hold private key material (0 rows, so nothing was actually exposed, but it would have replicated to PowerSync/box office SQLite devices if ever populated). Stopped, asked the human what to do with it — decision: leave Neon Auth alone/ignore it, don't build against it. Recreated the publication scoped to `FOR TABLES IN SCHEMA public` only, verified `powersync_role` has no `USAGE` grant on `neon_auth` at all. Documented the discovery in `DATABASE.md` §0 so nobody mistakes `neon_auth` for one of our own tables later.
- Human connected PowerSync to Neon using the scoped role — confirmed successful in the PowerSync console. Cross-checked from the Postgres side (`pg_replication_slots`/`pg_stat_replication`) — no active logical slot yet, which is expected: PowerSync's connection test validates credentials/connectivity without creating a persistent replication slot until Sync Rules are deployed (Phase 4, correctly out of scope today).
- Added `POWERSYNC_INSTANCE_URL`/`NEXT_PUBLIC_POWERSYNC_URL` to `.env` and Vercel (all 3 environments). `POWERSYNC_JWT_PRIVATE_KEY`/`POWERSYNC_JWT_KID` deliberately left undocumented — not needed until Phase 4.
- Notes: Remaining Phase 0 task — Inngest (background jobs, confirm a test function runs). That's the last one before the full Phase 0 Definition of Done self-check.

### 2026-07-19 — Phase 0 (cont.)
- Task completed: Inngest. Human had no prior account, signed up, provided an Event Key and Signing Key — first paste had both fields identical (a copy-paste mistake), caught and asked for a re-check before wiring anything up rather than proceeding with a clearly-wrong credential.
- Added `src/lib/inngest.ts` (client), `src/app/api/inngest/route.ts` (Next.js serve handler), `src/inngest/functions.ts` (currently an empty array — first real function lands with whichever Phase needs one).
- Verified for real: temporarily added a test function, ran the Next.js dev server with `INNGEST_DEV=1` plus the real keys, ran `npx inngest-cli dev` pointed at it, sent a test event, and confirmed via the dev server's own `/v1/events/{id}/runs` API that the run's `status` was `"Completed"` — not just "the HTTP calls looked right." Removed the test function afterward, re-verified `tsc`/`eslint` clean.
- Added `INNGEST_EVENT_KEY`/`INNGEST_SIGNING_KEY` to Vercel (all 3 environments), redeployed production, confirmed `/api/inngest` correctly returns `401 Unauthorized` for an unsigned GET (expected/correct production behavior, not a bug).
- **Closed the one remaining DoD gap that had been silently skipped**: phase-0.md says "CI pipeline passes on a **test PR**" — every CI verification so far had been via direct pushes to master, never an actual `pull_request` event. Opened a real PR (used the Inngest work itself as the content, rather than a throwaway change), had the human merge it, then verified independently via the GitHub API: `event: pull_request`, `conclusion: success`. Synced master, deleted the test branch both locally and on origin.
- **Full Phase 0 Definition of Done self-check — all 9 items verified, checklist updated in `phases/phase-0.md`:**
  - [x] App deploys successfully to Vercel
  - [x] Placeholder page renders STYLE.md tokens correctly
  - [x] Test user signs up via Better Auth, test org created
  - [x] Drizzle reads/writes to Neon
  - [x] CI passes on a test PR
  - [x] Sentry captures a deliberately-thrown error
  - [x] PowerSync shows a successful Neon connection
  - [x] Inngest runs a test function successfully
  - [x] `ENV.md` lists every env var used
- Notes: **Phase 0 self-check is complete but NOT yet approved.** Per AGENTS.md §0.7, Phase 1 cannot start — not even scaffolding — until the human types the exact approval string `APPROVED: PHASE 0`. Waiting on that before touching anything Phase 1-scoped (Core Auth & Multi-Tenancy).

### 2026-07-20 — Phase 1
- `APPROVED: PHASE 0` received from the human — exact string, per AGENTS.md §0.7. Phase 1 (Core Auth & Multi-Tenancy) begins. Human asked to work one task at a time, asking questions whenever something is unclear rather than assuming.
- Starting Task 1: self-serve signup flow (account + organization creation in one flow, no manual approval gate).

### 2026-07-20 — Phase 1 (cont.)
- Task completed: self-serve signup flow, plus a sign-in page (not one of Phase 1's 7 listed tasks, but the human explicitly asked for it alongside signup — a login-less signup flow felt incomplete).
- Design decisions made *with* the human, not assumed — asked multiple rounds since they wanted design questions surfaced: split-screen auth layout (adapted from the human's first choice — a solid accent-red panel — because that directly conflicted with STYLE.md's "no large accent fills" rule; landed on a neutral `--muted` panel with a small accent-red rule instead), text wordmark only (no logo asset exists), auto-generated org slug (not an editable field), `/signin` route naming, mobile behavior (brand panel hidden below `md`, not stacked), confirm-password field + eye toggle + sonner toasts + password strength meter (all explicitly requested), and a placeholder ToS checkbox added now despite no ToS/Privacy Policy documents existing yet (human's call).
- Installed TanStack Query, react-hook-form, zod, sonner — all named in `ARCHITECTURE.md`'s stack summary since Phase 0 but never actually installed until this task needed them.
- Added shadcn's `input`/`checkbox`/`field`/`sonner`/`separator` components — stripped `dark:` classes and non-STYLE.md radii from all of them (same pattern flagged in Phase 0: every `shadcn add` reintroduces dark-mode styling that has to be removed). Also removed `next-themes`, which `sonner.tsx` pulled in for theme-switching we'll never use — hardcoded `theme="light"` instead.
- **Two real bugs caught during testing** (not just cosmetic — verified with actual Playwright automation against the live dev server, not just visual screenshots):
  1. `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` pointed at port 3000 in `.env`, but local testing runs on 3911 — caused `ERR_CONNECTION_REFUSED` on every auth API call. Test-environment mismatch, not a product bug; documented here so it doesn't cause confusion in a future debugging session.
  2. A fresh sign-in doesn't carry over the `activeOrganizationId` that gets set at org-creation time — dashboard showed a generic "CineSuite" fallback instead of the cinema's name after signing back in. Fixed in `dashboard/page.tsx` by falling back to the user's first `member` row when the session has no active org. Good enough for the single-cinema case Phase 1 targets; real multi-org switching is Task 7.
  3. (Non-bug, worth noting for future sessions): a `Checkbox` built on `@base-ui/react` renders its visible interactive element as a `<span role="checkbox">` with an auto-generated id, while any `id` prop passed to it lands on a separate visually-hidden native `<input>` used for label association/form semantics. A `<label for="that-id">` click *does* correctly delegate through to the visible checkbox (verified via a raw DOM `.click()`), but Playwright's `getByText(...).click()` didn't reliably trigger it in automation — real users are unaffected, this only tripped up the test script.
- Verified end-to-end for real: full signup → org creation → `/dashboard` redirect with correct org name and success toast; sign-in with correct/incorrect credentials; unauthenticated `/dashboard` redirect to `/signin`. All test users/orgs deleted from Neon afterward.
- Added Vitest unit tests for the two new pure-logic utilities this task introduced (`slugify`, `getPasswordStrength`) — 8 new tests, all passing alongside Phase 0's existing 5.
- **Deliberately not done yet**: formal checked-in Playwright test files. `phases/phase-1.md`'s own DoD bundles "Playwright coverage on signup + invitation flow" as one line item, and the invitation flow (Task 4) doesn't exist yet — writing Playwright infra now for signup alone risks being reworked once invitation exists. Asked the human: confirmed to wait until Task 4 exists, then set up Playwright once and cover both flows together in one pass.
- `tsc --noEmit`, `eslint .`, `npm ls ajv`, and the full Vitest suite (13/13) all clean. Not yet re-verified against `concerns/responsive.md`'s full breakpoint table (768px/1024px specifically) — only 375px/1440px checked so far.
- Notes: Next up — Task 2 (tenancy model choice at signup: independent vs. chain/head-office). This will need a `tenancyType` column added to the `organization` table (documented in `DATABASE.md` §1 but not yet implemented — Better Auth's own generated schema doesn't have it).

### 2026-07-20 — Phase 1 (cont.)
- Task completed: tenancy model choice at signup (independent vs. chain/head-office), with the data model supporting branches being added later without a migration.
- `tenancyType` added via Better Auth's `organization` plugin `schema.organization.additionalFields` config in `src/lib/auth.ts` — **not** by hand-editing the generated `db/schema/auth.ts` (regenerated via the CLI instead, per the standing rule in that file's own header comment). Client-side type inference for the new field required `inferOrgAdditionalFields<typeof auth>()` in `auth-client.ts`, using a `import type { auth }` type-only import so no server code (Drizzle, DB credentials) leaks into the client bundle — verified by grepping the actual `.next/static` build output for server-only strings, not just assumed safe.
- Added `db/schema/branch.ts` (new table, not part of Better Auth's generated schema) — every organization gets exactly one branch at signup (its single site if independent, its head office if chain; more branches added later is Phase 10's job). Branch creation happens server-side in an `afterCreateOrganization` hook, not a second client-side call, so it can't succeed-then-fail as two disjoint steps.
- **Corrected a real error in `DATABASE.md`** discovered while wiring the `branch` table: the original draft typed `organizationId` as `uuid`, but Better Auth's actual generated `organization.id` is `text` — a `uuid` foreign key column would never have matched. Fixed in `branch` and (preemptively, since it's not built yet) `audit_log`'s `organizationId`/`actorUserId` columns, and added a note to `DATABASE.md` §0 explaining the exception for future sessions.
- Design decisions made with the human: RLS deferred to Task 5 (consolidated pass, matching how the phase file itself groups "every tenant-scoped table created so far"); tenancy choice presented as two selectable cards (not a plain radio list); chain selection asks for a head-office name (not silently reusing the org name) — passed through Better Auth's existing `metadata` field rather than inventing a new column, since it's exactly what that field is for.
- Verified for real against the live Neon DB, not just UI screenshots: both signup paths (independent and chain) end-to-end, then queried the actual `organization`/`branch` rows directly — confirmed `tenancy_type`, `metadata.branchName`, and the created branch's name all match exactly what was submitted (chain: branch gets the typed head-office name; independent: branch falls back to the org name). All test rows deleted afterward.
- `tsc --noEmit`, `eslint .`, `npm run build` (production build, to specifically check for client-bundle leakage), and the full Vitest suite all clean.
- Notes: Next up — Task 3 (full role/permission mapping for all six roles). Task 4 (staff invitation flow) after that is when the deferred Playwright setup happens.

<!--
Format:
### YYYY-MM-DD — Phase N
- Task completed: [description]
- Notes: [anything the next session needs to know]
-->
