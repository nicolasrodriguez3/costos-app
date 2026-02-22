import type { Ingredient } from "./ingredient";

export type IngredientPurchase = {
  id: string;
  organizationId: string;
  purchaseId: string;
  purchase?: Purchase | null;
  ingredientId: string;
  ingredient?: Ingredient | null;
  quantity: number;
  unit: string;
  unitCost: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Purchase = {
  id: string;
  organizationId: string;
  purchaseDate: Date;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  ingredientPurchases?: IngredientPurchase[];
  createdAt: Date;
  updatedAt: Date;
};
