# Phase 1 — Core Auth & Multi-Tenancy

## Goal

A cinema owner can self-serve sign up, choose independent or chain tenancy, invite staff with specific roles, and permissions are correctly enforced. No film/ticketing/POS features yet — this phase is purely the tenancy and access-control foundation everything else depends on.

## Tasks

1. **Self-serve signup flow**
   - Cinema owner creates an account and an organization in one flow (no sales call, no manual approval gate)
2. **Tenancy model choice at signup**
   - Owner chooses: independent cinema (single organization) OR chain/head office (organization with branch structure)
   - Data model supports both without requiring a later migration if a cinema later wants to add branches
3. **Full role/permission mapping**
   - Implement the complete access-control statement for all six roles: Cashier, Concessions Staff, Box Office, Manager, Site Admin, Platform Super-Admin
   - Define resource-level permissions per `ARCHITECTURE.md` (e.g., `sale: ["create", "refund"]`, `pricing: ["update"]`) — Site Admin and above only for pricing changes, Manager and above for refunds, etc.
4. **Staff invitation flow**
   - Site Admin/Manager can invite a staff member by email, assign a role
   - Invited staff completes their own signup and lands with correct permissions already applied
5. **Row-Level Security**
   - RLS policies applied to every tenant-scoped table created so far, per `concerns/security.md`
6. **Audit log**
   - Basic audit log table capturing role changes and staff invitations (the first sensitive actions that exist at this phase)
7. **Admin dashboard shell**
   - Sidebar navigation, organization switcher (visible only for chain accounts with multiple branches)
   - No real content yet — this is the shell later phases populate

## Out of Scope for This Phase

- No film catalog, scheduling, ticketing, POS, or any customer-facing booking screens
- No payment integration
- No AI features
- Chain branch *management* UI (adding/configuring branches) is deferred to Phase 10 — Phase 1 only needs the underlying data model to support it

## Definition of Done

- [ ] A new cinema can complete self-serve signup end-to-end with no manual intervention
- [ ] Both tenancy choices (independent / chain) work and are correctly reflected in the data model
- [ ] All six roles exist with correctly scoped permissions, verified server-side (not just hidden in UI)
- [ ] A Site Admin can invite a staff member, who receives correct permissions on completing signup
- [ ] RLS confirmed: a manual test proves organization A cannot read organization B's data, even via a crafted query
- [ ] Audit log records a role change and a staff invitation correctly
- [ ] Admin dashboard shell renders and passes the full `concerns/responsive.md` checklist at all required breakpoints
- [ ] Vitest coverage on permission-check logic; Playwright coverage on signup + invitation flow

**Do not proceed to Phase 2 until this checklist is complete AND the human has approved with `APPROVED: PHASE 1`.**
