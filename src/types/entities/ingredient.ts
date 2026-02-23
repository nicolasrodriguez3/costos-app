import type { IngredientPurchase } from "./purchase";
import type { StockMovement } from "./stock";

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock?: number | null;
  isActive: boolean;
  description?: string | null;
  lastCost?: number;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type IngredientWithStock = Ingredient & {
  lastCost?: number;
  lastPurchaseDate?: Date;
  isLowStock?: boolean | null;
  purchases?: IngredientPurchase[];
  stockMovements?: StockMovement[];
};

export type IngredientWithPurchases = Ingredient & {
  purchases?: IngredientPurchase[];
};
