import type { ProductType } from "@/config/products";

export type RecipeItem = {
  id: string;
  productId: string;
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
  ingredient?: import("./ingredient").Ingredient | null;
  subProduct?: Product | null;
};

export type ProductBase = {
  id: string;
  name: string;
  type: ProductType;
  category?: string | null;
  subCategory?: string | null;
  basePrice: number;
  manualCost?: number | null;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = ProductBase & {
  receipeItems?: RecipeItem[];
};

export type ProductWithCost = Product & {
  cost: number;
};

export type ProductWithRelations = ProductBase & {
  receipeItems?: (RecipeItem & {
    ingredient?: import("./ingredient").Ingredient | null;
    subProduct?: ProductBase | null;
  })[];
};
