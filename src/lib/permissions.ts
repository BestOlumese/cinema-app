import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

/**
 * Six-tier role hierarchy (AGENTS.md / ARCHITECTURE.md §2.2): Cashier, Concessions
 * Staff, Box Office, Manager, Site Admin, Platform Super-Admin.
 *
 * Only the first five are organization-scoped roles below. Platform Super-Admin is
 * CineSuite's own operator role, not something a cinema assigns to its own staff, so
 * it does not belong in an organization's member roles — it's modeled separately
 * (e.g. Better Auth's `admin` plugin or a platform-level field on `user`) in a later
 * phase.
 *
 * `team` is deliberately omitted from the statement: branches are modeled as our own
 * `branch` table (DATABASE.md §1), not Better Auth's Organization "teams" feature.
 *
 * The five roles are ordered, each including everything the tier below it can do:
 * Cashier < Concessions Staff < Box Office < Manager < Site Admin. `sale`, `booking`,
 * `concessions`, `schedule`, and `report` don't correspond to real tables yet — those
 * land in Phases 2/3/4/6 — but the resource/action shape is defined now so those
 * phases wire permission checks against an already-agreed-on structure rather than
 * inventing one under time pressure later.
 */
export const statement = {
  organization: defaultStatements.organization,
  member: defaultStatements.member,
  invitation: defaultStatements.invitation,
  ac: defaultStatements.ac,
  sale: ["create", "refund", "void"],
  concessions: ["sell", "adjustStock"],
  booking: ["create", "cancel"],
  schedule: ["create", "update"],
  report: ["view"],
  pricing: ["override"],
  staffRole: ["change"],
} as const;

export const ac = createAccessControl(statement);

// The org creator (a cinema signing up) is assigned this role — needs full
// org-management access to function as the organization's owner-equivalent.
export const siteAdmin = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  ac: ["create", "read", "update", "delete"],
  sale: ["create", "refund", "void"],
  concessions: ["sell", "adjustStock"],
  booking: ["create", "cancel"],
  schedule: ["create", "update"],
  report: ["view"],
  pricing: ["override"],
  staffRole: ["change"],
});

// PRODUCT_REQUIREMENTS.md: "Manager: Day-to-day operations: scheduling, staff
// shifts, reports, refunds/overrides." Also invites staff (Task 4), but does not
// change pricing or existing staff roles — those stay Site Admin-only.
export const manager = ac.newRole({
  invitation: ["create"],
  sale: ["create", "refund", "void"],
  concessions: ["sell", "adjustStock"],
  booking: ["create", "cancel"],
  schedule: ["create", "update"],
  report: ["view"],
});

// PRODUCT_REQUIREMENTS.md: "Box Office Staff: Ticket sales, seat assignment,
// check-in." No refunds/voids — PRD §4.3: "Refunds/voids with manager override."
export const boxOffice = ac.newRole({
  sale: ["create"],
  concessions: ["sell", "adjustStock"],
  booking: ["create", "cancel"],
});

// PRODUCT_REQUIREMENTS.md: "Concessions Staff: POS sales for food/drink, stock
// updates." No ticketing/seat assignment — that's Box Office and above.
export const concessionsStaff = ac.newRole({
  sale: ["create"],
  concessions: ["sell", "adjustStock"],
});

// Generic till/POS operator — can ring up a basic sale (including concessions
// items) but has no seat-assignment/ticketing authority and can't adjust stock.
export const cashier = ac.newRole({
  sale: ["create"],
});

// Roles a Manager is allowed to assign when inviting staff (Task 4) — Manager
// can't create a peer or superior; Manager/Site Admin invites stay Site
// Admin-only, enforced server-side in `beforeCreateInvitation` (src/lib/auth.ts).
export const MANAGER_INVITABLE_ROLES = new Set(["cashier", "concessionsStaff", "boxOffice"]);
