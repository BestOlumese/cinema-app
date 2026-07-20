"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { authClient } from "@/lib/auth-client";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";

export function SigninForm() {
  const router = useRouter();
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signInMutation = useMutation({
    mutationFn: async (values: SignInValues) => {
      const { error } = await authClient.signIn.email(values);
      if (error) {
        throw new Error(error.message ?? "Couldn't sign you in");
      }
    },
    onSuccess: () => {
      toast.success("Welcome back.");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) => signInMutation.mutate(values))}
      noValidate
    >
      <FieldGroup>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            Sign in
          </h2>
          <p className="text-sm text-muted-foreground">
            Welcome back to CineSuite.
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
            autoComplete="current-password"
            className="h-11"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={signInMutation.isPending}
        >
          {signInMutation.isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
