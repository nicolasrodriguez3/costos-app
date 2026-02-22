import type { StockMovementType } from "@/generated/prisma/client";

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
  purchases?: import("./purchase").IngredientPurchase[];
  stockMovements?: import("./stock").StockMovement[];
};
