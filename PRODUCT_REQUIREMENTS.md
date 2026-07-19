# Nigeria Cinema Management SaaS — Product Requirements & Module Map

*Working name: CineSuite. A multi-tenant SaaS platform for cinemas of all sizes in Nigeria — booking, box office, concessions, CRM, and back-office management in one system.*

---

## 1. Executive Summary

A cloud SaaS platform serving Nigerian cinema operators — from single-screen independents to multi-branch chains — on a flat monthly subscription. Modeled against proven global platforms (Tapos, Veezi/Vista Cinema) but built specifically for Nigerian realities: unreliable power/connectivity, mobile-money-heavy payment habits, WhatsApp as the default communication channel, and NFVCB censorship/regulatory requirements. The platform serves two audiences equally: cinema staff/owners (back-office, ticketing, POS) and moviegoers (booking, loyalty, self-service).

---

## 2. Business Model

- **Monetization:** Flat monthly subscription per cinema (not per-ticket commission).
- **Onboarding:** Fully self-serve — a cinema owner signs up and configures their cinema (screens, films, pricing, staff) without needing a sales call.
- **Tenancy:** Flexible — at signup, a cinema chooses either:
  - **Independent tenant** — one cinema, fully self-contained, or
  - **Chain/head-office model** — one account manages multiple branches with circuit-wide reporting and centralized configuration.

---

## 3. User Roles & Permissions

Detailed, granular role hierarchy:

| Role | Scope |
|---|---|
| **Platform Super-Admin** | You (the SaaS operator) — manages all tenants, billing, platform health |
| **Site Admin** | Full control of one cinema (or head office for a chain): pricing, films, staff, reports |
| **Manager** | Day-to-day operations: scheduling, staff shifts, reports, refunds/overrides |
| **Box Office Staff** | Ticket sales, seat assignment, check-in |
| **Concessions Staff** | POS sales for food/drink, stock updates |
| **Moviegoer (customer)** | Books tickets, manages loyalty account, no back-office access |

---

## 4. Full Module Breakdown

### 4.1 Film & Session Management
- Film catalog: title, synopsis, poster/trailer, runtime, genre, cast
- **NFVCB rating workflow**: submit for classification, store certificate/rating, enforce age restrictions at booking/check-in
- Screen/auditorium setup: capacity, seat map layout (rows, sections, accessible seats, couple seats)
- Showtime scheduling per screen, per film, with conflict detection
- Recurring/template scheduling for weekly programming

### 4.2 Ticketing & Booking (Full complexity)
- Tiered pricing by ticket type: Standard / VIP / 3D / Recliner (configurable per cinema)
- Interactive seat-level selection (web + box office)
- Group bookings (bulk seat holds, bulk discounts)
- Private screening bookings (whole-auditorium buyout, custom pricing/quote flow)
- Age-gate enforcement tied to NFVCB rating
- Ticket delivery: QR code via email/SMS/WhatsApp, scan-to-enter

### 4.3 Point of Sale — Box Office & Concessions
- **Offline-first, non-negotiable**: box office and concessions POS must fully function during power/network outages and sync automatically on reconnect (queued transactions, conflict resolution, local seat-map cache)
- Multi-till support per site
- Combo deals (ticket + snack bundles)
- Refunds/voids with manager override
- Receipt printing + digital receipt option

### 4.4 Concessions Inventory Management (Full)
- Stock level tracking per item, per site
- Low-stock alerts
- Supplier records and purchase orders
- Waste/shrinkage tracking
- Recipe/combo costing (e.g., popcorn bucket = X g popcorn + Y ml oil)

### 4.5 Payments
- **Paystack**: card + bank transfer
- **USSD** (for customers without cards/smartphones)
- **Mobile money**: OPay, PalmPay
- **Cash fallback** at box office (offline-safe, reconciled at shift close)
- Split settlement reporting (which channel drove which revenue)

### 4.6 CRM & Loyalty (Full program)
- Customer profiles with purchase history
- Points-based loyalty program, configurable earn/burn rates
- Membership tiers (e.g., Bronze/Silver/Gold) with perks
- Gift cards (purchase, redeem, balance tracking)
- Member-only pricing/early access to bookings

### 4.7 Marketing & Communications
- **Email + SMS + WhatsApp** for: booking confirmations, reminders, loyalty updates, promotional campaigns
- Segmented campaigns (by loyalty tier, viewing history, inactivity)
- Promo codes / discount engine

### 4.8 Digital Signage
- In-cinema screens showing showtimes, now-playing, promotions
- Content managed centrally, pushed per site
- Designed as its own module so it can be toggled on/off per cinema

### 4.9 Multi-Site / Chain Management
- Head-office dashboard: circuit-wide sales, attendance, inventory rollups
- Per-branch drill-down
- Centralized film/pricing templates that branches can inherit or override

### 4.10 Reporting & Analytics (Full BI + AI)
- Revenue by film, site, showtime, ticket type
- Attendance trends, occupancy rates
- Exportable reports (CSV/Excel), distributor-ready formats
- **AI layer**:
  - Insights (e.g., "Film X underperforms on weekday matinees")
  - Demand forecasting (expected attendance per showtime)
  - Dynamic pricing suggestions
  - AI customer support chatbot (moviegoer-facing FAQ/booking help)
  - Personalized film recommendations for returning customers

### 4.11 Distributor & Regulatory Reporting
- NFVCB censorship/classification workflow (see 4.1)
- Box-office reporting exports formatted for local distributors

### 4.12 Staff Management
- Role-based permissions (see Section 3)
- Shift scheduling
- Activity/audit logs (who processed what transaction)

### 4.13 Customer-Facing App
- **PWA (web app) only** — no native iOS/Android app for v1
- Booking, seat selection, loyalty account, gift card purchase/redemption
- Installable to home screen, works offline for browsing (booking itself requires connectivity)

---

## 5. Localization & Nigeria-Specific Considerations

- **Language:** English only (v1)
- **Payments:** Paystack + USSD + mobile money + cash — covers the full spectrum of how Nigerians actually pay
- **Connectivity:** Offline-first POS is a hard requirement, not a nice-to-have
- **Communication:** WhatsApp treated as a first-class channel alongside email/SMS, reflecting actual usage patterns
- **Regulatory:** NFVCB classification is built into the film lifecycle, not bolted on later

---

## 6. Non-Functional Requirements

- **Offline resilience:** Box office/POS must survive outages; local queue + sync-on-reconnect
- **Hosting:** International cloud (AWS/GCP — EU or US region), not Nigeria-hosted
- **Multi-tenancy:** Data isolation between cinemas is critical (each tenant's data must never leak to another)
- **Security:** PCI-relevant handling for card payments (via Paystack, so mostly offloaded), role-based access control enforced server-side

---

## 7. Open Questions for the Next Round

This document covers **what** the platform needs to do. Two things are still open before implementation planning:

1. **Tech stack deep-dive** — Next.js is confirmed (App Router, TypeScript). Still to decide: database/ORM, auth provider, real-time architecture for seat maps, offline sync strategy (e.g., IndexedDB/Dexie for POS), background job processing for AI/reporting, hosting specifics on AWS/GCP.
2. **Build roadmap/phasing** — "Map everything before touching code" was the instruction for *this* document. Actually building a solo-developer SaaS with this scope will still need a phase order (e.g., core ticketing + POS first, AI layer last). Worth a dedicated planning pass once you're ready to move from requirements to execution.

---

*Generated from a structured discovery conversation, cross-referenced against Tapos (UK, 50+ modules, used by circuits like GQT Movies) and Veezi/Vista Cinema (cloud SaaS built for independent-to-mid-size cinemas).*
