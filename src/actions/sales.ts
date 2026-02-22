"use server";

import { revalidatePath } from "next/cache";

import { PAGINATION } from "@/config/pagination";
import { Prisma } from "@/generated/prisma/client";
import { calculateProductCost } from "@/lib/costs";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { ActionState } from "@/types/actions/common";
import type {
  Sale,
  SalesHistoryParams,
  SalesHistoryResult,
} from "@/types/entities/sale";
import { type SaleFormValues, saleFormSchema } from "@/types/forms/sale";

/**
 * Crea una nueva venta con sus items
 */
export async function createSale(data: SaleFormValues): Promise<ActionState> {
  const {
    session: { userId },
    activeOrganizationId,
  } = await getServerSessionWithOrg();

  const validated = saleFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: "Datos inválidos" };
  }

  const { dateTime, notes, items } = validated.data;

  try {
    const totalAmount = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    // Prepare items with costs calculated at this moment
    const saleItemsData = await Promise.all(
      items.map(async (item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: await calculateProductCost(item.productId),
      })),
    );

    await prisma.sale.create({
      data: {
        dateTime: new Date(dateTime + "T00:00:00"),
        notes,
        totalAmount,
        userId,
        organizationId: activeOrganizationId,
        items: {
          create: saleItemsData,
        },
      },
    });

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    return { success: true, message: "Venta cargada correctamente" };
  } catch (error) {
    console.error("[createSale] Error:", error);
    return { success: false, message: "Error al crear la venta" };
  }
}

/**
 * Actualiza una venta existente
 */
export async function updateSale(
  id: string,
  data: SaleFormValues,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const validated = saleFormSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, message: "Datos inválidos" };
  }

  const { dateTime, notes, items } = validated.data;

  try {
    const totalAmount = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );

    // Prepare fresh items data with current costs
    const saleItemsData = await Promise.all(
      items.map(async (item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: await calculateProductCost(item.productId),
      })),
    );

    await prisma.$transaction([
      // Delete existing items
      prisma.saleItem.deleteMany({
        where: { saleId: id },
      }),
      // Update sale and create new items
      prisma.sale.update({
        where: { id, organizationId: activeOrganizationId },
        data: {
          dateTime: new Date(dateTime + "T00:00:00"),
          notes,
          totalAmount,
          items: {
            create: saleItemsData,
          },
        },
      }),
    ]);

    revalidatePath("/sales");
    revalidatePath(`/sales/${id}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Venta actualizada correctamente" };
  } catch (error) {
    console.error("[updateSale] Error:", error);
    return { success: false, message: "Error al actualizar la venta" };
  }
}

/**
 * Soft delete de una venta
 */
export async function deleteSale(id: string): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  try {
    await prisma.sale.update({
      where: { id, organizationId: activeOrganizationId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    return { success: true, message: "Venta eliminada correctamente" };
  } catch (error) {
    console.error("[deleteSale] Error:", error);
    return { success: false, message: "Error al eliminar la venta" };
  }
}

/**
 * Obtiene una venta por ID con sus items
 */
export async function getSaleById(id: string): Promise<Sale | null> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  return await prisma.sale.findUnique({
    where: {
      id,
      organizationId: activeOrganizationId,
      deletedAt: null,
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

/**
 * Obtiene las ventas recientes (para widgets/dashboard)
 */
export async function getRecentSales() {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return [];

  return await prisma.sale.findMany({
    where: {
      organizationId: activeOrganizationId,
      deletedAt: null,
    },
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

/**
 * Obtiene el historial de ventas paginado y con filtros
 */
export async function getSalesHistory(
  params: SalesHistoryParams,
): Promise<SalesHistoryResult> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const {
    startDate,
    endDate,
    search,
    cursor,
    limit = PAGINATION.salesHistoryPerPage,
  } = params;

  // Build where clause
  const where: Prisma.SaleWhereInput = {
    organizationId: activeOrganizationId,
    deletedAt: null,
  };

  // Date filters
  if (startDate || endDate) {
    const dateTimeFilter: Prisma.DateTimeFilter = {};
    if (startDate) {
      dateTimeFilter.gte = new Date(startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      dateTimeFilter.lte = endOfDay;
    }
    where.dateTime = dateTimeFilter;
  }

  // Search filter (by product name in items)
  if (search && search.trim()) {
    where.items = {
      some: {
        product: {
          name: { contains: search.trim(), mode: "insensitive" },
        },
      },
    };
  }

  // Get total count
  const totalCount = await prisma.sale.count({ where });

  // Fetch sales
  const sales = await prisma.sale.findMany({
    where,
    take: limit + 1,
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

  const hasMore = sales.length > limit;
  const resultSales = hasMore ? sales.slice(0, limit) : sales;

  // Stats calculation
  let revenue = 0;
  let cost = 0;

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

  // Fixed Costs prorated
  let fixedCostsProrated = 0;
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const monthlyFixedCosts = await prisma.fixedCost.findMany({
      where: {
        organizationId: activeOrganizationId,
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
    sales: resultSales as unknown as SalesHistoryResult["sales"],
    hasMore,
    totalCount,
    periodStats: {
      revenue,
      cost,
      profit: revenue - cost,
      fixedCosts: fixedCostsProrated,
      grossProfit,
      operatingProfit,
    },
  };
}

/**
 * Obtiene el listado de ventas para la tabla principal (paginado)
 */
export async function getSales(page = 1, limit = PAGINATION.salesPerPage) {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  const skip = (page - 1) * limit;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where: {
        organizationId: activeOrganizationId,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { dateTime: "desc" },
      skip,
      take: limit,
    }),
    prisma.sale.count({
      where: {
        organizationId: activeOrganizationId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    sales,
    total,
    pages: Math.ceil(total / limit),
  };
}
