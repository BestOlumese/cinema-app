import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@db";
import { invitation } from "@db/schema";
import { AuthShell } from "@/components/auth/auth-shell";
import { AcceptInvitationClient } from "@/components/invitations/accept-invitation-client";
import { auth } from "@/lib/auth";

const ROLE_LABELS: Record<string, string> = {
  cashier: "Cashier",
  concessionsStaff: "Concessions Staff",
  boxOffice: "Box Office",
  manager: "Manager",
  siteAdmin: "Site Admin",
};

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const invite = id
    ? await db.query.invitation.findFirst({
        where: eq(invitation.id, id),
        with: { organization: true },
      })
    : undefined;

  const isValid =
    !!invite && invite.status === "pending" && invite.expiresAt > new Date();

  return (
    <AuthShell tagline="You've been invited to join a cinema on CineSuite.">
      {!isValid || !invite ? (
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            Invitation not found
          </h2>
          <p className="text-sm text-muted-foreground">
            This invitation link is invalid or has expired. Ask whoever
            invited you to send a new one.
          </p>
        </div>
      ) : (
        <AcceptInvitationClient
          invitationId={invite.id}
          email={invite.email}
          organizationName={invite.organization.name}
          roleLabel={ROLE_LABELS[invite.role ?? ""] ?? invite.role ?? "staff"}
          currentUserEmail={session?.user.email}
        />
      )}
    </AuthShell>
  );
}
