"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { type Resolver, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createProduct, updateProduct } from "@/actions/products";
import { convertCost } from "@/actions/utils/unitConversion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CATEGORIES,
  PRODUCT_TYPE_ICONS,
  PRODUCT_TYPE_LABELS,
  PRODUCT_TYPES,
  type ProductType,
  UNITS,
} from "@/config/constants";
import { useProductDraftStore } from "@/store/product-draft-store";
import type {
  IngredientWithStock,
  ProductBase,
  ProductWithRelations,
} from "@/types";

// --- Zod Schema ---

const recipeItemSchema = z.object({
  ingredientId: z.string().nullable().optional(),
  subProductId: z.string().nullable().optional(),
  quantity: z.coerce.number().min(0, "La cantidad no puede ser negativa"),
  unit: z.string().min(1, "La unidad es requerida"),
});

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.string().min(1, "El tipo es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  subCategory: z.string().optional(),
  basePrice: z.coerce
    .number()
    .min(0, "El precio no puede ser negativo")
    .optional(),
  manualCost: z.coerce.number().min(0).optional(),
  recipeItems: z.array(recipeItemSchema).optional(),
});

type ProductFormValues = {
  name: string;
  type: string;
  category: string;
  basePrice?: number | null | undefined;
  subCategory?: string | undefined;
  manualCost?: number | undefined;
  recipeItems?:
    | {
        quantity: number;
        unit: string;
        ingredientId?: string | null | undefined;
        subProductId?: string | null | undefined;
      }[]
    | undefined;
};
type ProductFormValuesWithOrg = ProductFormValues & { organizationId: string };
// --- Props ---

type ProductFormProps = {
  ingredients: IngredientWithStock[];
  products: (ProductBase & { cost: number })[];
  initialData?: ProductWithRelations;
  organizationId: string;
};

// --- Component ---

export function ProductForm({
  ingredients,
  products,
  initialData,
  organizationId,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isPending, startTransition] = useTransition();

  // Read store actions (stable references) and snapshot once on mount
  const { saveDraft, clearDraft } = useProductDraftStore();
  const initialDraft = useRef(useProductDraftStore.getState());

  // Build default values: prefer draft (creation only) > initialData > empty
  const getDefaultValues = useCallback((): ProductFormValues => {
    if (isEditing) {
      return {
        name: initialData?.name ?? "",
        type: initialData?.type ?? "ELABORADO",
        category: initialData?.category ?? DEFAULT_CATEGORIES.ELABORADO[0],
        subCategory: initialData?.subCategory ?? "",
        basePrice: initialData?.basePrice,
        manualCost: initialData?.manualCost ?? undefined,
        recipeItems:
          initialData?.receipeItems?.map((item) => ({
            ingredientId: item.ingredientId ?? null,
            subProductId: item.subProductId ?? null,
            quantity: item.quantity,
            unit: item.unit,
          })) ?? [],
      };
    }

    if (
      initialDraft.current.hasDraft &&
      initialDraft.current.draft.organizationId === organizationId
    )
      return initialDraft.current.draft;

    return {
      name: "",
      type: "ELABORADO",
      category: DEFAULT_CATEGORIES.ELABORADO[0],
      subCategory: "",
      basePrice: undefined,
      manualCost: undefined,
      recipeItems: [],
    };
  }, [isEditing, initialData, organizationId]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: getDefaultValues(),
  });

  // Show a one-time toast if draft was restored
  const draftRestoredRef = useRef(false);
  useEffect(() => {
    if (
      !isEditing &&
      initialDraft.current.hasDraft &&
      initialDraft.current.draft.organizationId === organizationId &&
      !draftRestoredRef.current
    ) {
      draftRestoredRef.current = true;
      toast.info("Se restauró un borrador guardado.");
    }
  }, [isEditing, organizationId]);

  // Auto-save draft via watch subscription (no re-renders)
  useEffect(() => {
    if (isEditing) return;

    const subscription = form.watch((values) => {
      const hasContent =
        values.name ||
        (values.recipeItems && values.recipeItems.length > 0) ||
        (values.basePrice && values.basePrice > 0);

      if (hasContent) {
        saveDraft({
          ...values,
          organizationId,
        } as ProductFormValuesWithOrg);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isEditing, saveDraft, organizationId]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "recipeItems",
  });

  const watchType = form.watch("type") as ProductType;
  const watchRecipeItems = form.watch("recipeItems") ?? [];

  // Update category when product type changes
  const handleTypeChange = (newType: ProductType) => {
    form.setValue("type", newType);
    form.setValue("category", DEFAULT_CATEGORIES[newType][0]);
    if (newType !== "ELABORADO") {
      // Clear recipe items when switching away from ELABORADO
      form.setValue("recipeItems", []);
    }
  };

  const addIngredient = () => {
    const usedIds = new Set(
      watchRecipeItems.map((item) => item.ingredientId || item.subProductId),
    );

    const unusedIngredients = ingredients.filter((ing) => !usedIds.has(ing.id));

    if (ingredients.length > 0 && unusedIngredients.length > 0) {
      append({
        ingredientId: unusedIngredients[0].id,
        subProductId: null,
        quantity: 1,
        unit: unusedIngredients[0].unit,
      });
    } else if (products.length > 0) {
      append({
        ingredientId: null,
        subProductId: products[0].id,
        quantity: 1,
        unit: "unit",
      });
    } else {
      toast.error("No hay más ingredientes disponibles.");
    }
  };

  const handleItemSelect = (index: number, value: string) => {
    if (!value) return;

    const isIng = value.startsWith("ing_");
    const id = value.replace("ing_", "").replace("prod_", "");

    if (isIng) {
      const ing = ingredients.find((i) => i.id === id);
      if (ing) {
        form.setValue(`recipeItems.${index}.ingredientId`, id);
        form.setValue(`recipeItems.${index}.subProductId`, null);
        form.setValue(`recipeItems.${index}.unit`, ing.unit);
      }
    } else {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        form.setValue(`recipeItems.${index}.ingredientId`, null);
        form.setValue(`recipeItems.${index}.subProductId`, id);
        form.setValue(`recipeItems.${index}.unit`, "unit");
      }
    }
  };

  // Calculate cost preview
  const currentCost = watchRecipeItems.reduce((acc, item) => {
    if (item.ingredientId) {
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      return (
        acc +
        (ing && ing.lastCost
          ? convertCost(item.quantity, item.unit, ing.unit, ing.lastCost)
          : 0)
      );
    }
    if (item.subProductId) {
      const prod = products.find((p) => p.id === item.subProductId);
      return acc + (prod ? item.quantity * prod.cost : 0);
    }
    return acc;
  }, 0);

  const handleClearForm = useCallback(() => {
    const empty: ProductFormValues = {
      name: "",
      type: "ELABORADO",
      category: "",
      subCategory: "",
      basePrice: null,
      manualCost: undefined,
      recipeItems: [],
    };
    form.reset(empty);
    clearDraft();
  }, [form, clearDraft]);

  const onSubmit = (data: ProductFormValues) => {
    startTransition(async () => {
      const action = isEditing ? updateProduct : createProduct;
      const result = await action({
        ...(isEditing && { id: initialData.id }),
        name: data.name,
        type: data.type,
        category: data.category,
        subCategory: data.subCategory || null,
        basePrice: data.basePrice ?? 0,
        manualCost: data.manualCost ?? null,
        recipeItems:
          data.type === "ELABORADO"
            ? (data.recipeItems ?? []).map((item) => ({
                ingredientId: item.ingredientId || null,
                subProductId: item.subProductId || null,
                quantity: item.quantity,
                unit: item.unit,
              }))
            : [],
      });

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        handleClearForm();
        router.push("/products");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Card className="rounded-2xl shadow-xl border-gray-900/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold text-gray-900">
          {isEditing ? `Editar ${initialData.name}` : "Crear Producto"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ej. Pizza Muzzarella"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Type (radio cards) */}
            <div>
              <span className="block text-sm font-medium text-gray-900 mb-1">
                Tipo
              </span>
              <div className="flex gap-2">
                {PRODUCT_TYPES.map((type) => (
                  <label htmlFor={type} key={type}>
                    <input
                      type="radio"
                      id={type}
                      value={type}
                      checked={watchType === type}
                      onChange={() => handleTypeChange(type)}
                      hidden
                    />
                    <Card
                      className={`cursor-pointer transition-all py-4 h-full border-input ${
                        watchType === type
                          ? "bg-purple-400/80 border-purple-500"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <CardContent className="px-3 flex flex-1 flex-col items-center justify-center">
                        <div className="text-3xl mb-2 text-center">
                          {PRODUCT_TYPE_ICONS[type] || "📦"}
                        </div>
                        <div className="font-bold text-gray-800 text-center text-sm">
                          {PRODUCT_TYPE_LABELS[type]}
                        </div>
                      </CardContent>
                    </Card>
                  </label>
                ))}
              </div>
            </div>

            {/* Category & SubCategory */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DEFAULT_CATEGORIES[watchType].map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
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
                name="subCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Clásicas"
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Base Price */}
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="0.00"
                      className="w-full"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Manual cost for REVENTA and OTHER */}
            {watchType !== "ELABORADO" && (
              <FormField
                control={form.control}
                name="manualCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Manual ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Ingrese el costo de compra/adquisición del producto
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Recipe section for ELABORADO */}
            {watchType === "ELABORADO" && (
              <div className="mt-4 p-4 rounded-lg border border-gray-900/10">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    Receta (Ingredientes)
                  </h3>
                  <span className="text-sm font-medium text-green-600 bg-green-50/80 px-2 py-1 rounded">
                    Costo Estimado: ${currentCost.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-2 items-center flex-wrap sm:flex-nowrap"
                    >
                      {/* Item selector */}
                      <Select
                        value={
                          watchRecipeItems[index]?.ingredientId
                            ? `ing_${watchRecipeItems[index].ingredientId}`
                            : `prod_${watchRecipeItems[index]?.subProductId}`
                        }
                        onValueChange={(val) => handleItemSelect(index, val)}
                      >
                        <SelectTrigger className="flex-2 min-w-[200px]">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Ingredientes</SelectLabel>
                            {ingredients.map((ing) => (
                              <SelectItem key={ing.id} value={`ing_${ing.id}`}>
                                {ing.name} (${ing.lastCost || 0}/{ing.unit})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>Productos</SelectLabel>
                            {products
                              .filter(
                                (p) => !isEditing || p.id !== initialData.id,
                              )
                              .map((prod) => (
                                <SelectItem
                                  key={prod.id}
                                  value={`prod_${prod.id}`}
                                >
                                  {prod.name} (Costo: ${prod.cost.toFixed(2)})
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {/* Unit selector */}
                      <FormField
                        control={form.control}
                        name={`recipeItems.${index}.unit`}
                        render={({ field: unitField }) => (
                          <Select
                            value={unitField.value}
                            onValueChange={unitField.onChange}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(UNITS).map(([key, value]) => (
                                <SelectItem key={key} value={key}>
                                  {value.symbol}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />

                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name={`recipeItems.${index}.quantity`}
                        render={({ field: qtyField }) => (
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              min="0"
                              placeholder="Qty"
                              className="w-24"
                              {...qtyField}
                            />
                          </FormControl>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-50"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addIngredient}
                    className="text-purple-600 hover:text-purple-500 gap-1 border-purple-200 hover:bg-purple-50"
                  >
                    + Agregar Ingrediente
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearForm}
                  disabled={isPending}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  Limpiar formulario
                </Button>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-linear-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold shadow-lg"
              >
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar Producto"
                    : "Crear Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
