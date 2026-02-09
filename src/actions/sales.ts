"use server";

import { revalidatePath } from "next/cache";

import { PAGINATION } from "@/config/constants";
import { calculateProductCost } from "@/lib/costs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/serverSession";
import type {
  SaleItemInput,
  SalesHistoryParams,
  SalesHistoryResult,
} from "@/types";

export async function recordSale(items: SaleItemInput[]) {
  const { session } = await getServerSession();
  if (!session?.activeOrganizationId || !session?.userId) return;

  if (items.length === 0) return;

  // Fetch all products to get current prices and costs
  const products = await prisma.product.findMany({
    where: {
      id: { in: items.map((i) => i.productId) },
      organizationId: session.activeOrganizationId,
    },
    include: {
      receipeItems: {
        include: {
          ingredient: true,
          subProduct: {
            include: {
              receipeItems: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Calculate total amount and prepare items for DB
  let totalAmount = 0;
  const saleItemsData = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) continue; // Should not happen

    // Calculate unit cost (recursively if needed)
    const unitCost = await calculateProductCost(product.id);

    totalAmount += product.basePrice * item.quantity;

    saleItemsData.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.basePrice,
      unitCost: unitCost,
    });
  }

  await prisma.sale.create({
    data: {
      totalAmount,
      userId: session.userId,
      organizationId: session.activeOrganizationId,
      items: {
        create: saleItemsData,
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/sales");
}

export async function getRecentSales() {
  const { session } = await getServerSession();
  if (!session?.activeOrganizationId) return [];

  return await prisma.sale.findMany({
    where: { organizationId: session.activeOrganizationId },
    take: PAGINATION.recentSalesLimit,
    orderBy: {
      dateTime: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

export async function getSalesHistory(
  params: SalesHistoryParams,
): Promise<SalesHistoryResult> {
  const { session } = await getServerSession();
  if (!session?.activeOrganizationId) {
    return {
      sales: [],
      hasMore: false,
      totalCount: 0,
      periodStats: { revenue: 0, cost: 0, profit: 0 },
    };
  }

  const {
    startDate,
    endDate,
    search,
    cursor,
    limit = PAGINATION.salesHistoryPerPage,
  } = params;

  // Build where clause
  const where: {
    organizationId: string;
    dateTime?: { gte?: Date; lte?: Date };
    items?: { some: { product: { name: { contains: string } } } };
  } = {
    organizationId: session.activeOrganizationId,
  };

  // Date filters
  if (startDate || endDate) {
    where.dateTime = {};
    if (startDate) {
      where.dateTime.gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of day
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      where.dateTime.lte = endOfDay;
    }
  }

  // Search filter (by product name)
  if (search && search.trim()) {
    where.items = {
      some: {
        product: {
          name: { contains: search.trim() },
        },
      },
    };
  }

  // Get total count for the filtered results
  const totalCount = await prisma.sale.count({ where });

  // Fetch sales with cursor-based pagination
  const sales = await prisma.sale.findMany({
    where,
    take: limit + 1, // Get one extra to check if there are more
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { dateTime: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Check if there are more results
  const hasMore = sales.length > limit;
  const resultSales = hasMore ? sales.slice(0, limit) : sales;

  // Calculate period stats
  let revenue = 0;
  let cost = 0;

  // For stats, we need to aggregate all matching sales (not just the page)
  const allMatchingSales = await prisma.sale.findMany({
    where,
    include: { items: true },
  });

  allMatchingSales.forEach((sale) => {
    revenue += sale.totalAmount;
    sale.items.forEach((item) => {
      cost += (item.unitCost || 0) * item.quantity;
    });
  });

  // --- Calculate Fixed Costs for the period ---
  let fixedCostsProrated = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const monthlyFixedCosts = await prisma.fixedCost.findMany({
      where: {
        organizationId: session.activeOrganizationId,
        isActive: true,
      },
    });

    const totalMonthly = monthlyFixedCosts.reduce(
      (acc, c) => acc + c.amount,
      0,
    );
    fixedCostsProrated = (totalMonthly / 30) * diffDays;
  }

  const grossProfit = revenue - cost;
  const operatingProfit = grossProfit - fixedCostsProrated;

  return {
    sales: resultSales,
    hasMore,
    totalCount,
    periodStats: {
      revenue,
      cost,
      profit: revenue - cost, // Still variable profit for compatibility
      fixedCosts: fixedCostsProrated,
      grossProfit: grossProfit,
      operatingProfit: operatingProfit,
    },
  };
}
