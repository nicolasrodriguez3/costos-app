"use server";

import { startOfDay, startOfWeek, startOfMonth, startOfYear, sub, endOfDay } from "date-fns";
import { PAGINATION } from "@/config/pagination";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { DashboardStats, TopProduct } from "@/types/entities/sale";

export type Period = "today" | "week" | "month" | "year" | "all";

function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);

  switch (period) {
    case "today":
      return { start: today, end: todayEnd };
    case "week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: todayEnd };
    case "month":
      return { start: startOfMonth(now), end: todayEnd };
    case "year":
      return { start: startOfYear(now), end: todayEnd };
    case "all":
      return { start: new Date(0), end: todayEnd };
  }
}

function getPreviousPeriodRange(period: Period): { start: Date; end: Date } {
  const { start, end } = getDateRange(period);
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  return { start: previousStart, end: previousEnd };
}

async function calculateStatsForPeriod(
  organizationId: string,
  start: Date,
  end: Date
): Promise<{ revenue: number; cost: number; profit: number; salesCount: number }> {
  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
      dateTime: { gte: start, lte: end },
      deletedAt: null,
    },
    include: { items: true },
  });

  let revenue = 0;
  let cost = 0;

  sales.forEach((sale) => {
    revenue += sale.totalAmount;
    sale.items.forEach((item) => {
      cost += (item.unitCost || 0) * item.quantity;
    });
  });

  return {
    revenue,
    cost,
    profit: revenue - cost,
    salesCount: sales.length,
  };
}

async function getTopProducts(
  organizationId: string,
  start: Date,
  end: Date
): Promise<TopProduct[]> {
  const sales = await prisma.sale.findMany({
    where: {
      organizationId,
      dateTime: { gte: start, lte: end },
      deletedAt: null,
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  const productTotals: Record<string, { name: string; quantity: number; revenue: number }> = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productTotals[item.productId]) {
        productTotals[item.productId] = {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
      }
      productTotals[item.productId].quantity += item.quantity;
      productTotals[item.productId].revenue += item.unitPrice * item.quantity;
    });
  });

  return Object.entries(productTotals)
    .map(([productId, data]) => ({
      productId,
      name: data.name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

export async function getDashboardStats(period: Period = "month"): Promise<DashboardStats> {
  let organizationId: string;
  try {
    const { activeOrganizationId } = await getServerSessionWithOrg();
    organizationId = activeOrganizationId;
  } catch {
    return {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalSalesCount: 0,
      recentSales: [],
      previousPeriod: null,
      topProducts: [],
    };
  }

  const { start, end } = getDateRange(period);
  const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(period);

  const currentStats = await calculateStatsForPeriod(organizationId, start, end);
  const previousStats = await calculateStatsForPeriod(organizationId, prevStart, prevEnd);

  const revenueChange = previousStats.revenue > 0
    ? ((currentStats.revenue - previousStats.revenue) / previousStats.revenue) * 100
    : currentStats.revenue > 0 ? 100 : 0;

  const profitChange = previousStats.profit > 0
    ? ((currentStats.profit - previousStats.profit) / previousStats.profit) * 100
    : currentStats.profit > 0 ? 100 : 0;

  const topProducts = await getTopProducts(organizationId, start, end);

  const recentSales = await prisma.sale.findMany({
    where: { organizationId, dateTime: { gte: start, lte: end } },
    take: PAGINATION.recentSalesLimit,
    orderBy: { dateTime: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const fixedCosts = await prisma.fixedCost.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  });
  const totalFixedCosts = fixedCosts.reduce((acc, c) => acc + c.amount, 0);

  return {
    totalRevenue: currentStats.revenue,
    totalCost: currentStats.cost,
    totalProfit: currentStats.profit,
    totalFixedCosts,
    totalSalesCount: currentStats.salesCount,
    recentSales,
    previousPeriod: {
      revenue: previousStats.revenue,
      cost: previousStats.cost,
      profit: previousStats.profit,
      salesCount: previousStats.salesCount,
      revenueChange,
      profitChange,
    },
    topProducts,
  };
}
