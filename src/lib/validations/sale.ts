import { z } from "zod";

export const saleItemSchema = z.object({
  productId: z.string().min(1, "Seleccioná un producto"),
  quantity: z.coerce.number().int().min(1, "Mínimo 1 unidad"),
  unitPrice: z.coerce.number().min(0, "El precio no puede ser negativo"),
});

export const saleFormSchema = z.object({
  dateTime: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
  items: z
    .array(saleItemSchema)
    .min(1, "Agregá al menos un producto a la venta"),
});

export type SaleFormValues = z.infer<typeof saleFormSchema>;
export type SaleItemFormValues = z.infer<typeof saleItemSchema>;
