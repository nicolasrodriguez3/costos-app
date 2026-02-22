export const INGREDIENT_CATEGORIES = [
  "Sin categoría",
  "Proteínas",
  "Frutas y Verduras",
  "Lácteos",
  "Secos/Almacén",
  "Congelados",
  "Condimentos y Salsas",
  "Insumos no alimenticios",
  "Otros",
] as const;

export type IngredientCategoryType = (typeof INGREDIENT_CATEGORIES)[number];
