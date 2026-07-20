import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@db";
import { member, organization } from "@db/schema";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  // A fresh sign-in doesn't carry over the activeOrganizationId set at signup —
  // fall back to the user's first membership. Good enough for the single-cinema
  // case; real org switching (multi-branch chains) is Task 7's job.
  const activeOrganizationId =
    session.session.activeOrganizationId ??
    (
      await db.query.member.findFirst({
        where: eq(member.userId, session.user.id),
      })
    )?.organizationId;

  const org = activeOrganizationId
    ? await db.query.organization.findFirst({
        where: eq(organization.id, activeOrganizationId),
      })
    : undefined;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">Welcome to</p>
        <h1 className="text-2xl font-semibold text-foreground">
          {org?.name ?? "CineSuite"}
        </h1>
      </div>
    </div>
  );
}
