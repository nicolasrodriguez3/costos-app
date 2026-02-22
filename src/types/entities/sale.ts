import type { ProductBase } from "./product";

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
  notes?: string | null;
  deletedAt?: Date | null;
  items: SaleItem[];
};

export type DashboardStats = {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalFixedCosts?: number;
  totalSalesCount: number;
  recentSales: Sale[];
  previousPeriod: {
    revenue: number;
    cost: number;
    profit: number;
    salesCount: number;
    revenueChange: number;
    profitChange: number;
  } | null;
  topProducts: TopProduct[];
};

export type TopProduct = {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
};

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
