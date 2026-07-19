import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins/organization";
import { db } from "@db";
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
    }),
    nextCookies(),
  ],
});
