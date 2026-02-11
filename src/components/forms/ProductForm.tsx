"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createProduct, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  DEFAULT_CATEGORIES,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
} from "@/config/constants";
import { cn } from "@/lib/utils";
import type { Ingredient, Product, ProductWithRelations } from "@/types";

const recipeItemSchema = z.object({
  ingredientId: z.string().optional().nullable(),
  subProductId: z.string().optional().nullable(),
  quantity: z.coerce.number().gt(0, "La cantidad debe ser mayor a 0"),
  unit: z.string().min(1, "La unidad es requerida"),
});

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(PRODUCT_TYPES),
  category: z.string().optional().nullable(),
  subCategory: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  basePrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
  manualCost: z.coerce
    .number()
    .min(0, "El costo no puede ser negativo")
    .optional()
    .nullable(),
  recipeItems: z.array(recipeItemSchema).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: ProductWithRelations;
  ingredients: Ingredient[];
  subProducts?: Product[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: "basic", title: "Datos Básicos" },
  { id: "recipe", title: "Receta" },
  { id: "pricing", title: "Precio y Costos" },
];

export function ProductForm({
  product,
  ingredients,
  subProducts = [],
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const isEditing = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      type: product?.type ?? "ELABORADO",
      category: product?.category ?? "",
      subCategory: product?.subCategory ?? "",
      description: product?.description ?? "",
      basePrice: product?.basePrice ?? 0,
      manualCost: product?.manualCost ?? 0,
      recipeItems:
        product?.receipeItems?.map((item) => ({
          ingredientId: item.ingredientId,
          subProductId: item.subProductId,
          quantity: item.quantity,
          unit: item.unit,
        })) ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipeItems",
  });

  const productType = form.watch("type");

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProductFormValues)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["name", "type", "category"];
    } else if (currentStep === 1) {
      if (productType === "ELABORADO") {
        fieldsToValidate = ["recipeItems"];
      }
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 0 && productType !== "ELABORADO") {
        setCurrentStep(2); // Skip recipe for non-elaborated
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep === 2 && productType !== "ELABORADO") {
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const action = isEditing ? updateProduct : createProduct;
      const result = await action({
        ...(isEditing && { id: product.id }),
        ...data,
        recipeItems: data.type === "ELABORADO" ? data.recipeItems : [],
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
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2">
        {STEPS.map((step, index) => {
          const isHidden = step.id === "recipe" && productType !== "ELABORADO";
          if (isHidden) return null;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  index === currentStep
                    ? "border-orange-500 bg-orange-500 text-white"
                    : index < currentStep
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-200 text-gray-400",
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "ml-2 text-xs font-medium hidden sm:block",
                  index === currentStep ? "text-gray-900" : "text-gray-500",
                )}
              >
                {step.title}
              </span>
              {index < STEPS.length - 1 &&
                !(index === 0 && productType !== "ELABORADO") && (
                  <div className="mx-4 h-[2px] w-8 bg-gray-200" />
                )}
            </div>
          );
        })}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 min-h-[300px]"
        >
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pizza Margarita, Pepsi 500ml..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRODUCT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {PRODUCT_TYPE_LABELS[type]}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEFAULT_CATEGORIES[productType].map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Breve descripción del producto..."
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Recipe Builder */}
          {currentStep === 1 && productType === "ELABORADO" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  Ingredientes de la Receta
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ ingredientId: "", quantity: 1, unit: "g" })
                  }
                  className="text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" /> Agregar Item
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <p className="text-sm text-gray-500 italic">
                    No hay ingredientes en esta receta.
                  </p>
                </div>
              )}

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg group"
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <FormField
                        control={form.control}
                        name={`recipeItems.${index}.ingredientId`}
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value ?? ""}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Ingrediente" />
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
                      <FormField
                        control={form.control}
                        name={`recipeItems.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                className="h-9"
                                placeholder="Cant."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`recipeItems.${index}.unit`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="h-9"
                                placeholder="Uni."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Costs */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Venta</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">
                          $
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          className="pl-8"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Precio final al que se vende el producto
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {productType !== "ELABORADO" && (
                <FormField
                  control={form.control}
                  name="manualCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo de Compra</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-gray-500">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-8"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Lo que te cuesta comprar este producto
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {productType === "ELABORADO" && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-orange-800">
                    <strong>Nota:</strong> Los costos para productos elaborados
                    se calculan automáticamente basándose en la receta y los
                    precios de compra de los ingredientes.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={currentStep === 0 ? onCancel : prevStep}
              disabled={isPending}
            >
              {currentStep === 0 ? "Cancelar" : "Anterior"}
            </Button>

            {currentStep < (productType === "ELABORADO" ? 2 : 2) &&
            currentStep < 2 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Siguiente <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-linear-to-r from-orange-500 to-red-600 text-white"
              >
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Guardar Cambios"
                    : "Crear Producto"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
