"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { createOrganizationAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  includeSampleData: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function CreateOrgForm() {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      includeSampleData: true,
    },
  });

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("includeSampleData", String(data.includeSampleData));

      const res = await createOrganizationAction(formData);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Organización creada exitosamente");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="orgName">Nombre de la Organización</Label>
        <Input
          id="orgName"
          placeholder="Ej. Pizzería Don Mario"
          disabled={isPending}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="includeSampleData"
          disabled={isPending}
          {...register("includeSampleData")}
          defaultChecked
        />
        <Label
          htmlFor="includeSampleData"
          className="text-sm font-normal cursor-pointer"
        >
          Incluir datos de ejemplo (ingredientes y productos)
        </Label>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Creando..." : "Crear Organización"}
      </Button>
    </form>
  );
}
