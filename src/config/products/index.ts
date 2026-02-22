import { ProductType } from "@/generated/prisma/client";

export const PRODUCT_TYPES = ["ELABORADO", "REVENTA", "OTHER"] as const;

export type { ProductType };

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  ELABORADO: "Producto Elaborado",
  REVENTA: "Reventa",
  OTHER: "Otros",
};

export const PRODUCT_TYPE_ICONS: Record<ProductType, string> = {
  ELABORADO: "👨‍🍳",
  REVENTA: "📦",
  OTHER: "🛒",
};

export const DEFAULT_CATEGORIES: Record<ProductType, string[]> = {
  ELABORADO: ["Pizzas", "Empanadas", "Pastas", "Otros"],
  REVENTA: ["Bebidas", "Snacks", "Otros"],
  OTHER: ["Otros"],
};
