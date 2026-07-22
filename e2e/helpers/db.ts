import "dotenv/config";
import { eq, inArray } from "drizzle-orm";
import { db } from "@db";
import {
  account,
  branch,
  invitation,
  member,
  organization,
  session,
  user,
  verification,
} from "@db/schema";

// Test-only teardown — deletes everything this test's user created, mirroring
// the manual cleanup done during Task 4's real-inbox verification. Never runs
// against anything but the accounts/orgs a test itself created.
export async function cleanupTestUser(email: string) {
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existingUser) {
    const memberships = await db.query.member.findMany({
      where: eq(member.userId, existingUser.id),
    });
    const orgIds = memberships.map((m) => m.organizationId);

    await db.delete(session).where(eq(session.userId, existingUser.id));
    await db.delete(account).where(eq(account.userId, existingUser.id));
    await db.delete(invitation).where(eq(invitation.inviterId, existingUser.id));
    await db.delete(member).where(eq(member.userId, existingUser.id));

    if (orgIds.length) {
      await db.delete(invitation).where(inArray(invitation.organizationId, orgIds));
      await db.delete(member).where(inArray(member.organizationId, orgIds));
      await db.delete(branch).where(inArray(branch.organizationId, orgIds));
      await db.delete(organization).where(inArray(organization.id, orgIds));
    }

    await db.delete(user).where(eq(user.id, existingUser.id));
  }

  await db.delete(verification).where(eq(verification.identifier, email));
}

export async function cleanupInvitedEmail(email: string) {
  const invitedUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (invitedUser) {
    await db.delete(session).where(eq(session.userId, invitedUser.id));
    await db.delete(account).where(eq(account.userId, invitedUser.id));
    await db.delete(member).where(eq(member.userId, invitedUser.id));
    await db.delete(user).where(eq(user.id, invitedUser.id));
  }

  await db.delete(invitation).where(eq(invitation.email, email));
}

// Test fixture helper only — bypasses the real email-click verification
// (already covered end-to-end in signup.spec.ts) so invitation.spec.ts can
// get a signed-in Site Admin quickly and focus on the invite flow itself.
export async function verifyUserEmail(email: string) {
  await db.update(user).set({ emailVerified: true }).where(eq(user.email, email));
}

export async function getOrganizationBySlug(slug: string) {
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, slug),
  });
  if (!org) throw new Error(`No organization found for slug ${slug}`);
  return org;
}

export async function getMemberRole(organizationId: string, userEmail: string) {
  const memberUser = await db.query.user.findFirst({
    where: eq(user.email, userEmail),
  });
  if (!memberUser) return undefined;

  const memberRow = await db.query.member.findFirst({
    where: eq(member.userId, memberUser.id),
  });
  return memberRow?.organizationId === organizationId ? memberRow.role : undefined;
}

export async function insertMemberWithRole(
  organizationId: string,
  userEmail: string,
  role: string,
) {
  const memberUser = await db.query.user.findFirst({
    where: eq(user.email, userEmail),
  });
  if (!memberUser) throw new Error(`No user found for ${userEmail}`);

  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId,
    userId: memberUser.id,
    role,
    createdAt: new Date(),
  });
}
