import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@db";
import { member } from "@db/schema";
import { InviteStaffForm } from "@/components/dashboard/invite-staff-form";
import { getActiveOrganization } from "@/lib/organization";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  const org = await getActiveOrganization(session);

  if (!org) {
    redirect("/onboarding");
  }

  const currentMember = await db.query.member.findFirst({
    where: and(eq(member.organizationId, org.id), eq(member.userId, session.user.id)),
  });

  const canInvite =
    currentMember?.role === "siteAdmin" || currentMember?.role === "manager";

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-4 py-16">
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">Welcome to</p>
        <h1 className="text-2xl font-semibold text-foreground">
          {org.name}
        </h1>
      </div>

      {canInvite && (
        <InviteStaffForm
          organizationId={org.id}
          inviterRole={currentMember!.role as "siteAdmin" | "manager"}
        />
      )}
    </div>
  );
}
