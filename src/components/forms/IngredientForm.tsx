"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createIngredient, updateIngredient } from "@/actions/ingredients";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UNIT_LABELS, UNITS } from "@/config/constants";
import type { Ingredient } from "@/types";

const ingredientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  unit: z.string().min(1, "La unidad es requerida"),
  minStock: z.coerce
    .number()
    .min(0, "El stock mínimo no puede ser negativo")
    .optional(),
});

type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface IngredientFormProps {
  ingredient?: Ingredient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IngredientForm({
  ingredient,
  onSuccess,
  onCancel,
}: IngredientFormProps) {
  const router = useRouter();
  const isEditing = !!ingredient;
  const [isPending, startTransition] = useTransition();

  const form = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema) as Resolver<IngredientFormValues>,
    defaultValues: {
      name: ingredient?.name ?? "",
      description: ingredient?.description ?? "",
      unit: ingredient?.unit ?? UNITS[0],
      minStock: ingredient?.minStock ?? undefined,
    },
  });

  useEffect(() => {
    form.reset({
      name: ingredient?.name ?? "",
      description: ingredient?.description ?? "",
      unit: ingredient?.unit ?? UNITS[0],
      minStock: ingredient?.minStock ?? undefined,
    });
  }, [ingredient, form]);

  const onSubmit = (data: IngredientFormValues) => {
    startTransition(async () => {
      const action = isEditing ? updateIngredient : createIngredient;
      const result = await action({
        ...(isEditing && { id: ingredient.id }),
        name: data.name,
        unit: data.unit,
        minStock: data.minStock ?? null,
        description: data.description || null,
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="text-gray-900">
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Harina, Salsa de tomate"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="text-gray-900">
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  className="w-full resize-none"
                  placeholder="Detalles adicionales..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem className="text-gray-900">
                <FormLabel>Unidad</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem
                        className="text-gray-700 hover:bg-gray-100"
                        key={unit}
                        value={unit}
                      >
                        {UNIT_LABELS[unit]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minStock"
            render={({ field }) => (
              <FormItem className="text-gray-900">
                <FormLabel>Stock Mínimo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full"
                    placeholder="0.00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {ingredient && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
            <div>
              <p className="mb-1 text-gray-600">Stock Actual</p>
              <div className="font-semibold text-gray-900">
                {ingredient.currentStock} {ingredient.unit}
              </div>
            </div>
            <div>
              <p className="mb-1 text-gray-600">Último Costo</p>
              <div className="font-semibold text-green-600">
                ${(ingredient.cost || 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-md"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar Cambios"
                : "Crear Ingrediente"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
