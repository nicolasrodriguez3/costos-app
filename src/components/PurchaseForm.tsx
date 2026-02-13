"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createIngredient } from "@/actions/ingredients";
import { createPurchase, updatePurchase } from "@/actions/purchases";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { UNITS } from "@/config/constants";
import type {
  IngredientPurchaseInput,
  IngredientWithStock,
  Purchase,
} from "@/types";

const ingredientPurchaseSchema = z.object({
  ingredientId: z.string().min(1, "Seleccione un ingrediente"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.string().min(1, "La unidad es requerida"),
  unitCost: z.number().positive("El costo debe ser mayor a 0"),
});

const purchaseFormSchema = z.object({
  purchaseDate: z.string().min(1, "La fecha es requerida"),
  invoiceNumber: z.string().optional(),
  supplierName: z.string().optional(),
  notes: z.string().optional(),
  ingredients: z
    .array(ingredientPurchaseSchema)
    .min(1, "Debe incluir al menos un ingrediente"),
});

type PurchaseFormValues = z.infer<typeof purchaseFormSchema>;

const newIngredientSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  unit: z.string().min(1, "Seleccione una unidad"),
});

type NewIngredientValues = z.infer<typeof newIngredientSchema>;

interface PurchaseFormProps {
  purchase?: Purchase & {
    ingredientPurchases?: (IngredientPurchaseInput & {
      ingredient?: IngredientWithStock;
    })[];
  };
  ingredients: IngredientWithStock[];
}

export function PurchaseForm({ purchase, ingredients }: PurchaseFormProps) {
  const isEditing = !!purchase;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseFormSchema),
    defaultValues: {
      purchaseDate: purchase?.purchaseDate
        ? new Date(purchase.purchaseDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      invoiceNumber: purchase?.invoiceNumber || "",
      supplierName: purchase?.supplierName || "",
      notes: purchase?.notes || "",
      ingredients: purchase?.ingredientPurchases?.map((ip) => ({
        ingredientId: ip.ingredientId,
        quantity: ip.quantity,
        unit: ip.unit,
        unitCost: ip.unitCost,
      })) || [
        {
          ingredientId: "",
          quantity: 0,
          unit: "",
          unitCost: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const newIngredientForm = useForm<NewIngredientValues>({
    resolver: zodResolver(newIngredientSchema),
    defaultValues: {
      name: "",
      unit: "",
    },
  });

  const watchedIngredients = form.watch("ingredients");
  const totalCost = watchedIngredients.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.unitCost || 0),
    0,
  );

  async function onSubmit(data: PurchaseFormValues) {
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set("purchaseDate", data.purchaseDate);
      formData.set("invoiceNumber", data.invoiceNumber || "");
      formData.set("supplierName", data.supplierName || "");
      formData.set("notes", data.notes || "");
      formData.set("ingredients", JSON.stringify(data.ingredients));

      if (isEditing && purchase) {
        formData.set("purchaseId", purchase.id);
      }

      const action = isEditing ? updatePurchase : createPurchase;
      const result = await action({}, formData);

      toast.success(result.message);
      form.reset();
    } catch (error) {
      console.log(error);
      toast.error("Error al procesar la compra");
    } finally {
      setIsPending(false);
    }
  }

  async function onCreateIngredient(data: NewIngredientValues) {
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("unit", data.unit);

    const result = await createIngredient({}, formData);

    if (result.success) {
      setCreateDialogOpen(false);
      newIngredientForm.reset();
    }

    return result;
  }

  const addIngredient = () => {
    append({
      ingredientId: "",
      quantity: 0,
      unit: "",
      unitCost: 0,
    });
  };

  return (
    <Card className="border-gray-500/10 shadow-sm w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {isEditing ? "Editar Compra" : "Registrar Compra"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isEditing && (
              <input type="hidden" name="purchaseId" value={purchase.id} />
            )}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Compra</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº de Factura (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0001-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Nombre del proveedor"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Notas adicionales sobre la compra..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel className="text-lg font-medium">
                  Ingredientes
                </FormLabel>
                <Button
                  type="button"
                  onClick={addIngredient}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Ingrediente
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="mb-4 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Controller
                        control={form.control}
                        name={`ingredients.${index}.ingredientId`}
                        render={({
                          field: { onChange, value },
                          fieldState,
                        }) => (
                          <FormItem>
                            <FormLabel>Ingrediente</FormLabel>
                            <Select
                              value={value}
                              onValueChange={(val) => {
                                onChange(val);
                                // Auto-fill unit when ingredient is selected
                                const selectedIngredient = ingredients.find(
                                  (ing) => ing.id === val,
                                );
                                if (selectedIngredient) {
                                  form.setValue(
                                    `ingredients.${index}.unit`,
                                    selectedIngredient.unit,
                                    { shouldValidate: true, shouldDirty: true },
                                  );
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger
                                  aria-invalid={fieldState.invalid}
                                >
                                  <SelectValue placeholder="Seleccionar ingrediente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ingredients.map((ing) => (
                                  <SelectItem key={ing.id} value={ing.id}>
                                    {ing.name} ({ing.unit})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`ingredients.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una unidad" />
                              </SelectTrigger>
                              <SelectContent>
                                {UNITS.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unitCost`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Costo/U</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          className="mb-[22px]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {form.formState.errors.ingredients?.root && (
                <p className="text-sm font-medium text-destructive mt-2">
                  {form.formState.errors.ingredients.root.message}
                </p>
              )}
            </div>

            {/* Total Cost */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Costo Total
                </span>
                <span className="text-lg font-bold text-green-900">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar Compra"
                    : "Registrar Compra"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Create Ingredient Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ingrediente</DialogTitle>
            </DialogHeader>
            <Form {...newIngredientForm}>
              <form
                onSubmit={newIngredientForm.handleSubmit(async (data) => {
                  const result = await onCreateIngredient(data);
                  if (!result.success) {
                    newIngredientForm.setError("root", {
                      message: result.message,
                    });
                  }
                })}
                className="space-y-4"
              >
                <FormField
                  control={newIngredientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newIngredientForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNITS.map((unit: string) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {newIngredientForm.formState.errors.root && (
                  <div className="p-3 rounded text-sm bg-red-100 text-red-700">
                    {newIngredientForm.formState.errors.root.message}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={newIngredientForm.formState.isSubmitting}
                  >
                    {newIngredientForm.formState.isSubmitting
                      ? "Creando..."
                      : "Crear Ingrediente"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
