# Phase 12 — Reporting & Analytics + AI Layer

## Goal

Full business intelligence reporting across every module built so far, plus the four AI features from the product requirements: insights, demand forecasting, a customer support chatbot, and personalized recommendations — all powered by Google Gemini, run as Inngest background jobs where appropriate.

## Tasks

1. **Core BI reporting**
   - Revenue by film, site, showtime, ticket type (drawing on Phases 2, 3, 5, 10 data)
   - Attendance trends, occupancy rates
   - Exportable reports (CSV/Excel) and distributor-ready formats (feeds into Phase 13)
2. **AI insights**
   - Gemini-powered analysis surfacing patterns like underperforming showtimes, run as a scheduled Inngest job, not generated live on every dashboard load
3. **Demand forecasting**
   - Predicted attendance per upcoming showtime, informing (but not yet automating) the concessions reordering and pricing decisions from Phases 5/6
4. **Dynamic pricing suggestions**
   - Gemini-generated pricing suggestions presented to a Manager/Site Admin for approval — **not** automatic price changes; a human confirms before any price updates
5. **AI customer support chatbot**
   - Customer-facing, answering booking/FAQ questions; scoped to what it can safely answer (no payment/refund actions performed by the chatbot itself — those route to a human/existing flow)
6. **Personalized recommendations**
   - Uses the CRM/loyalty data from Phase 7 to suggest films to returning customers

## Out of Scope for This Phase

- No fully autonomous pricing changes — every AI pricing suggestion requires human approval, per the task above
- No chatbot ability to process refunds, payments, or account changes directly

## Definition of Done

- [ ] Core BI reports render accurate data and export correctly
- [ ] AI insights job runs on schedule via Inngest and surfaces genuinely useful patterns (validated against real or realistic seed data, not just "the API call succeeds")
- [ ] Demand forecasting produces per-showtime predictions
- [ ] Pricing suggestions are presented for approval, never applied automatically
- [ ] Chatbot correctly declines to perform actions outside its safe scope and hands off appropriately
- [ ] Recommendations are personalized per customer based on real CRM data, not generic
- [ ] Full `concerns/responsive.md` pass on all new dashboard/reporting screens
- [ ] Vitest coverage on report calculation logic (not the AI outputs themselves, which are inherently non-deterministic — but the data pipeline feeding them must be tested)

**Do not proceed to Phase 13 until this checklist is complete AND the human has approved with `APPROVED: PHASE 12`.**
