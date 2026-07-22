import { expect, test } from "@playwright/test";
import { BASE_URL } from "./helpers/base-url";
import {
  cleanupInvitedEmail,
  cleanupTestUser,
  getMemberRole,
  getOrganizationBySlug,
  insertMemberWithRole,
  verifyUserEmail,
} from "./helpers/db";
import { waitForMailLink } from "./helpers/mail";

const PASSWORD = "TestPass123!";
const ORIGIN_HEADER = { Origin: BASE_URL };

test.describe("staff invitation flow (Phase 1 Task 4)", () => {
  test("Site Admin invites a Box Office staff member, who joins with the right role", async ({
    page,
    browser,
  }) => {
    const adminEmail = `e2e-admin-${Date.now()}@example.com`;
    const orgName = `E2E Invite Cinema ${Date.now()}`;
    const orgSlug = `e2e-invite-${Date.now()}`;
    const inviteeEmail = `e2e-invitee-${Date.now()}@example.com`;

    // Fixture setup via direct API calls — signup + verification themselves
    // are already covered end-to-end in signup-and-onboarding.spec.ts.
    await page.request.post("/api/auth/sign-up/email", {
      headers: ORIGIN_HEADER,
      data: { name: "E2E Admin", email: adminEmail, password: PASSWORD },
    });
    await verifyUserEmail(adminEmail);
    await page.request.post("/api/auth/sign-in/email", {
      headers: ORIGIN_HEADER,
      data: { email: adminEmail, password: PASSWORD },
    });
    await page.request.post("/api/auth/organization/create", {
      headers: ORIGIN_HEADER,
      data: { name: orgName, slug: orgSlug, tenancyType: "independent" },
    });

    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: orgName })).toBeVisible();

    await page.getByLabel("Email").fill(inviteeEmail);
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Box Office" }).click();
    await page.getByRole("button", { name: "Send invitation" }).click();
    await expect(page.getByText(`Invitation sent to ${inviteeEmail}.`)).toBeVisible();

    const inviteLink = await waitForMailLink(inviteeEmail);

    // Accept as a brand-new, unauthenticated user in a separate context.
    const inviteeContext = await browser.newContext();
    const inviteePage = await inviteeContext.newPage();
    await inviteePage.goto(inviteLink);
    await inviteePage.getByLabel("Your name").fill("E2E Invitee");
    await inviteePage.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await inviteePage.getByRole("button", { name: "Create account & join" }).click();

    await expect(inviteePage).toHaveURL(/\/dashboard$/);
    await expect(inviteePage.getByRole("heading", { name: orgName })).toBeVisible();
    // Box Office can't invite — the form must not render for them.
    await expect(
      inviteePage.getByRole("button", { name: "Send invitation" }),
    ).toHaveCount(0);
    await inviteeContext.close();

    const org = await getOrganizationBySlug(orgSlug);
    expect(await getMemberRole(org.id, inviteeEmail)).toBe("boxOffice");

    await cleanupTestUser(adminEmail);
    await cleanupInvitedEmail(inviteeEmail);
  });

  test("Manager cannot invite a Manager or Site Admin, but can invite a Cashier (enforced server-side)", async ({
    page,
    browser,
  }) => {
    const adminEmail = `e2e-admin2-${Date.now()}@example.com`;
    const orgSlug = `e2e-ceiling-${Date.now()}`;
    const managerEmail = `e2e-manager-${Date.now()}@example.com`;
    const blockedEmail = `e2e-blocked-${Date.now()}@example.com`;
    const allowedEmail = `e2e-allowed-${Date.now()}@example.com`;

    await page.request.post("/api/auth/sign-up/email", {
      headers: ORIGIN_HEADER,
      data: { name: "E2E Admin", email: adminEmail, password: PASSWORD },
    });
    await verifyUserEmail(adminEmail);
    await page.request.post("/api/auth/sign-in/email", {
      headers: ORIGIN_HEADER,
      data: { email: adminEmail, password: PASSWORD },
    });
    await page.request.post("/api/auth/organization/create", {
      headers: ORIGIN_HEADER,
      data: { name: "E2E Ceiling Cinema", slug: orgSlug, tenancyType: "independent" },
    });
    const org = await getOrganizationBySlug(orgSlug);

    await page.request.post("/api/auth/sign-up/email", {
      headers: ORIGIN_HEADER,
      data: { name: "E2E Manager", email: managerEmail, password: PASSWORD },
    });
    await verifyUserEmail(managerEmail);
    await insertMemberWithRole(org.id, managerEmail, "manager");

    const managerContext = await browser.newContext();
    const managerPage = await managerContext.newPage();
    await managerPage.request.post("/api/auth/sign-in/email", {
      headers: ORIGIN_HEADER,
      data: { email: managerEmail, password: PASSWORD },
    });

    // Hit the API directly rather than the UI: the manager's own invite form
    // never even shows "Manager"/"Site Admin" as options, so this proves the
    // restriction is enforced server-side, not just hidden client-side.
    const blockedRes = await managerPage.request.post("/api/auth/organization/invite-member", {
      headers: ORIGIN_HEADER,
      data: { email: blockedEmail, role: "manager", organizationId: org.id },
    });
    expect(blockedRes.status()).toBe(403);

    const allowedRes = await managerPage.request.post("/api/auth/organization/invite-member", {
      headers: ORIGIN_HEADER,
      data: { email: allowedEmail, role: "cashier", organizationId: org.id },
    });
    expect(allowedRes.ok()).toBeTruthy();

    await managerContext.close();

    await cleanupTestUser(adminEmail);
    await cleanupTestUser(managerEmail);
    await cleanupInvitedEmail(blockedEmail);
    await cleanupInvitedEmail(allowedEmail);
  });
});
