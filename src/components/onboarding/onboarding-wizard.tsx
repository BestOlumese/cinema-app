"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/onboarding/stepper";
import { TenancyChoice } from "@/components/auth/tenancy-choice";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/lib/slug";
import { onboardingSchema, type OnboardingValues } from "@/lib/validations/auth";

const STEPS = ["Your name", "Cinema name", "Cinema type"];
const STEP_FIELDS: (keyof OnboardingValues)[][] = [
  ["name"],
  ["organizationName"],
  ["tenancyType", "branchName"],
];

async function createOrganizationWithUniqueSlug(values: OnboardingValues) {
  const base = slugify(values.organizationName) || "cinema";
  let attempt = base;

  for (let i = 0; i < 5; i++) {
    const { data, error } = await authClient.organization.create({
      name: values.organizationName,
      slug: attempt,
      tenancyType: values.tenancyType,
      metadata:
        values.tenancyType === "chain" && values.branchName
          ? { branchName: values.branchName }
          : undefined,
    });

    if (!error) return data;

    if (error.code !== "ORGANIZATION_SLUG_ALREADY_TAKEN") {
      throw new Error(error.message ?? "Couldn't create your cinema account");
    }

    attempt = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  throw new Error("Couldn't create your cinema account");
}

export function OnboardingWizard() {
  const [step, setStep] = useState(0);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      organizationName: "",
      tenancyType: undefined as unknown as OnboardingValues["tenancyType"],
      branchName: "",
    },
  });

  const tenancyType = form.watch("tenancyType");

  const finishMutation = useMutation({
    mutationFn: async (values: OnboardingValues) => {
      const { error: updateError } = await authClient.updateUser({
        name: values.name,
      });
      if (updateError) {
        throw new Error(updateError.message ?? "Couldn't save your name");
      }

      await createOrganizationWithUniqueSlug(values);
    },
    onSuccess: () => {
      toast.success("Welcome to CineSuite — your cinema account is ready.");
      // Hard navigation, not router.push: the dashboard's server-side org
      // lookup must see the org this mutation just created, and the client
      // router cache can otherwise serve a stale "no org yet" RSC response.
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isLastStep = step === STEPS.length - 1;

  async function handleContinue() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;

    if (isLastStep) {
      finishMutation.mutate(form.getValues());
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div>
      <Stepper steps={STEPS} currentStep={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleContinue();
        }}
      >
        <FieldGroup>
          {step === 0 && (
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Your name</FieldLabel>
              <Input
                id="name"
                autoComplete="name"
                autoFocus
                className="h-11"
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
          )}

          {step === 1 && (
            <Field data-invalid={!!form.formState.errors.organizationName}>
              <FieldLabel htmlFor="organizationName">Cinema name</FieldLabel>
              <Input
                id="organizationName"
                autoComplete="organization"
                autoFocus
                className="h-11"
                {...form.register("organizationName")}
              />
              <FieldError errors={[form.formState.errors.organizationName]} />
            </Field>
          )}

          {step === 2 && (
            <>
              <Field data-invalid={!!form.formState.errors.tenancyType}>
                <FieldLabel>Cinema type</FieldLabel>
                <TenancyChoice
                  value={tenancyType}
                  onChange={(value) =>
                    form.setValue("tenancyType", value, {
                      shouldValidate: true,
                    })
                  }
                />
                <FieldError errors={[form.formState.errors.tenancyType]} />
              </Field>

              {tenancyType === "chain" && (
                <Field data-invalid={!!form.formState.errors.branchName}>
                  <FieldLabel htmlFor="branchName">
                    Head office name
                  </FieldLabel>
                  <Input
                    id="branchName"
                    autoFocus
                    className="h-11"
                    {...form.register("branchName")}
                  />
                  <FieldError errors={[form.formState.errors.branchName]} />
                </Field>
              )}
            </>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-11"
                onClick={() => setStep((s) => s - 1)}
                disabled={finishMutation.isPending}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              size="lg"
              className="h-11 flex-1"
              disabled={finishMutation.isPending}
            >
              {finishMutation.isPending
                ? "Finishing…"
                : isLastStep
                  ? "Finish setup"
                  : "Next"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}
