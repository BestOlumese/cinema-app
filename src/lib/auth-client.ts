import { createAuthClient } from "better-auth/react";
import {
  inferOrgAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";
import {
  ac,
  boxOffice,
  cashier,
  concessionsStaff,
  manager,
  siteAdmin,
} from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    organizationClient({
      ac,
      roles: { siteAdmin, manager, boxOffice, concessionsStaff, cashier },
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
  ],
});
