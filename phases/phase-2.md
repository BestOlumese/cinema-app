# Phase 2 — Film & Session Management

## Goal

Cinema staff can build and maintain a film catalog, set up screens/auditoriums, and schedule showtimes — the data foundation that ticketing (Phase 3) depends on. No booking or payment yet.

## Tasks

1. **Film catalog**
   - CRUD for films: title, synopsis, poster (via UploadThing), trailer link, runtime, genre, cast
   - NFVCB rating field with certificate reference/upload (full submission workflow is Phase 13 — here, just store and enforce an assigned rating)
2. **Screen/auditorium setup**
   - Per-branch screen configuration: name, total capacity, seat map layout (rows, sections, accessible seats, couple seats) as structured data
   - Seat map data model designed now, even though the visual seat-picker UI is built in Phase 3
3. **Showtime scheduling**
   - Create/edit showtimes per film, per screen, with start/end time
   - Conflict detection: no two showtimes overlapping on the same screen
4. **Recurring/template scheduling**
   - Weekly programming templates a Manager can apply instead of entering every showtime by hand
5. **Age-gate data**
   - Rating stored per film is queryable for enforcement at booking/check-in time (enforcement logic itself lands in Phase 3)

## Out of Scope for This Phase

- No customer-facing booking screens
- No seat-level pricing (that's Phase 3)
- No formal NFVCB submission/certificate workflow (Phase 13) — just store a rating value
- No digital signage content generation from this data (Phase 11 consumes it later)

## Definition of Done

- [ ] Staff can create, edit, and archive films with poster upload via UploadThing
- [ ] Screens/auditoriums configured with a structured seat map (rows, sections, accessible/couple seats)
- [ ] Showtimes can be scheduled with conflict detection preventing double-booking a screen
- [ ] Recurring/template scheduling works for weekly programming
- [ ] Every film has a rating field enforced as required before a showtime can be published
- [ ] Relevant tables added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on the film/schedule management screens (this is an admin-facing surface, tested at 1024px+ minimum, portrait tablet if used at box office for schedule lookups)
- [ ] Vitest coverage on conflict-detection logic

**Do not proceed to Phase 3 until this checklist is complete AND the human has approved with `APPROVED: PHASE 2`.**
