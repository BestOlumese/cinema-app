# Phase 8 — Marketing & Communications

## Goal

Booking confirmations and loyalty updates go out reliably across Email, SMS, and WhatsApp, and staff can run segmented promotional campaigns — replacing any temporary email-only delivery from earlier phases.

## Tasks

1. **Termii integration**
   - SMS (correct DND/transactional routing per Nigerian regulation — see `concerns/error-handling.md` for the general reliability principle, apply it specifically to Termii's generic-vs-DND routing rules) and WhatsApp messaging wired in
2. **Nodemailer / SMTP**
   - Confirm the SMTP backend decision (still open as of this document — resolve before this phase starts) and wire transactional email fully
3. **Unified notification layer**
   - A single internal service that booking confirmations, loyalty updates, and low-stock/manager alerts all go through, so channel selection (email/SMS/WhatsApp) is configured once, not duplicated per feature
4. **Segmented campaigns**
   - Campaign builder: segment by loyalty tier, viewing history, or inactivity (uses the CRM data model from Phase 7)
   - Sent via Inngest as a background job, not blocking the admin UI
5. **Promo codes / discount engine**
   - Configurable promo codes applied at checkout (booking flow and till), with usage limits and expiry

## Out of Scope for This Phase

- No AI-generated campaign copy or send-time optimization (Phase 12, if the human wants it added there — not assumed as automatic scope)
- No digital signage content (Phase 11, separate delivery surface)

## Definition of Done

- [ ] Booking confirmations delivered via Email, SMS, and WhatsApp correctly
- [ ] Termii routing correctly distinguishes transactional vs. promotional traffic
- [ ] Campaigns can be built, segmented using real CRM data, and sent as an Inngest background job without blocking the UI
- [ ] Promo codes apply correctly at both booking flow and till checkout, respecting usage limits/expiry
- [ ] Relevant tables added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on the campaign builder (admin, 1024px+)
- [ ] Vitest coverage on promo code validation logic

**Do not proceed to Phase 9 until this checklist is complete AND the human has approved with `APPROVED: PHASE 8`.**
