"use server";

import { PAGINATION } from "@/config/pagination";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { DashboardStats } from "@/types/entities/sale";

export async function getDashboardStats(): Promise<DashboardStats> {
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
    };
  }

  // Aggregate stats from all time or today? Let's do All Time for MVP demo
  const sales = await prisma.sale.findMany({
    where: { organizationId },
    include: {
      items: true,
    },
  });

  let totalRevenue = 0;
  let totalCost = 0;
  let totalProfit = 0;
  const totalSalesCount = sales.length;

  sales.forEach((sale) => {
    totalRevenue += sale.totalAmount;
    sale.items.forEach((item) => {
      // item.unitCost might be null if old record (though we set default 0), and item.quantity
      const cost = (item.unitCost || 0) * item.quantity;
      totalCost += cost;
    });
  });

  totalProfit = totalRevenue - totalCost;

  // Get recent sales for list
  const recentSales = await prisma.sale.findMany({
    where: { organizationId },
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

  // Get fixed costs for the current month
  const fixedCosts = await prisma.fixedCost.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  });
  const totalFixedCosts = fixedCosts.reduce((acc, c) => acc + c.amount, 0);

  return {
    totalRevenue,
    totalCost,
    totalProfit,
    totalFixedCosts,
    totalSalesCount,
    recentSales,
  };
}
