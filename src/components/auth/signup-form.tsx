"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrengthMeter } from "@/components/auth/password-strength-meter";
import { authClient } from "@/lib/auth-client";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";

export function SignupForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = form.watch("password");

  const signUpMutation = useMutation({
    mutationFn: async (values: SignUpValues) => {
      // Better Auth's user.name column is required — a real name is
      // collected in onboarding step 1, this is just a placeholder until then.
      const placeholderName = values.email.split("@")[0];

      const { error } = await authClient.signUp.email({
        name: placeholderName,
        email: values.email,
        password: values.password,
        callbackURL: "/onboarding",
      });

      if (error) {
        throw new Error(error.message ?? "Couldn't create your account");
      }
    },
    onSuccess: (_data, values) => {
      setSentTo(values.email);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent">
          <MailCheck className="size-5 text-accent-foreground" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Check your email
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to <strong>{sentTo}</strong>. Click
            it to finish setting up your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit((values) => signUpMutation.mutate(values))}
      noValidate
    >
      <FieldGroup>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Create your account
          </h2>
          <p className="text-sm text-muted-foreground">
            Set up your cinema on CineSuite.
          </p>
        </div>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            className="h-11"
            {...form.register("password")}
          />
          <PasswordStrengthMeter password={password} />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Field data-invalid={!!form.formState.errors.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            className="h-11"
            {...form.register("confirmPassword")}
          />
          <FieldError errors={[form.formState.errors.confirmPassword]} />
        </Field>

        <Field
          orientation="horizontal"
          data-invalid={!!form.formState.errors.acceptTerms}
        >
          <Checkbox
            id="acceptTerms"
            className="mt-0.5"
            checked={form.watch("acceptTerms") === true}
            onCheckedChange={(checked) =>
              form.setValue("acceptTerms", checked === true, {
                shouldValidate: true,
              })
            }
          />
          <FieldLabel htmlFor="acceptTerms" className="font-normal">
            I agree to the Terms of Service and Privacy Policy
          </FieldLabel>
        </Field>
        <FieldError errors={[form.formState.errors.acceptTerms]} />

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
