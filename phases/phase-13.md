# Phase 13 — Distributor & Regulatory Reporting (NFVCB)

## Goal

Formalize the NFVCB censorship/classification workflow (only a simple rating field existed since Phase 2) and build distributor-facing box-office reporting exports.

## Tasks

1. **NFVCB classification workflow**
   - Formal submission tracking: film submitted → under review → classified, with certificate upload/reference
   - Rating enforcement (already active since Phase 3) now tied to a verified certificate rather than an unchecked field
2. **Distributor reporting**
   - Box-office reporting exports formatted for local distributor requirements, building on the Phase 12 reporting data
   - Scheduled/on-demand export generation

## Out of Scope for This Phase

- No direct API integration with NFVCB or distributor systems unless such an integration is confirmed to exist and be accessible — assume file-based export/manual submission unless the human specifies otherwise
- No AI involvement in classification decisions — this is a regulatory/compliance workflow, human-driven throughout

## Definition of Done

- [ ] Films can be tracked through the full NFVCB submission-to-classification lifecycle
- [ ] A film cannot be scheduled for a public showtime without a verified classification (tightening the Phase 2/3 unchecked rating field)
- [ ] Distributor exports generate in the correct format and can be scheduled or triggered on demand
- [ ] Relevant tables added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on the classification tracking screens (admin, 1024px+)

**Do not proceed to Phase 14 until this checklist is complete AND the human has approved with `APPROVED: PHASE 13`.**
