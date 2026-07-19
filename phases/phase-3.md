# Phase 3 — Ticketing & Booking

## Goal

A customer can browse showtimes, pick seats in real time without colliding with another customer, and complete a booking with a tiered price. This is the core booking engine — group bookings and private screenings are deferred to Phase 9, and payment processing itself is deferred to Phase 5 (bookings in this phase can complete against a stubbed/test payment step).

## Tasks

1. **Ticket types & tiered pricing**
   - Configurable ticket types per cinema: Standard / VIP / 3D / Recliner (or whatever a given cinema defines)
   - Pricing configurable per ticket type, per showtime
2. **Seat-level selection UI**
   - Interactive seat map (custom component, per `STYLE.md` — this is one of the explicitly bespoke UI pieces) built on the seat layout data model from Phase 2
   - Fully responsive per `concerns/responsive.md`, including the phone-width customer booking context specifically
3. **Real-time seat locking**
   - Pusher/Ably integration: when one customer selects a seat, it locks for other viewers of the same showtime in real time
   - Lock expires automatically if the customer doesn't complete checkout within a defined window (recommend 10 minutes — confirm with the human before hardcoding)
4. **Age-gate enforcement**
   - Booking flow checks the film's NFVCB rating (from Phase 2) and enforces age restrictions where applicable
5. **Booking flow**
   - Seat selection → ticket type/pricing summary → customer details → payment step (stubbed in this phase, wired to Paystack in Phase 5) → confirmation
6. **Ticket delivery**
   - QR code generation per ticket
   - Delivery via email (Nodemailer) at minimum in this phase; SMS/WhatsApp delivery via Termii is wired in Phase 8 once the communications module exists — confirm with the human whether Phase 3 needs a temporary direct integration or should wait

## Out of Scope for This Phase

- No group bookings or private screening buyouts (Phase 9)
- No live payment processing — use a stubbed/test success path, replaced in Phase 5
- No box office/POS booking (that's Phase 4 — this phase is the customer-facing web flow)
- No loyalty/member pricing (Phase 7)

## Definition of Done

- [ ] Customer can select seats on an interactive map and see real-time locking when another session selects the same seat
- [ ] Seat locks expire correctly and release the seat if checkout isn't completed
- [ ] Tiered pricing displays correctly per ticket type per showtime
- [ ] Age-gate blocks booking for underage attempts where a rating requires it
- [ ] Booking completes end-to-end against the stubbed payment step and generates a QR ticket
- [ ] QR ticket delivered by email
- [ ] Full `concerns/responsive.md` pass — this is the most customer-critical mobile screen in the entire app, tested rigorously at 375px
- [ ] Playwright e2e test covers the full booking flow including a simulated seat-collision scenario

**Do not proceed to Phase 4 until this checklist is complete AND the human has approved with `APPROVED: PHASE 3`.**
