import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign up — CineSuite",
};

export default function SignupPage() {
  return (
    <AuthShell tagline="Nigeria Cinema Management SaaS — booking, box office, concessions, and back-office management in one place.">
      <SignupForm />
    </AuthShell>
  );
}
