"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { joinOrganizationAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  organizationId: z.string().min(1, "El ID es requerido"),
});

type FormData = z.infer<typeof schema>;

export function JoinOrgForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: "",
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("organizationId", data.organizationId);

      const res = await joinOrganizationAction({}, formData);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Te has unido a la organización");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="orgId">ID de la Organización</Label>
        <Input
          id="orgId"
          placeholder="Ingresa el ID provisto por tu administrador"
          disabled={isPending}
          {...register("organizationId")}
        />
        {errors.organizationId && (
          <p className="text-sm text-red-500">
            {errors.organizationId.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Pídele el ID al administrador de tu organización.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Uniéndome..." : "Unirme a Organización"}
      </Button>
    </form>
  );
}
