export type RecipeItemInput = {
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
};

export type ProductFormData = {
  id?: string;
  name: string;
  type: string;
  category: string;
  subCategory?: string | null;
  basePrice: number;
  manualCost?: number | null;
  recipeItems?: RecipeItemInput[];
};
