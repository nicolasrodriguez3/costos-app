"use client";

import { createFixedCost, updateFixedCost } from "@/actions/fixedCosts";
import type { ActionState, FixedCost } from "@/types";
import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState: ActionState = {
  message: "",
};

interface FixedCostFormProps {
  fixedCost?: FixedCost;
}

export function FixedCostForm({ fixedCost }: FixedCostFormProps) {
  const router = useRouter();
  const isEditing = !!fixedCost;
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    isEditing ? updateFixedCost : createFixedCost,
    initialState,
  );

  // Reset form and clear URL when success
  useEffect(() => {
    if (state?.success) {
      if (!isEditing && formRef.current) {
        formRef.current.reset();
      }

      // Clear the edit search param from URL
      router.replace("/expenses");
    }
  }, [state, isEditing, router]);

  return (
    <Card className="rounded-2xl shadow-xl border-gray-900/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          {isEditing ? "Editar Gasto" : "Agregar Gasto Fijo"}
        </CardTitle>
        {isEditing && (
          <Link
            href="/expenses"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Cancelar Edición
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEditing && <input type="hidden" name="id" value={fixedCost.id} />}

          <div>
            <Label className="mb-2 block" htmlFor="name">
              Nombre / Concepto
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              key={fixedCost?.id}
              defaultValue={fixedCost?.name}
              className="w-full"
              placeholder="e.g., Alquiler, Sueldos, Luz"
            />
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="amount">
              Monto Mensual ($)
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              required
              key={fixedCost?.id}
              defaultValue={fixedCost?.amount}
              className="w-full"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label className="mb-2 block" htmlFor="category">
              Categoría (Opcional)
            </Label>
            <Input
              id="category"
              name="category"
              type="text"
              key={fixedCost?.id}
              defaultValue={fixedCost?.category || ""}
              className="w-full"
              placeholder="e.g., Alquiler, Servicios, Personal"
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
              key={fixedCost?.id}
              defaultValue={fixedCost?.description || ""}
              className="w-full resize-none"
              placeholder="Detalles adicionales..."
            />
          </div>

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
            className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg text-white"
          >
            {isPending
              ? "Guardando..."
              : isEditing
                ? "Actualizar Gasto"
                : "Agregar Gasto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
