import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="space-y-1 text-center">
        <p className="text-sm text-muted-foreground">Welcome to</p>
        <h1 className="text-2xl font-semibold text-foreground">
          {org.name}
        </h1>
      </div>
    </div>
  );
}
