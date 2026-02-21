/**
 * Helper for Unit Conversion
 * Converts ingredient cost based on recipe unit vs ingredient unit
 */
export function convertCost(
  quantity: number,
  recipeUnit: string,
  ingredientUnit: string,
  ingredientCost: number,
): number {
  let cost = 0;

  // Normalize units to lowercase
  const rUnit = recipeUnit.toLowerCase();
  const iUnit = ingredientUnit.toLowerCase();

  if (rUnit === iUnit) {
    // 1:1
    cost = quantity * ingredientCost;
  } else if (
    (iUnit === "kg" && (rUnit === "g" || rUnit === "grams")) ||
    (iUnit === "l" && (rUnit === "ml" || rUnit === "milliliters"))
  ) {
    // 1kg = 1000g, 1l = 1000ml
    // Cost per g = Cost per kg / 1000
    cost = quantity * (ingredientCost / 1000);
  } else if ((iUnit === "g" || iUnit === "grams") && rUnit === "kg") {
    // 1000g = 1kg (unlikely conversion direction for recipe but possible)
    cost = quantity * (ingredientCost * 1000);
  } else {
    // Fallback if no conversion known (or units mismatch like kg -> liters)
    // Assume 1:1 for safety
    cost = quantity * ingredientCost;
  }

  return cost;
}
