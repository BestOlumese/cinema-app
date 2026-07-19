# Nigeria Cinema Management SaaS — Technical Architecture

*Companion to `cinema-saas-product-requirements.md`. This document covers the confirmed technology stack, why each piece was chosen, and how they fit together.*

---

## 1. Stack Summary

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling/UI | Tailwind CSS + shadcn/ui |
| Server state | TanStack Query v5 |
| Data grids | TanStack Table |
| Client state | Zustand |
| Auth & multi-tenancy | Better Auth (Organization plugin) |
| Database | Neon Postgres |
| ORM | Drizzle |
| Offline sync (POS) | PowerSync (PowerSync Cloud) |
| Real-time (seat locking) | Pusher or Ably |
| Background jobs | Inngest |
| AI | Google Gemini |
| Payments | Paystack + USSD + mobile money + cash |
| SMS/WhatsApp | Termii |
| Transactional email | Nodemailer |
| File storage | UploadThing |
| Hosting | Vercel |
| Testing | Vitest + Playwright |
| Error monitoring | Sentry |

---

## 2. Why Each Piece — and How They Connect

### 2.1 Next.js 16
Current stable release is 16.2.10 (16.3 in preview as of late June 2026). Relevant features for this project:
- **Turbopack** is now the default bundler for dev and production builds — faster iteration for a solo dev.
- **Cache Components** (`use cache` directive) give explicit, opt-in caching — important here because showtimes/seat availability must always be fresh, while marketing/film-info pages can be cached aggressively. No more guessing what's implicitly cached.
- **`proxy.ts`** replaces `middleware.ts` — used for tenant resolution (routing a request to the correct cinema/organization based on subdomain or path).
- Bundles React 19.2 (View Transitions, `useEffectEvent`, `<Activity>`).

### 2.2 Better Auth — Organization Plugin
This is the load-bearing decision for your multi-tenancy model. The Organization plugin gives you, out of the box:
- Organizations (= cinemas or cinema chains), members, invitations, role assignment
- Built-in roles (owner/admin/member) **plus dynamic, runtime-defined roles** — which is exactly what your six-tier staff hierarchy (Cashier, Concessions Staff, Box Office, Manager, Site Admin, Platform Super-Admin) needs
- `hasPermission()` checks on both server and client, matched against a custom access-control statement you define per resource (e.g., `sale: ["create", "refund"]`)
- This directly supports the "independent tenant OR chain/head-office" flexibility from the product doc: a chain is one organization with branches modeled as sub-entities or linked organizations; an independent cinema is a single organization.

**Note from production usage of this pattern:** Better Auth does not generate an audit trail for auth events automatically — build a lightweight audit log table for staff actions (who processed which refund, who changed pricing) since this matters for a POS system. Also plan Postgres Row-Level Security as a second layer of tenant isolation, not just application-level `WHERE org_id = ...` filtering — a single missed clause is how cross-tenant data leaks happen.

### 2.3 Neon Postgres + Drizzle
Standard, well-supported combination. The reason this pairing matters *specifically* here: PowerSync has an official, maintained integration guide for exactly "Neon + Drizzle," including a working demo app. You're not stitching together three separate vendors' half-compatible docs — this combination is a supported path.

### 2.4 PowerSync — Offline POS
This is the piece that makes "box office/POS must fully work offline" actually true:
- PowerSync connects to Neon via **Postgres logical replication** (same mechanism as Debezium-style CDC tools) and keeps an embedded **SQLite** database in the browser/app in sync.
- Box office and concessions staff read/write to the local SQLite database — reads are instant, writes queue locally in a persistent FIFO upload queue that survives app restarts and outages.
- When connectivity returns, queued writes sync automatically. You still need to write the `uploadData()` function and think through conflict resolution (e.g., what happens if the same seat gets sold twice offline across two tills — last-write-wins is the simple starting point, with a reconciliation report for edge cases).
- **PowerSync Cloud** (managed, free tier available: 2GB synced data/month, 50 concurrent connections) is the right starting point — self-hosting is available later if volume outgrows the free/paid tiers.
- Achieved SOC 2 and HIPAA compliance in January 2026, for what it's worth on the trust front.

### 2.5 Real-time Seat Selection — Pusher/Ably
Separate concern from PowerSync (which handles POS offline sync, not live seat-map broadcasting to online customers). When a customer selects a seat on the web booking flow, every other customer viewing that showtime needs to see it lock in real time. A managed service (Pusher or Ably) avoids running your own WebSocket infrastructure — reasonable trade-off for a solo dev, at the cost of a monthly bill once usage scales.

### 2.6 Inngest — Background Jobs
Handles anything that shouldn't block a request: AI report generation, scheduled WhatsApp/SMS/email sends, nightly demand-forecasting runs. Matches your established stack from other projects.

### 2.7 Google Gemini — AI Layer
Powers the four AI features from the product doc: BI insights, demand forecasting, the customer support chatbot, and personalized recommendations. Background-job-triggered (via Inngest) for the heavier analysis (forecasting, insights), request-time for the chatbot.

### 2.8 Payments — Paystack + USSD + Mobile Money + Cash
Paystack covers card and bank transfer, and also exposes USSD and mobile money (OPay/PalmPay) channels through its own API — you likely don't need separate integrations for those. Cash stays fully offline-safe since it's reconciled at shift close through the POS, not requiring real-time payment gateway confirmation.

### 2.9 Termii — SMS + WhatsApp
Nigeria-built, API-first, actively maintained. Covers SMS (with proper DND/transactional routing — important since Nigeria enforces delivery-time restrictions on promotional SMS to MTN numbers), WhatsApp, voice, and OTP from one API. Good fit for both transactional messages (booking confirmations) and marketing campaigns.

### 2.10 UploadThing — File Storage
TypeScript-native, integrates directly with Next.js App Router via a typed `FileRouter`. Handles posters, receipts, gift card designs. Simpler than hand-rolling S3 presigned URLs, with server-side authorization built into the middleware pattern.

### 2.11 Vercel — Hosting
Native Next.js platform — zero-config deploys, works seamlessly with PowerSync Cloud and Inngest (both managed services that don't need you to run anything server-side yourself). This keeps solo-dev operational overhead low.

### 2.12 Testing & Monitoring
Vitest for unit/integration tests, Playwright for end-to-end (especially important for the booking flow and offline POS sync paths). Sentry for error monitoring in production.

---

## 3. Two Small Open Items

These weren't dedicated question rounds but need a decision before implementation:

1. **SMTP backend for Nodemailer** — needs a provider (options: Brevo free tier, Zoho/Google Workspace mailbox, Amazon SES). Not yet decided.
2. **CI/CD** — GitHub Actions is the natural default given Vercel + GitHub, but not explicitly confirmed.

---

## 4. Architecture Diagram (conceptual)

```
                        ┌─────────────────────┐
                        │   Next.js 16 (Vercel)│
                        │  App Router + TS     │
                        └─────┬───────────┬────┘
                              │           │
                 ┌────────────┘           └────────────┐
                 │                                      │
        ┌────────▼────────┐                    ┌────────▼────────┐
        │  Better Auth      │                    │  TanStack Query  │
        │  (Organization     │                    │  (all client data)│
        │   plugin)          │                    └──────────────────┘
        └────────┬────────┘
                 │
        ┌────────▼────────────────────────────────────┐
        │              Neon Postgres                    │
        │         (Drizzle ORM, source of truth)        │
        └───┬─────────────────────┬────────────────┬────┘
            │                     │                │
   ┌────────▼───────┐   ┌─────────▼────────┐  ┌────▼─────┐
   │  PowerSync Cloud │   │  Pusher/Ably      │  │  Inngest │
   │  (logical replic. │   │  (seat-lock       │  │  (bg jobs,│
   │   → SQLite on     │   │   broadcast)       │  │   AI runs)│
   │   box office POS) │   └───────────────────┘  └────┬─────┘
   └───────────────────┘                                │
                                                 ┌────────▼────────┐
                                                 │  Google Gemini    │
                                                 │  (insights, chat, │
                                                 │   forecasting)    │
                                                 └───────────────────┘

  External services: Paystack (payments) · Termii (SMS/WhatsApp) ·
  Nodemailer/SMTP (email) · UploadThing (files) · Sentry (errors)
```

---

*Next step once you're ready: a phased build roadmap (which modules ship first, given a solo developer building this full scope).*
