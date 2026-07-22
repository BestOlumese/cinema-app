import { eq } from "drizzle-orm";
import { db } from "@db";
import { member, organization } from "@db/schema";

type SessionLike = {
  session: { activeOrganizationId?: string | null };
  user: { id: string };
};

// A fresh sign-in doesn't carry over the activeOrganizationId set at signup —
// fall back to the user's first membership. Good enough for the
// single-cinema case; real org switching (multi-branch chains) is Task 7's job.
export async function getActiveOrganization(session: SessionLike) {
  const activeOrganizationId =
    session.session.activeOrganizationId ??
    (
      await db.query.member.findFirst({
        where: eq(member.userId, session.user.id),
      })
    )?.organizationId;

  if (!activeOrganizationId) return null;

  return (
    (await db.query.organization.findFirst({
      where: eq(organization.id, activeOrganizationId),
    })) ?? null
  );
}
