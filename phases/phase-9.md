# Phase 9 — Group & Private Screening Bookings

## Goal

Extend the Phase 3 booking engine to support bulk group bookings and whole-auditorium private screening buyouts — the two ticketing scenarios explicitly deferred from Phase 3.

## Tasks

1. **Group bookings**
   - Bulk seat holds (reserve a block of seats together) beyond the standard one-lock-per-seat flow from Phase 3
   - Bulk discount pricing rules, configurable per cinema
2. **Private screening / venue buyout**
   - A distinct booking type: an entire auditorium for a private event, not seat-by-seat
   - Custom pricing/quote flow — this is not a fixed-price checkout like standard tickets; it needs a request → quote → confirm workflow, likely involving Manager/Site Admin approval
3. **Booking management for these types**
   - Staff-facing view to manage pending private screening requests and approve/reject/quote them
4. **Notification integration**
   - Private screening request/confirmation notifications routed through the Phase 8 unified notification layer

## Out of Scope for This Phase

- No self-service instant-confirm private screening booking — the quote/approval step is intentional, not a gap to fill with automation
- No AI-assisted pricing suggestions for private screenings (Phase 12, only if the human explicitly wants this extended there)

## Definition of Done

- [ ] A customer can request a group booking and hold a block of seats together
- [ ] Bulk discount pricing applies correctly and is configurable per cinema
- [ ] A customer can submit a private screening request, and staff can quote/approve/reject it
- [ ] Confirmed private screenings correctly block the auditorium from other bookings for that time slot
- [ ] Notifications for both flows route through the Phase 8 unified notification layer
- [ ] Full `concerns/responsive.md` pass on both the customer-facing request flow (375px priority) and staff-facing management view (1024px+)
- [ ] Playwright coverage on the group booking and private screening request flows

**Do not proceed to Phase 10 until this checklist is complete AND the human has approved with `APPROVED: PHASE 9`.**
