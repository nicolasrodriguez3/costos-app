export type DraftRecipeItem = {
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
};

export type ProductDraft = {
  organizationId: string;
  name: string;
  type: string;
  category: string;
  subCategory?: string;
  basePrice?: number | null;
  manualCost?: number;
  recipeItems?: DraftRecipeItem[];
};
