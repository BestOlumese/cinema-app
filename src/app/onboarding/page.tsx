import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { auth } from "@/lib/auth";
import { getActiveOrganization } from "@/lib/organization";

export const metadata: Metadata = {
  title: "Set up your cinema — CineSuite",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/signin");
  }

  const org = await getActiveOrganization(session);

  if (org) {
    redirect("/dashboard");
  }

  return (
    <AuthShell tagline="A few quick details to set up your cinema.">
      <OnboardingWizard />
    </AuthShell>
  );
}
