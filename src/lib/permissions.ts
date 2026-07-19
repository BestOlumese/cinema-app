import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

/**
 * Six-tier role hierarchy (AGENTS.md / ARCHITECTURE.md §2.2): Cashier, Concessions
 * Staff, Box Office, Manager, Site Admin, Platform Super-Admin.
 *
 * Only the first five are organization-scoped roles below. Platform Super-Admin is
 * CineSuite's own operator role, not something a cinema assigns to its own staff, so
 * it does not belong in an organization's member roles — it's modeled separately
 * (e.g. Better Auth's `admin` plugin or a platform-level field on `user`) in Phase 1.
 *
 * `team` is deliberately omitted from the statement: branches are modeled as our own
 * `branch` table (DATABASE.md §1), not Better Auth's Organization "teams" feature.
 *
 * Phase 0 scope is structure only — the resource/action shape and role names exist so
 * later phases don't redesign this, but exact permission grants per role (beyond
 * Site Admin's baseline org-management access) are finalized in Phase 1.
 */
export const statement = {
  organization: defaultStatements.organization,
  member: defaultStatements.member,
  invitation: defaultStatements.invitation,
  ac: defaultStatements.ac,
  sale: ["create", "refund", "void"],
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
  pricing: ["override"],
  staffRole: ["change"],
});

export const manager = ac.newRole({});
export const boxOffice = ac.newRole({});
export const concessionsStaff = ac.newRole({});
export const cashier = ac.newRole({});
