/**
 * Shared TypeScript types for the Pizza Manager application
 */
import type { ProductType } from "@/config/constants";
import type {
  ReferenceType,
  StockMovementType,
} from "@/generated/prisma/client";

// --- Action Response Types ---

export type ActionState = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

// --- Entity Types ---

export type User = {
  id: string;
  email: string;
  name?: string | null;
  password?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock?: number | null;
  isActive: boolean;
  description?: string | null;
  cost?: number; // Last purchase cost
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Nuevo: Compras de ingredientes
export type IngredientPurchase = {
  id: string;
  organizationId: string;
  purchaseId: string;
  purchase?: Purchase | null;
  ingredientId: string;
  ingredient?: Ingredient | null;
  quantity: number;
  unit: string;
  unitCost: number;
  createdAt: Date;
  updatedAt: Date;
};

// Nuevo: Compra (agrupa múltiples compras de ingredientes)
export type Purchase = {
  id: string;
  organizationId: string;
  purchaseDate: Date;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  ingredientPurchases?: IngredientPurchase[];
  createdAt: Date;
  updatedAt: Date;
};

// Nuevo: Movimientos de Stock
export type StockMovement = {
  id: string;
  organizationId: string;
  ingredientId: string;
  ingredient?: Ingredient | null;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason?: string | null;
  referenceId?: string | null;
  referenceType?: ReferenceType | null;
  movementDate: Date;
  notes?: string | null;
  createdAt: Date;
};

// Tipos de movimiento de stock
// Re-export or use the one from Prisma
export type { StockMovementType };

// Extend tipos existentes
export type IngredientWithStock = Ingredient & {
  lastCost?: number; // Costo basado en última compra
  lastPurchaseDate?: Date;
  isLowStock?: boolean | null; // true si currentStock <= minStock
  purchases?: IngredientPurchase[];
  stockMovements?: StockMovement[];
};

export type FixedCost = {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  category?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RecipeItem = {
  id: string;
  productId: string;
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
  ingredient?: Ingredient | null;
  subProduct?: Product | null;
};

// Base product without relations
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

// Product with optional recipe items
export type Product = ProductBase & {
  receipeItems?: RecipeItem[];
};

export type ProductWithCost = Product & {
  cost: number;
};

// Type for initialData in ProductForm, matching what's typical from Prisma with includes
export type ProductWithRelations = ProductBase & {
  receipeItems?: (RecipeItem & {
    ingredient?: Ingredient | null;
    subProduct?: ProductBase | null;
  })[];
};

export type SaleItem = {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  product: ProductBase;
};

export type Sale = {
  id: string;
  totalAmount: number;
  dateTime: Date;
  items: SaleItem[];
};

// --- Dashboard Types ---

export type DashboardStats = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalFixedCosts?: number;
  totalSalesCount: number;
  recentSales: Sale[];
};

// --- Form Input Types ---

export type RecipeItemInput = {
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
};

export type SaleItemInput = {
  productId: string;
  quantity: number;
};

// Nuevos: Form inputs para compras y stock
export type PurchaseInput = {
  purchaseDate?: string;
  invoiceNumber?: string | null;
  supplierName?: string | null;
  notes?: string | null;
  ingredients: IngredientPurchaseInput[];
};

export type IngredientPurchaseInput = {
  ingredientId: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

export type StockMovementInput = {
  ingredientId: string;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason?: string | null;
  notes?: string | null;
};

// --- Sales History Types ---

export type SalesHistoryParams = {
  startDate?: string;
  endDate?: string;
  search?: string;
  cursor?: string;
  limit?: number;
};

export type SalesHistoryResult = {
  sales: Sale[];
  hasMore: boolean;
  totalCount: number;
  periodStats: {
    revenue: number;
    cost: number;
    profit: number;
    fixedCosts?: number;
    grossProfit?: number;
    operatingProfit?: number;
  };
};
