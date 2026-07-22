import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@db";
import { invitation, user } from "@db/schema";
import { auth } from "@/lib/auth";

const bodySchema = z.object({
  invitationId: z.string(),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(128),
});

// Creates an account for someone accepting a staff invitation and signs them
// in immediately, without the standard email-verification step — clicking a
// link delivered to that exact invited email address is already sufficient
// proof of inbox control. Validated server-side against a real pending
// invitation for the same email, not just trusted from the client, so this
// can't be used to skip verification for an arbitrary signup.
export async function POST(request: Request) {
  const body = bodySchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { invitationId, name, password } = body.data;

  const invite = await db.query.invitation.findFirst({
    where: eq(invitation.id, invitationId),
  });

  if (
    !invite ||
    invite.status !== "pending" ||
    invite.expiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: "This invitation is invalid or has expired" },
      { status: 400 },
    );
  }

  const signUpResult = await auth.api.signUpEmail({
    body: { name, email: invite.email, password },
  });

  await db
    .update(user)
    .set({ emailVerified: true })
    .where(eq(user.id, signUpResult.user.id));

  const signInResponse = await auth.api.signInEmail({
    body: { email: invite.email, password },
    asResponse: true,
  });

  const response = NextResponse.json({ success: true });
  for (const cookie of signInResponse.headers.getSetCookie()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
