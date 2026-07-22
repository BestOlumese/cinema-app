import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { and, eq } from "drizzle-orm";
import { db } from "@db";
import { branch, member } from "@db/schema";
import * as schema from "@db/schema";
import {
  ac,
  boxOffice,
  cashier,
  concessionsStaff,
  MANAGER_INVITABLE_ROLES,
  manager,
  siteAdmin,
} from "@/lib/permissions";
import { sendMail } from "@/lib/mailer";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // The user must click the link in their inbox before they can sign in.
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    // Resend a fresh link automatically if an unverified user tries to sign in.
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Verify your email — CineSuite",
        html: `<p>Click the link below to verify your email and finish setting up your CineSuite account.</p><p><a href="${url}">Verify email</a></p>`,
      });
    },
  },
  plugins: [
    organization({
      ac,
      roles: { siteAdmin, manager, boxOffice, concessionsStaff, cashier },
      creatorRole: "siteAdmin",
      // Accepting the invite (a link delivered to that exact email address)
      // is sufficient proof of inbox control — no separate verification step
      // for invited staff, only for self-serve signups above.
      requireEmailVerificationOnInvitation: false,
      schema: {
        organization: {
          additionalFields: {
            tenancyType: {
              type: ["independent", "chain"],
              required: true,
              input: true,
            },
          },
        },
      },
      sendInvitationEmail: async (data) => {
        const url = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?id=${data.id}`;
        await sendMail({
          to: data.email,
          subject: `You've been invited to join ${data.organization.name} on CineSuite`,
          html: `<p>You've been invited to join <strong>${data.organization.name}</strong> as ${data.role}.</p><p><a href="${url}">Accept invitation</a></p>`,
        });
      },
      organizationHooks: {
        afterCreateOrganization: async ({ organization: org }) => {
          // Every organization gets exactly one branch at signup — for
          // "independent" this is its single site, for "chain" this is its
          // head office (more branches are added later, Phase 10). The
          // head-office name (if provided at signup) travels in `metadata`
          // since it's not a field on `organization` itself.
          const metadata =
            typeof org.metadata === "string"
              ? (JSON.parse(org.metadata) as { branchName?: string })
              : (org.metadata as { branchName?: string } | undefined);

          await db.insert(branch).values({
            organizationId: org.id,
            name: metadata?.branchName?.trim() || org.name,
          });
        },
        beforeCreateInvitation: async ({ invitation, inviter, organization: org }) => {
          const inviterMember = await db.query.member.findFirst({
            where: and(
              eq(member.organizationId, org.id),
              eq(member.userId, inviter.id),
            ),
          });

          if (
            inviterMember?.role === "manager" &&
            !MANAGER_INVITABLE_ROLES.has(invitation.role)
          ) {
            throw new APIError("FORBIDDEN", {
              message: "Managers can't invite Managers or Site Admins.",
            });
          }
        },
      },
    }),
    nextCookies(),
  ],
});
