export type IngredientInput = {
  id?: string;
  name: string;
  unit: string;
  category?: string | null;
  initialStock?: number | null;
  currentStock?: number | null;
  minStock?: number | null;
  initialCost?: number | null;
  description?: string | null;
};
