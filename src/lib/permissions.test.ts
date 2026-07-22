import { describe, expect, it } from "vitest";
import {
  boxOffice,
  cashier,
  concessionsStaff,
  MANAGER_INVITABLE_ROLES,
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
        "concessions",
        "booking",
        "schedule",
        "report",
        "pricing",
        "staffRole",
      ]),
    );
    expect(statement.sale).toEqual(["create", "refund", "void"]);
    expect(statement.concessions).toEqual(["sell", "adjustStock"]);
    expect(statement.booking).toEqual(["create", "cancel"]);
    expect(statement.schedule).toEqual(["create", "update"]);
    expect(statement.report).toEqual(["view"]);
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
});

describe("Cashier — generic till/POS operator", () => {
  it("can ring up a basic sale", () => {
    expect(cashier.authorize({ sale: ["create"] }).success).toBe(true);
  });

  it("cannot refund, sell concessions, or assign seats", () => {
    expect(cashier.authorize({ sale: ["refund"] }).success).toBe(false);
    expect(cashier.authorize({ concessions: ["sell"] }).success).toBe(false);
    expect(cashier.authorize({ booking: ["create"] }).success).toBe(false);
  });
});

describe("Concessions Staff", () => {
  it("can sell concessions and adjust stock", () => {
    expect(
      concessionsStaff.authorize({ concessions: ["sell", "adjustStock"] })
        .success,
    ).toBe(true);
  });

  it("cannot do ticketing/seat assignment or refunds", () => {
    expect(concessionsStaff.authorize({ booking: ["create"] }).success).toBe(
      false,
    );
    expect(concessionsStaff.authorize({ sale: ["refund"] }).success).toBe(
      false,
    );
  });
});

describe("Box Office", () => {
  it("can sell tickets and assign seats, plus everything Concessions Staff can", () => {
    expect(boxOffice.authorize({ booking: ["create", "cancel"] }).success).toBe(
      true,
    );
    expect(boxOffice.authorize({ concessions: ["sell"] }).success).toBe(true);
  });

  it("cannot refund/void a sale — PRODUCT_REQUIREMENTS.md: manager override required", () => {
    expect(boxOffice.authorize({ sale: ["refund"] }).success).toBe(false);
    expect(boxOffice.authorize({ sale: ["void"] }).success).toBe(false);
  });
});

describe("Manager", () => {
  it("can refund/void sales, manage schedules, view reports, and invite staff", () => {
    expect(manager.authorize({ sale: ["refund", "void"] }).success).toBe(true);
    expect(manager.authorize({ schedule: ["create", "update"] }).success).toBe(
      true,
    );
    expect(manager.authorize({ report: ["view"] }).success).toBe(true);
    expect(manager.authorize({ invitation: ["create"] }).success).toBe(true);
  });

  it("cannot override pricing or change staff roles — Site Admin only", () => {
    expect(manager.authorize({ pricing: ["override"] }).success).toBe(false);
    expect(manager.authorize({ staffRole: ["change"] }).success).toBe(false);
  });
});

describe("MANAGER_INVITABLE_ROLES — Task 4 role-ceiling for Manager-issued invites", () => {
  it("allows Manager to invite Cashier, Concessions Staff, and Box Office", () => {
    expect(MANAGER_INVITABLE_ROLES.has("cashier")).toBe(true);
    expect(MANAGER_INVITABLE_ROLES.has("concessionsStaff")).toBe(true);
    expect(MANAGER_INVITABLE_ROLES.has("boxOffice")).toBe(true);
  });

  it("forbids Manager from inviting a peer or superior", () => {
    expect(MANAGER_INVITABLE_ROLES.has("manager")).toBe(false);
    expect(MANAGER_INVITABLE_ROLES.has("siteAdmin")).toBe(false);
  });
});

describe("Site Admin", () => {
  it("has full organization-management access, matching the org-creator role", () => {
    expect(
      siteAdmin.authorize({ organization: ["update", "delete"] }).success,
    ).toBe(true);
  });

  it("has every cinema-specific permission, including the ones no one else has", () => {
    expect(siteAdmin.authorize({ pricing: ["override"] }).success).toBe(true);
    expect(siteAdmin.authorize({ staffRole: ["change"] }).success).toBe(true);
    expect(siteAdmin.authorize({ sale: ["refund", "void"] }).success).toBe(
      true,
    );
  });
});
