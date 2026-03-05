"use server";

import { revalidatePath } from "next/cache";

import { PAGINATION } from "@/config/pagination";
import { Prisma, StockMovementType } from "@/generated/prisma/client";
import { calculateProductCost } from "@/lib/costs";
import { logger } from "@/lib/logger";
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

    const saleItemsData = await Promise.all(
      items.map(async (item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: await calculateProductCost(item.productId),
      })),
    );

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
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

      const stockResult = await deductStockFromSale(
        items,
        activeOrganizationId,
        createdSale.id,
        tx,
      );

      return { sale: createdSale, warnings: stockResult.warnings };
    });

    revalidatePath("/sales");
    revalidatePath("/dashboard");

    if (sale.warnings.length > 0) {
      return {
        success: true,
        message: `Venta cargada correctamente. ${sale.warnings.length} advertencia(s) de stock: ${sale.warnings.join(", ")}`,
      };
    }

    return { success: true, message: "Venta cargada correctamente" };
  } catch (error) {
    logger.error("createSale", error, {
      userId,
      organizationId: activeOrganizationId,
    });
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
    logger.error("updateSale", error, {
      organizationId: activeOrganizationId,
      saleId: id,
    });
    return { success: false, message: "Error al actualizar la venta" };
  }
}

/**
 * Soft delete de una venta
 */
export async function deleteSale(id: string): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  try {
    await prisma.$transaction(async (tx) => {
      await reverseSaleStock(id, activeOrganizationId, tx);

      await tx.sale.update({
        where: { id, organizationId: activeOrganizationId },
        data: { deletedAt: new Date() },
      });
    });

    revalidatePath("/sales");
    revalidatePath("/dashboard");
    return { success: true, message: "Venta eliminada correctamente" };
  } catch (error) {
    logger.error("deleteSale", error, {
      organizationId: activeOrganizationId,
      saleId: id,
    });
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

function convertQuantity(
  quantity: number,
  recipeUnit: string,
  ingredientUnit: string,
): number {
  const rUnit = recipeUnit.toLowerCase();
  const iUnit = ingredientUnit.toLowerCase();

  if (rUnit === iUnit) {
    return quantity;
  }

  if (iUnit === "kg" && (rUnit === "g" || rUnit === "grams")) {
    return quantity / 1000;
  }
  if ((iUnit === "g" || iUnit === "grams") && rUnit === "kg") {
    return quantity * 1000;
  }
  if (iUnit === "l" && (rUnit === "ml" || rUnit === "milliliters")) {
    return quantity / 1000;
  }
  if ((iUnit === "ml" || iUnit === "milliliters") && rUnit === "l") {
    return quantity * 1000;
  }

  return quantity;
}

async function deductStockFromSale(
  items: { productId: string; quantity: number }[],
  organizationId: string,
  saleId: string,
  tx?: Prisma.TransactionClient,
): Promise<{ warnings: string[] }> {
  const client = tx || prisma;
  const warnings: string[] = [];

  const productIds = items.map((item) => item.productId);
  const products = await client.product.findMany({
    where: { id: { in: productIds } },
    include: {
      receipeItems: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  const stockDeductions: {
    ingredientId: string;
    quantity: number;
    unit: string;
  }[] = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.type !== "ELABORADO") continue;

    for (const recipeItem of product.receipeItems) {
      if (recipeItem.ingredientId && recipeItem.ingredient) {
        const quantityNeeded = convertQuantity(
          recipeItem.quantity * item.quantity,
          recipeItem.unit,
          recipeItem.ingredient.unit,
        );

        stockDeductions.push({
          ingredientId: recipeItem.ingredientId,
          quantity: quantityNeeded,
          unit: recipeItem.ingredient.unit,
        });
      } else if (recipeItem.subProductId) {
        await deductStockFromSubProduct(
          recipeItem.subProductId,
          recipeItem.quantity * item.quantity,
          organizationId,
          saleId,
          warnings,
          tx,
        );
      }
    }
  }

  const ingredientMap = new Map<string, { quantity: number; unit: string }>();
  for (const deduction of stockDeductions) {
    const existing = ingredientMap.get(deduction.ingredientId);
    if (existing) {
      existing.quantity += deduction.quantity;
    } else {
      ingredientMap.set(deduction.ingredientId, {
        quantity: deduction.quantity,
        unit: deduction.unit,
      });
    }
  }

  for (const [ingredientId, { quantity, unit }] of ingredientMap) {
    const ingredient = await client.ingredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) continue;

    if (ingredient.currentStock < quantity) {
      warnings.push(
        `Stock insuficiente para "${ingredient.name}": necesario ${quantity}${unit}, disponible ${ingredient.currentStock}${ingredient.unit}`,
      );
    }

    await client.ingredient.update({
      where: { id: ingredientId },
      data: {
        currentStock: {
          decrement: quantity,
        },
      },
    });

    await client.stockMovement.create({
      data: {
        organizationId,
        ingredientId,
        type: StockMovementType.SALE,
        quantity,
        unit,
        reason: "Venta",
        referenceId: saleId,
        movementDate: new Date(),
      },
    });
  }

  return { warnings };
}

async function deductStockFromSubProduct(
  subProductId: string,
  quantity: number,
  organizationId: string,
  saleId: string,
  warnings: string[],
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx || prisma;

  const subProduct = await client.product.findUnique({
    where: { id: subProductId },
    include: {
      receipeItems: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!subProduct || subProduct.type !== "ELABORADO") return;

  for (const recipeItem of subProduct.receipeItems) {
    if (recipeItem.ingredientId && recipeItem.ingredient) {
      const quantityNeeded = convertQuantity(
        recipeItem.quantity * quantity,
        recipeItem.unit,
        recipeItem.ingredient.unit,
      );

      const ingredient = await client.ingredient.findUnique({
        where: { id: recipeItem.ingredientId },
      });

      if (!ingredient) continue;

      if (ingredient.currentStock < quantityNeeded) {
        warnings.push(
          `Stock insuficiente para "${ingredient.name}": necesario ${quantityNeeded}${recipeItem.ingredient.unit}, disponible ${ingredient.currentStock}${ingredient.unit}`,
        );
      }

      await client.ingredient.update({
        where: { id: recipeItem.ingredientId },
        data: {
          currentStock: {
            decrement: quantityNeeded,
          },
        },
      });

      await client.stockMovement.create({
        data: {
          organizationId,
          ingredientId: recipeItem.ingredientId,
          type: StockMovementType.SALE,
          quantity: quantityNeeded,
          unit: recipeItem.ingredient.unit,
          reason: "Venta (subproducto)",
          referenceId: saleId,
          movementDate: new Date(),
        },
      });
    } else if (recipeItem.subProductId) {
      await deductStockFromSubProduct(
        recipeItem.subProductId,
        recipeItem.quantity * quantity,
        organizationId,
        saleId,
        warnings,
        tx,
      );
    }
  }
}

async function reverseSaleStock(
  saleId: string,
  organizationId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> {
  const client = tx || prisma;

  const movements = await client.stockMovement.findMany({
    where: {
      referenceId: saleId,
      type: StockMovementType.SALE,
    },
  });

  for (const movement of movements) {
    await client.ingredient.update({
      where: { id: movement.ingredientId },
      data: {
        currentStock: {
          increment: movement.quantity,
        },
      },
    });

    await client.stockMovement.create({
      data: {
        organizationId,
        ingredientId: movement.ingredientId,
        type: StockMovementType.RETURN,
        quantity: movement.quantity,
        unit: movement.unit,
        reason: "Devolución por anulación de venta",
        referenceId: saleId,
        movementDate: new Date(),
      },
    });
  }
}
