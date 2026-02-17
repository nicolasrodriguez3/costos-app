import { ProductType } from "@/generated/prisma/client";

// Product types available in the system
export const PRODUCT_TYPES = ["ELABORADO", "REVENTA", "OTHER"] as const;
export type { ProductType };

// Display labels for product types (Spanish)
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ELABORADO: "Producto Elaborado",
  REVENTA: "Reventa",
  OTHER: "Otros",
};

// Emoji icons for product types
export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  ELABORADO: "👨‍🍳",
  REVENTA: "📦",
  OTHER: "🛒",
};

// Default categories per product type
export const DEFAULT_CATEGORIES: Record<ProductType, string[]> = {
  ELABORADO: ["Pizzas", "Empanadas", "Pastas", "Otros"],
  REVENTA: ["Bebidas", "Snacks", "Otros"],
  OTHER: ["Otros"],
};

// Currency configuration
export const CURRENCY = {
  symbol: "$",
  code: "ARS",
  decimals: 2,
} as const;

// Pagination defaults
export const PAGINATION = {
  salesPerPage: 50,
  recentSalesLimit: 5,
  salesHistoryPerPage: 20,
} as const;

// Units of measurement available
export const UNITS = {
  kg: {
    name: "kilogramos",
    symbol: "kg",
    type: "masa",
    conversionFactor: 1000,
  },
  g: {
    name: "gramos",
    symbol: "g",
    type: "masa",
    conversionFactor: 1,
  },
  ml: {
    name: "mililitros",
    symbol: "ml",
    type: "volumen",
    conversionFactor: 1,
  },
  l: {
    name: "litros",
    symbol: "l",
    type: "volumen",
    conversionFactor: 1000,
  },
  unit: {
    name: "unidad",
    symbol: "ud.",
    type: "unidad",
    conversionFactor: 1,
  },
  docena: {
    name: "docena",
    symbol: "doc.",
    type: "unidad",
    conversionFactor: 12,
  },
} as const;
export type UnitType = keyof typeof UNITS;

export const CATEGORIES = [
  "Sin categoría",
  "Proteinas",
  "Frutas y Verduras",
  "Lacteos",
  "Secos/Almacen",
  "Congelados",
  "Condimentos y Salsas",
  "Insumos no alimenticios",
  "Otros",
];
