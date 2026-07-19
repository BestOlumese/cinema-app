# Phase 11 — Digital Signage

## Goal

In-cinema screens showing live showtimes and promotions, consuming data from the film/scheduling module (Phase 2) and marketing module (Phase 8) — built as its own distinct display mode, not a scaled-up admin or booking screen.

## Tasks

1. **Signage display mode**
   - A distinct route/layout purpose-built for TV-sized displays, per the signage guidance in `concerns/responsive.md` — larger base font sizes, lower information density, designed for glance-legibility from a distance
2. **Content management**
   - Staff can select which showtimes/promotions appear on which signage screen, per branch
   - Auto-updating: signage reflects live showtime data (e.g., "Sold Out" states) without manual refresh
3. **Promotion slotting**
   - Promotional content from the Phase 8 marketing module can be scheduled into signage rotation
4. **Per-branch toggle**
   - Signage module is optional per cinema, matching the product requirement that it's not mandatory for every tenant

## Out of Scope for This Phase

- No AI-generated signage content (Phase 12, only if the human wants it extended there)
- No signage hardware/device management (this phase builds the web-based display content only; assumes a browser/TV combination the cinema provides)

## Definition of Done

- [ ] Signage display renders correctly at 1920px+ with the glanceability requirements from `concerns/responsive.md` verified (not just "doesn't clip")
- [ ] Content updates live as showtime data changes (e.g., sold-out status) without manual refresh
- [ ] Staff can configure which content appears on which screen, per branch
- [ ] Promotions from Phase 8 can be scheduled into rotation
- [ ] Signage module can be toggled off entirely for cinemas that don't want it
- [ ] Full `concerns/responsive.md` "glance test" pass — key info readable from several feet away at actual signage resolution

**Do not proceed to Phase 12 until this checklist is complete AND the human has approved with `APPROVED: PHASE 11`.**
