"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { createIngredient, updateIngredient } from "@/actions/ingredients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UNIT_LABELS, UNITS } from "@/config/constants";
import type { ActionState, Ingredient } from "@/types";

const initialState: ActionState = {
  message: "",
};

interface IngredientFormProps {
  ingredient?: Ingredient;
}

export function IngredientForm({ ingredient }: IngredientFormProps) {
  const router = useRouter();
  const isEditing = !!ingredient;
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateIngredient : createIngredient,
    initialState,
  );

  // Reset form and clear URL when success
  useEffect(() => {
    if (state?.success) {
      if (!isEditing && formRef.current) {
        formRef.current.reset();
      }

      // Clear the edit search param from URL
      router.replace("/ingredients");
    }
  }, [state, isEditing, router]);

  return (
    <Card className="rounded-2xl shadow-xl border-gray-900/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          {isEditing ? "Editar Ingrediente" : "Agregar Ingrediente"}
        </CardTitle>
        {isEditing && (
          <Link
            href="/ingredients"
            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
          >
            Cancelar Edición
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEditing && <input type="hidden" name="id" value={ingredient.id} />}

          <div>
            <Label className="mb-2 block" htmlFor="name">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              key={ingredient?.id}
              defaultValue={ingredient?.name}
              className="w-full"
              placeholder="e.g., Harina, Salsa de tomate"
            />
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="description">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              key={ingredient?.id}
              defaultValue={ingredient?.description || ""}
              className="w-full resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block">Unidad</Label>
              <Select
                name="unit"
                key={ingredient?.id}
                defaultValue={ingredient?.unit || UNITS[0]}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {UNIT_LABELS[unit]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block" htmlFor="minStock">
                Stock Mínimo (Opcional)
              </Label>
              <Input
                id="minStock"
                name="minStock"
                type="number"
                step="0.01"
                min="0"
                key={ingredient?.id}
                defaultValue={ingredient?.minStock || ""}
                className="w-full"
                placeholder="0.00"
              />
            </div>
          </div>

          {ingredient && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="mb-2 block text-sm text-gray-600">
                  Stock Actual
                </Label>
                <div className="font-semibold">
                  {ingredient.currentStock} {ingredient.unit}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm text-gray-600">
                  Último Costo
                </Label>
                <div className="font-semibold">$0.00 (Sin compras)</div>
              </div>
            </div>
          )}

          {state?.message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                state.success
                  ? "bg-green-500/20 text-green-700"
                  : "bg-red-500/20 text-red-700"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg text-white"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Actualizar Ingrediente"
                : "Agregar Ingrediente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
