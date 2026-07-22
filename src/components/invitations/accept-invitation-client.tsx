"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { authClient } from "@/lib/auth-client";

async function acceptAndRedirect(invitationId: string) {
  const { error } = await authClient.organization.acceptInvitation({
    invitationId,
  });
  if (error) {
    throw new Error(error.message ?? "Couldn't accept the invitation");
  }
  window.location.href = "/dashboard";
}

const newAccountSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});
type NewAccountValues = z.infer<typeof newAccountSchema>;

const signInSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
type SignInValues = z.infer<typeof signInSchema>;

export function AcceptInvitationClient({
  invitationId,
  email,
  organizationName,
  roleLabel,
  currentUserEmail,
}: {
  invitationId: string;
  email: string;
  organizationName: string;
  roleLabel: string;
  currentUserEmail: string | undefined;
}) {
  const [mode, setMode] = useState<"new" | "signin">("new");

  const header = (
    <div className="space-y-1 text-center">
      <h2 className="text-2xl font-semibold text-foreground">
        Join {organizationName}
      </h2>
      <p className="text-sm text-muted-foreground">
        You&apos;ve been invited as <strong>{roleLabel}</strong>.
      </p>
    </div>
  );

  // Already signed in, wrong account
  if (currentUserEmail && currentUserEmail.toLowerCase() !== email.toLowerCase()) {
    return (
      <div className="space-y-4">
        {header}
        <p className="text-center text-sm text-destructive">
          This invitation was sent to {email}, but you&apos;re signed in as{" "}
          {currentUserEmail}.
        </p>
        <Button
          variant="outline"
          className="h-11 w-full"
          onClick={async () => {
            await authClient.signOut();
            window.location.reload();
          }}
        >
          Sign out and try again
        </Button>
      </div>
    );
  }

  // Already signed in with the matching account — just accept
  if (currentUserEmail) {
    return <AlreadySignedIn invitationId={invitationId} header={header} />;
  }

  return (
    <div className="space-y-4">
      {header}

      {mode === "new" ? (
        <NewAccountForm
          invitationId={invitationId}
          email={email}
          onSwitchToSignIn={() => setMode("signin")}
        />
      ) : (
        <SignInForm
          invitationId={invitationId}
          email={email}
          onSwitchToNew={() => setMode("new")}
        />
      )}
    </div>
  );
}

function AlreadySignedIn({
  invitationId,
  header,
}: {
  invitationId: string;
  header: React.ReactNode;
}) {
  const acceptMutation = useMutation({
    mutationFn: () => acceptAndRedirect(invitationId),
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="space-y-4">
      {header}
      <Button
        className="h-11 w-full"
        disabled={acceptMutation.isPending}
        onClick={() => acceptMutation.mutate()}
      >
        {acceptMutation.isPending ? "Joining…" : "Accept invitation"}
      </Button>
    </div>
  );
}

function NewAccountForm({
  invitationId,
  email,
  onSwitchToSignIn,
}: {
  invitationId: string;
  email: string;
  onSwitchToSignIn: () => void;
}) {
  const form = useForm<NewAccountValues>({
    resolver: zodResolver(newAccountSchema),
    defaultValues: { name: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: NewAccountValues) => {
      const res = await fetch("/api/invitations/accept-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, ...values }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Couldn't create your account");
      }
      await acceptAndRedirect(invitationId);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input id="invite-email" value={email} disabled className="h-11" />
        </Field>

        <Field data-invalid={!!form.formState.errors.name}>
          <FieldLabel htmlFor="invite-name">Your name</FieldLabel>
          <Input
            id="invite-name"
            autoComplete="name"
            className="h-11"
            {...form.register("name")}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="invite-password">Password</FieldLabel>
          <PasswordInput
            id="invite-password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Button type="submit" size="lg" className="h-11 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Joining…" : "Create account & join"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </p>
      </FieldGroup>
    </form>
  );
}

function SignInForm({
  invitationId,
  email,
  onSwitchToNew,
}: {
  invitationId: string;
  email: string;
  onSwitchToNew: () => void;
}) {
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: SignInValues) => {
      const { error } = await authClient.signIn.email({
        email,
        password: values.password,
      });
      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          throw new Error(
            "Please verify your email first — check your inbox for the verification link.",
          );
        }
        throw new Error(error.message ?? "Couldn't sign you in");
      }
      await acceptAndRedirect(invitationId);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      noValidate
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="invite-signin-email">Email</FieldLabel>
          <Input id="invite-signin-email" value={email} disabled className="h-11" />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="invite-signin-password">Password</FieldLabel>
          <PasswordInput
            id="invite-signin-password"
            autoComplete="current-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Button type="submit" size="lg" className="h-11 w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in…" : "Sign in & join"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Need to create an account instead?{" "}
          <button
            type="button"
            onClick={onSwitchToNew}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </button>
        </p>
      </FieldGroup>
    </form>
  );
}
