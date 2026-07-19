# Phase 7 — CRM & Loyalty

## Goal

The full loyalty program from the product requirements: customer profiles, points, membership tiers, gift cards, and member-only pricing, usable both on the customer web booking flow and at the box office till.

## Tasks

1. **Customer profiles**
   - Profile creation (tied to the Better Auth customer identity), purchase history aggregated across bookings and POS sales
2. **Points program**
   - Configurable earn rate (e.g., points per Naira spent) and burn rate (points redeemable for discounts/free items)
   - Points ledger — every earn/burn event recorded, not just a running balance, so it's auditable
3. **Membership tiers**
   - Configurable tiers (e.g., Bronze/Silver/Gold) with perks attached per tier (discount percentage, early access to bookings, etc.)
   - Automatic tier progression based on spend/points thresholds
4. **Gift cards**
   - Purchase, redemption, balance tracking
   - Usable as a payment method at both the customer booking flow and the box office till (integrates with Phase 5's payment layer)
5. **Member pricing**
   - Ticket/concession pricing that reflects the customer's tier automatically during checkout

## Out of Scope for This Phase

- No AI-driven personalized recommendations yet (Phase 12 — this phase builds the data the AI layer will later use)
- No marketing campaign sending yet (Phase 8 — this phase only builds the customer/loyalty data model campaigns will target)

## Definition of Done

- [ ] Customer profiles show accurate aggregated purchase history across web bookings and POS sales
- [ ] Points earn/burn correctly on both booking flow and till transactions, with a full ledger (not just a balance)
- [ ] Tier progression works automatically based on configured thresholds
- [ ] Gift cards can be purchased, and correctly redeemed as a payment method in both booking flow and till
- [ ] Member pricing applies correctly and automatically at checkout for a logged-in tiered customer
- [ ] Relevant tables added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on customer-facing loyalty screens (375px priority) and admin-facing tier configuration (1024px+)
- [ ] Vitest coverage on points calculation and tier-progression logic

**Do not proceed to Phase 8 until this checklist is complete AND the human has approved with `APPROVED: PHASE 7`.**
