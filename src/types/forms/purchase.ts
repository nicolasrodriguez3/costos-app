import type { StockMovementType } from "@/generated/prisma/client";

export type PurchaseInput = {
  purchaseDate?: string;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  ingredients: IngredientPurchaseInput[];
};

export type IngredientPurchaseInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

export type StockMovementInput = {
  ingredientId: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason?: string | null;
  notes?: string | null;
};
