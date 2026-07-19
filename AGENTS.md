# AGENTS.md — Master Guide (READ THIS FIRST, EVERY SESSION)

> **Project:** Nigeria Cinema Management SaaS (working name: CineSuite) — a multi-tenant platform for cinemas of all sizes: booking, box office, concessions, CRM, and back-office management.
> **Stack summary:** Next.js 16 (App Router, TS strict) · Tailwind + shadcn/ui · TanStack Query v5 + TanStack Table · Zustand · Better Auth (Organization plugin) · Neon Postgres + Drizzle · PowerSync (offline POS) · Pusher/Ably (real-time seat locking) · Inngest (background jobs) · Google Gemini (AI layer) · Paystack + Termii + Nodemailer + UploadThing · Vercel · Vitest + Playwright · Sentry.
> Full detail: `ARCHITECTURE.md`. Design system: `STYLE.md`. Schema: `DATABASE.md`. Product scope: `PRODUCT_REQUIREMENTS.md`.

---

## 0. The Session Loop (NON-NEGOTIABLE)

Every single work session follows this exact loop. No exceptions.

1. **Read `PROGRESS.md`** — find the current phase and the next unchecked task.
2. **Read the current phase file** in `/phases/` — confirm the task, its acceptance criteria, and what is explicitly OUT of scope.
3. **Read every file in `/concerns/`** — these rules apply to every task, always, regardless of phase.
4. **Do exactly ONE task** (or one coherent group the phase file explicitly bundles).
5. **Verify** the task against its acceptance criteria AND every concern checklist before considering it done.
6. **Update `PROGRESS.md`** — check the box, write a one-line dated log entry.
7. **STOP** at any phase boundary. A phase is complete only when (a) its Definition of Done self-check passes AND (b) the human has typed exact approval: `APPROVED: PHASE N`. Until both happen, do not touch any Phase N+1 task — not even "just scaffolding" or "just a preview."

## 1. The Golden Rules

1. **Never skip ahead.** Phase order is fixed: 0 → 1 → 2 → ... Later phases cannot start early, even partially.
2. **Never invent features.** If it's not in `PRODUCT_REQUIREMENTS.md`, the current phase file, or explicitly requested by the human in this session, don't build it. If something seems missing or unclear, stop and ask — don't guess and don't fill gaps with assumptions.
3. **Never deviate from `STYLE.md`.** No dark mode, ever. No colors, radii, shadows, or fonts outside what's defined there. If a new UI pattern is needed that STYLE.md doesn't cover, stop and ask rather than improvising.
4. **Multi-tenant data isolation is non-negotiable.** Every database query touching cinema data must be scoped to the correct organization. Application-level `WHERE org_id = ...` filtering is not sufficient on its own — Postgres Row-Level Security must back every tenant-scoped table (see `concerns/security.md`).
5. **Offline-critical paths must actually be tested offline.** Any box office/POS feature is not "done" until it has been manually verified with the network disabled (see `concerns/offline-sync.md`).
6. **Extreme responsiveness is a hard requirement, not a nice-to-have.** Every screen must be checked against `concerns/responsive.md` before being marked complete — this includes box office tablets and digital signage displays, not just phone/desktop.
7. **When uncertain, stop and ask the human.** A wrong guess that looks plausible is worse than a pause for clarification. This applies to product scope, design decisions, and technical architecture choices not already documented.
8. **No phase is "mostly done."** Partial completion doesn't unlock the next phase. Finish it, self-check it, get approval, then move on.

## 2. Document Map

| File | Purpose |
|---|---|
| `AGENTS.md` | This file — master rules and session loop |
| `STYLE.md` | Design system: colors, typography, spacing, radius, shadows, responsive rules |
| `ARCHITECTURE.md` | Full tech stack and how each piece connects |
| `PRODUCT_REQUIREMENTS.md` | Full feature scope, module by module |
| `DATABASE.md` | Schema source of truth |
| `ENV.md` | Every environment variable, what it's for, where it comes from |
| `PROGRESS.md` | Living state tracker — current phase, checklist, session log |
| `/phases/phase-N.md` | Task list, acceptance criteria, and out-of-scope notes for each phase |
| `/concerns/*.md` | Cross-cutting rules that apply to every task regardless of phase |

## 3. What "Done" Means

A task is only done when:
- It matches its phase file's acceptance criteria exactly (not "close enough")
- It passes every relevant `/concerns/` checklist
- It has test coverage per `concerns/code-quality.md`
- It's been checked at every breakpoint per `concerns/responsive.md`
- `PROGRESS.md` has been updated with a dated log entry
