"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";

const ALL_ROLES = [
  { value: "cashier", label: "Cashier" },
  { value: "concessionsStaff", label: "Concessions Staff" },
  { value: "boxOffice", label: "Box Office" },
  { value: "manager", label: "Manager" },
  { value: "siteAdmin", label: "Site Admin" },
] as const;

const MANAGER_INVITABLE_ROLES = new Set(["cashier", "concessionsStaff", "boxOffice"]);

const inviteSchema = z.object({
  email: z.email("Enter a valid email address"),
  role: z.enum(["cashier", "concessionsStaff", "boxOffice", "manager", "siteAdmin"], {
    error: "Choose a role",
  }),
});

type InviteValues = z.infer<typeof inviteSchema>;

export function InviteStaffForm({
  organizationId,
  inviterRole,
}: {
  organizationId: string;
  inviterRole: "siteAdmin" | "manager";
}) {
  const availableRoles =
    inviterRole === "manager"
      ? ALL_ROLES.filter((role) => MANAGER_INVITABLE_ROLES.has(role.value))
      : ALL_ROLES;

  const form = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: "",
      role: undefined as unknown as InviteValues["role"],
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (values: InviteValues) => {
      const { error } = await authClient.organization.inviteMember({
        email: values.email,
        role: values.role,
        organizationId,
      });
      if (error) {
        throw new Error(error.message ?? "Couldn't send the invitation");
      }
    },
    onSuccess: (_data, values) => {
      toast.success(`Invitation sent to ${values.email}.`);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="w-full max-w-sm space-y-4 rounded-md border border-card-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-foreground">
          Invite a staff member
        </h2>
        <p className="text-sm text-muted-foreground">
          They&apos;ll get an email with a link to join.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit((values) => inviteMutation.mutate(values))}
        noValidate
      >
        <FieldGroup>
          <Field data-invalid={!!form.formState.errors.email}>
            <FieldLabel htmlFor="invite-email">Email</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              className="h-10"
              {...form.register("email")}
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field data-invalid={!!form.formState.errors.role}>
            <FieldLabel>Role</FieldLabel>
            <Select
              value={form.watch("role")}
              onValueChange={(value) =>
                form.setValue("role", value as InviteValues["role"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.role]} />
          </Field>

          <Button
            type="submit"
            className="h-10 w-full"
            disabled={inviteMutation.isPending}
          >
            {inviteMutation.isPending ? "Sending…" : "Send invitation"}
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
