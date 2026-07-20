import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { SigninForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign in — CineSuite",
};

export default function SigninPage() {
  return (
    <AuthShell tagline="Nigeria Cinema Management SaaS — booking, box office, concessions, and back-office management in one place.">
      <SigninForm />
    </AuthShell>
  );
}
