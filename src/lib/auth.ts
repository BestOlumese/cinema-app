import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { db } from "@db";
import { branch } from "@db/schema";
import * as schema from "@db/schema";
import {
  ac,
  boxOffice,
  cashier,
  concessionsStaff,
  manager,
  siteAdmin,
} from "@/lib/permissions";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    organization({
      ac,
      roles: { siteAdmin, manager, boxOffice, concessionsStaff, cashier },
      creatorRole: "siteAdmin",
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
      },
    }),
    nextCookies(),
  ],
});
