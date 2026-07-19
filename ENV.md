# ENV.md — Environment Variables Reference

> Every environment variable used anywhere in the project must be listed here when it's introduced, per `AGENTS.md` Phase 0 task list. Never hardcode a secret — if it's not here, it doesn't exist yet.

## Convention

- Anything prefixed `NEXT_PUBLIC_` is shipped to the browser — **never** put a secret behind that prefix, per `concerns/security.md`.
- Local development uses `.env.local` (gitignored). Production values are set in Vercel's environment variable dashboard, scoped per environment (Production/Preview/Development).

---

## Database — Neon Postgres

| Variable | Purpose | Public? |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string (pooled) | No |
| `DATABASE_URL_UNPOOLED` | Direct connection, used for migrations | No |

## Auth — Better Auth

| Variable | Purpose | Public? |
|---|---|---|
| `BETTER_AUTH_SECRET` | Session/token signing secret | No |
| `BETTER_AUTH_URL` | Canonical app URL Better Auth uses for callbacks | No |
| `NEXT_PUBLIC_APP_URL` | Canonical app URL for client-side use | Yes |

## Offline Sync — PowerSync

| Variable | Purpose | Public? |
|---|---|---|
| `POWERSYNC_INSTANCE_URL` | PowerSync Cloud instance endpoint | No |
| `POWERSYNC_JWT_PRIVATE_KEY` | Private key used to sign PowerSync auth tokens | No |
| `POWERSYNC_JWT_KID` | Key ID matching the public key registered in PowerSync Cloud | No |
| `NEXT_PUBLIC_POWERSYNC_URL` | Client-facing PowerSync connection URL | Yes |

## Real-Time — Pusher or Ably *(confirm final choice before Phase 3)*

| Variable | Purpose | Public? |
|---|---|---|
| `PUSHER_APP_ID` | App identifier | No |
| `PUSHER_KEY` | API key | No (server) / used client-side for subscribe, see Pusher docs on scoping |
| `PUSHER_SECRET` | API secret, used to sign auth requests | No |
| `PUSHER_CLUSTER` | Region cluster | No |
| `NEXT_PUBLIC_PUSHER_KEY` | Client-side subscription key | Yes |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Client-side cluster | Yes |

*If Ably is chosen instead: `ABLY_API_KEY` (server, full access) and a client token-auth endpoint using it — never expose the full Ably key to the browser.*

## Background Jobs — Inngest

| Variable | Purpose | Public? |
|---|---|---|
| `INNGEST_EVENT_KEY` | Sends events into Inngest | No |
| `INNGEST_SIGNING_KEY` | Verifies incoming requests from Inngest | No |

## AI — Google Gemini

| Variable | Purpose | Public? |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API access | No |

## Payments — Paystack

| Variable | Purpose | Public? |
|---|---|---|
| `PAYSTACK_SECRET_KEY` | Server-side API calls | No |
| `PAYSTACK_PUBLIC_KEY` | Client-side checkout initialization | Yes (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) |
| `PAYSTACK_WEBHOOK_SECRET` | Verifies webhook signatures — see `concerns/security.md` | No |

## Messaging — Termii

| Variable | Purpose | Public? |
|---|---|---|
| `TERMII_API_KEY` | SMS/WhatsApp/OTP API access | No |
| `TERMII_SENDER_ID` | Registered sender ID for SMS | No |

## Email — Nodemailer / SMTP

> **Open decision:** SMTP backend provider not yet confirmed (options discussed: Brevo, Zoho/Google Workspace, Amazon SES). Variable names below are provider-agnostic; fill in once decided.

| Variable | Purpose | Public? |
|---|---|---|
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP auth username | No |
| `SMTP_PASSWORD` | SMTP auth password/app password | No |
| `SMTP_FROM_EMAIL` | "From" address for transactional email | No |

## File Storage — UploadThing

| Variable | Purpose | Public? |
|---|---|---|
| `UPLOADTHING_TOKEN` | API access for file uploads | No |

## Monitoring — Sentry

| Variable | Purpose | Public? |
|---|---|---|
| `SENTRY_DSN` | Server-side error reporting endpoint | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side error reporting endpoint | Yes |
| `SENTRY_AUTH_TOKEN` | Uploads source maps at build time (CI only) | No |

## General

| Variable | Purpose | Public? |
|---|---|---|
| `NODE_ENV` | Standard Node environment flag | No |

---

## Still Open

1. Final choice between **Pusher and Ably** — both variable sets are documented above; delete the unused one once decided.
2. **SMTP provider** for Nodemailer.
3. **`BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` for Preview** are currently pinned to the stable production alias (`https://cinema-app-psi-sage.vercel.app`) as a placeholder — real Preview deployments get a unique per-deployment URL, so Better Auth's `trustedOrigins` will need a wildcard/pattern for `*.vercel.app` preview URLs before auth is actually exercised in a preview deployment. Deferred to Phase 1.

Both (1) and (2) should be resolved before Phase 0 is marked complete.

## Current Values (Vercel)

All variables below are set as Encrypted env vars in the Vercel project (`bests-projects-ccd0566e/cinema-app`) across Production, Preview, and Development — `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET` (a distinct value per environment), `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`. Local values live in `.env` (gitignored).

- **Production URL:** `https://cinema-app-psi-sage.vercel.app`
- **GitHub repo:** `https://github.com/BestOlumese/cinema-app`

`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` are also set (same DSN value in both — Sentry DSNs are not sensitive, they're meant to be embedded client-side). `SENTRY_AUTH_TOKEN` is still open — needed for source map upload at build time, not yet provisioned; error capture works without it, source maps just won't be de-minified in the Sentry UI until it's added.

`POWERSYNC_INSTANCE_URL` / `NEXT_PUBLIC_POWERSYNC_URL` are set (`https://6a5d1af6367771958b490678.powersync.journeyapps.com`). Connection-only per Phase 0 scope — no Sync Rules yet, so `POWERSYNC_JWT_PRIVATE_KEY` / `POWERSYNC_JWT_KID` aren't needed until Phase 4. A dedicated read-only Postgres role (`powersync_role`, `REPLICATION` + `SELECT` on `public` schema only) and a publication (`powersync`, scoped to `public` schema tables only) were created directly on Neon for this — **not** the `neondb_owner` admin credentials.

`INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` are set. Verified locally with the Inngest Dev Server (`npx inngest-cli dev`) using `INNGEST_DEV=1` — a temporary test function ran and completed successfully, confirmed via the dev server's own run-status API, then removed. `src/inngest/functions.ts` currently exports an empty array; the first real function lands with whichever Phase actually needs a background job.
