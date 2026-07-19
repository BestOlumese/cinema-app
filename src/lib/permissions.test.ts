import { describe, expect, it } from "vitest";
import {
  boxOffice,
  cashier,
  concessionsStaff,
  manager,
  siteAdmin,
  statement,
} from "./permissions";

describe("access-control statement structure", () => {
  it("defines the org-default and cinema-specific resource/action shape", () => {
    expect(Object.keys(statement)).toEqual(
      expect.arrayContaining([
        "organization",
        "member",
        "invitation",
        "ac",
        "sale",
        "pricing",
        "staffRole",
      ]),
    );
    expect(statement.sale).toEqual(["create", "refund", "void"]);
    expect(statement.pricing).toEqual(["override"]);
    expect(statement.staffRole).toEqual(["change"]);
  });

  it("omits 'team' — branches are our own table, not Organization teams", () => {
    expect(statement).not.toHaveProperty("team");
  });

  it("defines all five org-scoped roles from the six-tier hierarchy", () => {
    expect(siteAdmin).toBeDefined();
    expect(manager).toBeDefined();
    expect(boxOffice).toBeDefined();
    expect(concessionsStaff).toBeDefined();
    expect(cashier).toBeDefined();
  });

  it("grants Site Admin full organization-management access, matching the org-creator role", () => {
    expect(siteAdmin.authorize({ organization: ["update", "delete"] }).success).toBe(
      true,
    );
    expect(siteAdmin.authorize({ sale: ["refund"] }).success).toBe(true);
  });

  it("leaves the other four roles' cinema-specific permissions unassigned (full mapping is a Phase 1 task)", () => {
    expect(cashier.authorize({ sale: ["create"] }).success).toBe(false);
    expect(manager.authorize({ pricing: ["override"] }).success).toBe(false);
  });
});
