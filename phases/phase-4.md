# Phase 4 — Box Office & POS (Offline-Critical)

## Goal

Box office and concessions staff can sell tickets and combo items from a till that keeps working through a power/network outage, with everything syncing automatically on reconnect. This is the phase where `concerns/offline-sync.md` becomes fully active — treat it as required reading before any task here, not just a checklist at the end.

## Tasks

1. **PowerSync Sync Rules**
   - Define Sync Rules covering every table a till needs offline: showtimes, seat availability, ticket types/pricing, films, staff/till identity, in-progress sale line items
2. **Till UI**
   - Box office sale flow: select showtime → assign seats (reuses the seat map component from Phase 3, adapted for staff-assisted sale) → collect payment (cash path fully offline-safe per `concerns/offline-sync.md`; card/digital payment paths wait for Phase 5 but must degrade gracefully to "cash only" when offline)
   - Concessions sale flow: item selection, combo deals, running total
3. **Offline write path**
   - Local SQLite reads/writes via PowerSync SDK
   - `uploadData()` implemented per `concerns/offline-sync.md`, including partial-failure handling
   - Every offline transaction tagged with till ID, staff ID, and client timestamp
4. **Multi-till support**
   - Multiple simultaneous tills per site without seat/inventory collisions once synced
5. **Refunds & voids**
   - Manager-level override required (permission check per `concerns/security.md`), logged to the audit log
6. **Receipts**
   - Print receipt support and a digital receipt option

## Out of Scope for This Phase

- No live card/digital payment processing yet (Phase 5) — offline cash sales and a stubbed online-payment path only
- No concessions inventory stock tracking yet (Phase 6) — items are sellable but stock levels aren't deducted/tracked yet
- No loyalty/member pricing at the till (Phase 7)

## Definition of Done

- [ ] A till can complete a full ticket + concessions sale with the network physically disabled
- [ ] The app restarted mid-offline-session still has the pending sale queued correctly
- [ ] On reconnect, queued sales sync to Neon Postgres correctly, including seat assignment reconciliation across multiple tills
- [ ] A deliberately-triggered seat-collision-while-offline scenario is caught and flagged per `concerns/offline-sync.md`, not silently resolved
- [ ] Refunds/voids require Manager-level permission and are recorded in the audit log
- [ ] Receipts print and/or generate correctly
- [ ] Full `concerns/responsive.md` pass with explicit **portrait tablet** testing, since this is the primary box office context
- [ ] Playwright test simulating offline mode for the full till sale flow

**Do not proceed to Phase 5 until this checklist is complete AND the human has approved with `APPROVED: PHASE 4`.**
