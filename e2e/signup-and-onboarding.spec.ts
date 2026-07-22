import { expect, test } from "@playwright/test";
import { cleanupTestUser } from "./helpers/db";
import { waitForMailLink } from "./helpers/mail";

const PASSWORD = "TestPass123!";

test.describe("self-serve signup + onboarding (Phase 1 Tasks 1, 2 & 4)", () => {
  test("signup requires email verification, then onboarding creates the org", async ({ page }) => {
    const email = `e2e-signup-${Date.now()}@example.com`;

    await page.goto("/signup");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByLabel("Confirm password").fill(PASSWORD);
    await page.getByRole("checkbox", { name: /agree to the Terms/ }).click();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    // Grab the original signup verification link before attempting the
    // blocked sign-in below — `emailVerification.sendOnSignIn` re-sends a
    // fresh (different callbackURL) link on a failed unverified sign-in, and
    // waitForMailLink always returns the latest email to this address.
    const verifyLink = await waitForMailLink(email);

    // Sign-in must be blocked until the link is clicked (Task 4 scope expansion).
    await page.goto("/signin");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/verify your email first/i)).toBeVisible();

    await page.goto(verifyLink);

    // autoSignInAfterVerification + callbackURL=/onboarding lands here directly.
    await expect(page).toHaveURL(/\/onboarding$/);

    await page.getByLabel("Your name").fill("E2E Test Owner");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    const cinemaName = `E2E Cinema ${Date.now()}`;
    await page.getByLabel("Cinema name").fill(cinemaName);
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("radio", { name: /Independent cinema/ }).click();
    await page.getByRole("button", { name: "Finish setup" }).click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: cinemaName })).toBeVisible();

    await cleanupTestUser(email);
  });
});
