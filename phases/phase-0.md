# Phase 0 — Infrastructure & Foundation Setup

## Goal

Get a deployed, empty, correctly-configured skeleton running — no product features yet. Every subsequent phase builds on this without needing to revisit infrastructure decisions.

## Tasks

1. **Initialize the Next.js 16 project**
   - App Router, TypeScript strict mode, Turbopack (default in 16)
   - `proxy.ts` scaffolded (not `middleware.ts`) for future tenant resolution
2. **Install and configure styling**
   - Tailwind CSS + shadcn/ui
   - Wire up every token from `STYLE.md` (colors, radius, shadows, fonts) — no dark mode config
3. **Database**
   - Create Neon Postgres project
   - Connect Drizzle ORM
   - Confirm logical replication is enabled (`wal_level = logical`) — required for PowerSync later
4. **Auth**
   - Install Better Auth with the Organization plugin
   - Define the access-control statement matching the six-tier role hierarchy (Cashier, Concessions Staff, Box Office, Manager, Site Admin, Platform Super-Admin) — structure only, full permission mapping happens in Phase 1
5. **Deployment**
   - Vercel project connected to the repo
   - Environment variables scaffolded (start `ENV.md` here — every variable added to the project must be documented there as it's added, not after)
6. **CI**
   - GitHub Actions: lint, typecheck, test on every PR
7. **Error monitoring**
   - Sentry connected, confirmed capturing a test error
8. **Offline sync infrastructure**
   - PowerSync Cloud project created, connected to Neon per the official Neon+Drizzle integration guide
   - No sync rules defined yet (that starts in Phase 4) — just confirm the connection works
9. **Background jobs**
   - Inngest project connected, confirmed a test function runs

## Out of Scope for This Phase

- No film/session/ticketing/POS features
- No real UI screens beyond a placeholder page proving the design tokens render correctly
- No PowerSync sync rules yet (connection only)
- No payment integration yet

## Definition of Done

- [ ] App deploys successfully to Vercel
- [ ] A placeholder page renders using STYLE.md tokens correctly (accent red, Geist fonts, correct radius/shadows visible)
- [ ] A test user can sign up via Better Auth and a test organization is created
- [ ] Drizzle can read/write to Neon Postgres
- [ ] CI pipeline passes on a test PR
- [ ] Sentry captures a deliberately-thrown test error
- [ ] PowerSync Cloud shows a successful connection to the Neon database
- [ ] Inngest runs a test background function successfully
- [ ] `ENV.md` exists and lists every environment variable used so far

**Do not proceed to Phase 1 until this checklist is complete AND the human has approved with `APPROVED: PHASE 0`.**
