# Phase 5 — Payments Integration

## Goal

Replace every stubbed payment step from Phases 3 and 4 with live payment processing across all the channels the product requires: Paystack (card + bank transfer), USSD, mobile money (OPay/PalmPay), and reconciled cash.

## Tasks

1. **Paystack integration**
   - Card and bank transfer via Paystack's standard checkout/API
   - Webhook handler with signature verification per `concerns/security.md`
2. **USSD & mobile money**
   - Integrated through Paystack's own USSD and mobile money channels where available, avoiding a separate vendor integration unless Paystack's coverage proves insufficient — confirm with the human before adding a second payment vendor
3. **Cash reconciliation**
   - Formal shift-close reconciliation flow: expected cash vs. counted cash, discrepancy flagging
4. **Replace stubbed payment steps**
   - Wire the real payment flow into the Phase 3 customer booking flow and the Phase 4 box office till
5. **Idempotency & double-charge prevention**
   - Payment retry logic checks for existing successful transaction references before charging again, per `concerns/error-handling.md`
6. **Split settlement reporting**
   - Revenue reporting distinguishes which channel (card/bank/USSD/mobile money/cash) drove which transaction, as a foundation for Phase 12 reporting

## Out of Scope for This Phase

- No refund-to-original-payment-method automation beyond what Paystack's API supports directly — manual cash refunds for edge cases are acceptable for v1
- No gift card payment method yet (Phase 7)
- No AI-driven pricing (Phase 12)

## Definition of Done

- [ ] A customer can complete a real Paystack card payment end-to-end from the booking flow
- [ ] USSD and mobile money payment paths tested end-to-end
- [ ] Box office till processes card/digital payments live, with cash remaining fully offline-safe
- [ ] Webhook signature verification confirmed — a forged webhook payload is rejected
- [ ] A deliberate double-submit test confirms no double charge occurs
- [ ] Shift-close cash reconciliation flow works and flags discrepancies
- [ ] Revenue reports correctly split by payment channel
- [ ] Vitest coverage on idempotency logic; Playwright coverage on the live payment path (using Paystack test mode)

**Do not proceed to Phase 6 until this checklist is complete AND the human has approved with `APPROVED: PHASE 5`.**
