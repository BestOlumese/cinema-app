# Phase 10 — Multi-Site / Chain Management

## Goal

Build out the head-office/chain side of the tenancy model that Phase 1 established the data foundation for: branch management, circuit-wide reporting, and centralized configuration templates.

## Tasks

1. **Branch management UI**
   - Head-office account can add, configure, and deactivate branches under its organization
2. **Circuit-wide dashboard**
   - Rolled-up sales, attendance, and inventory data across all branches, with per-branch drill-down
3. **Centralized templates**
   - Film/pricing templates a head office defines once, which branches can inherit as-is or override locally
   - Clear UI distinction between "inherited from head office" and "branch override" so managers aren't confused about which value is active
4. **Cross-branch staff visibility**
   - Head-office-level roles (Site Admin at the chain level, distinct from a single branch's Site Admin) can see staff across branches; branch-level roles remain scoped to their own branch only, per `concerns/security.md`

## Out of Scope for This Phase

- No cross-branch stock transfer (flagged as out of scope in Phase 6 too — revisit only if the human explicitly requests it)
- No AI-driven cross-branch demand comparison (Phase 12, if extended there)

## Definition of Done

- [ ] Head office can add/configure/deactivate branches
- [ ] Circuit-wide dashboard shows accurate rolled-up data with correct per-branch drill-down
- [ ] Templates correctly cascade to branches, with clear UI showing inherited vs. overridden values
- [ ] Permission scoping confirmed: a branch-level Manager cannot see or act on another branch's data, even within the same chain
- [ ] Relevant tables/relations added to `DATABASE.md`
- [ ] Full `concerns/responsive.md` pass on the circuit-wide dashboard (1024px+, this is a desktop-heavy admin surface)
- [ ] Vitest coverage on template inheritance/override resolution logic

**Do not proceed to Phase 11 until this checklist is complete AND the human has approved with `APPROVED: PHASE 10`.**
