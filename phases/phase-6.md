# Phase 6 — Concessions Inventory Management

## Goal

Concessions sales made through the Phase 4 POS now deduct real stock, with alerts, supplier records, and purchase orders — the full inventory depth defined in the product requirements.

## Tasks

1. **Stock tracking**
   - Stock level per item, per branch, deducted automatically on each concessions sale (including offline sales, reconciled on sync per `concerns/offline-sync.md`)
2. **Low-stock alerts**
   - Configurable threshold per item, notification to Manager/Site Admin role when crossed
3. **Supplier & purchase orders**
   - Supplier records (contact info, items supplied)
   - Purchase order creation, tracking (ordered → received), and automatic stock increment on receipt
4. **Waste/shrinkage tracking**
   - Manual adjustment entries with a required reason, logged to the audit log
5. **Recipe/combo costing**
   - Define combo items in terms of component stock consumption (e.g., a popcorn bucket combo deducts popcorn + oil + a cup) so combo sales correctly deduct multiple stock lines

## Out of Scope for This Phase

- No AI-driven demand forecasting for stock reordering (that's part of Phase 12's AI layer, and should only be added once real sales data exists to forecast from)
- No multi-branch stock transfer between sites (flag as a possible future addition, not built now unless the human requests it)

## Definition of Done

- [ ] Concessions sales at the till correctly deduct stock, including offline sales reconciled after sync
- [ ] Low-stock alerts fire correctly at the configured threshold
- [ ] Purchase orders can be created, marked received, and correctly increment stock
- [ ] Waste/shrinkage adjustments require a reason and are audit-logged
- [ ] Combo items deduct all correct component stock lines, not just a single "combo" SKU
- [ ] Relevant tables added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on inventory management screens (admin/manager context, 1024px+ minimum)
- [ ] Vitest coverage on stock deduction and combo-costing logic

**Do not proceed to Phase 7 until this checklist is complete AND the human has approved with `APPROVED: PHASE 6`.**
