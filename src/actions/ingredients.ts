"use server";

import { revalidatePath } from "next/cache";

import { ReferenceType, StockMovementType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { ActionState } from "@/types";

export async function getIngredients() {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const ingredients = await prisma.ingredient.findMany({
    where: { organizationId: activeOrganizationId },
    orderBy: { name: "asc" },
    include: {
      purchases: {
        where: { organizationId: activeOrganizationId },
        include: { purchase: true },
        orderBy: { purchase: { purchaseDate: "desc" } },
        take: 1,
      },
    },
  });

  // Calcular costos basado en última compra
  return ingredients.map((ing) => ({
    ...ing,
    lastCost: ing.purchases[0]?.unitCost || 0,
    lastPurchaseDate: ing.purchases[0]?.purchase?.purchaseDate,
    isLowStock: ing.minStock && ing.currentStock <= ing.minStock,
  }));
}

export type IngredientInput = {
  id?: string;
  name: string;
  unit: string;
  minStock?: number | null;
  description?: string | null;
};

export async function createIngredient(
  data: IngredientInput,
): Promise<ActionState> {
  const {
    activeOrganizationId,
    session: { userId },
  } = await getServerSessionWithOrg();

  const { name, unit, minStock, description } = data;

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (minStock !== undefined && minStock !== null && minStock < 0) {
    return { message: "El stock mínimo no puede ser negativo" };
  }

  // Check for duplicates
  const existing = await prisma.ingredient.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId: activeOrganizationId,
    },
  });

  if (existing) {
    return { message: "Ya existe un ingrediente con este nombre" };
  }

  const newIngredient = await prisma.ingredient.create({
    data: {
      name: name.trim(),
      unit,
      currentStock: 0,
      minStock: minStock ?? null,
      description: description ? description.trim() : null,
      isActive: true,
      userId,
      organizationId: activeOrganizationId,
    },
  });

  revalidatePath("/ingredients");
  revalidatePath("/products");
  return {
    success: true,
    message: "Ingrediente creado correctamente",
    data: newIngredient,
  };
}

export async function deleteIngredient(id: string) {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return;

  try {
    await prisma.ingredient.deleteMany({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
    });
    revalidatePath("/ingredients");
  } catch (error) {
    console.error("Failed to delete ingredient:", error);
  }
}

export async function updateIngredient(
  data: IngredientInput,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  const { id, name, unit, minStock, description } = data;

  if (!id) {
    return { message: "ID de ingrediente faltante" };
  }

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (minStock !== undefined && minStock !== null && minStock < 0) {
    return { message: "El stock mínimo no puede ser negativo" };
  }

  // Check for duplicates (excluding current)
  const existing = await prisma.ingredient.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId: activeOrganizationId,
      NOT: { id },
    },
  });

  if (existing) {
    return { message: "Ya existe otro ingrediente con este nombre" };
  }

  try {
    await prisma.ingredient.update({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
      data: {
        name: name.trim(),
        unit,
        minStock: minStock ?? null,
        description: description ? description.trim() : null,
      },
    });
    revalidatePath("/ingredients");
    return { success: true, message: "Ingrediente actualizado correctamente" };
  } catch (error) {
    console.error("Failed to update ingredient:", error);
    return { message: "Error al actualizar el ingrediente" };
  }
}

// NUEVAS FUNCIONES

export async function getIngredientStock(id: string) {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return null;

  return await prisma.ingredient.findFirst({
    where: {
      id,
      organizationId: activeOrganizationId,
    },
    include: {
      purchases: {
        include: { purchase: true },
        orderBy: { purchase: { purchaseDate: "desc" } },
        take: 5,
      },
      stockMovements: {
        orderBy: { movementDate: "desc" },
        take: 10,
      },
    },
  });
}

export async function updateIngredientStock(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  const id = formData.get("id") as string;
  const newStock = parseFloat(formData.get("currentStock") as string);
  const reason = formData.get("reason") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!id) {
    return { message: "ID de ingrediente faltante" };
  }

  if (isNaN(newStock) || newStock < 0) {
    return { message: "El stock debe ser un número válido" };
  }

  try {
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
    });

    if (!ingredient) {
      return { message: "Ingrediente no encontrado" };
    }

    const stockDifference = newStock - ingredient.currentStock;

    // Actualizar stock
    await prisma.ingredient.update({
      where: { id },
      data: { currentStock: newStock },
    });

    // Crear movimiento de ajuste si hay diferencia
    if (Math.abs(stockDifference) > 0.001) {
      await prisma.stockMovement.create({
        data: {
          organizationId: activeOrganizationId,
          ingredientId: id,
          type: "AJUSTE" as StockMovementType,
          quantity: stockDifference,
          unit: ingredient.unit,
          reason: reason || "Ajuste manual de stock",
          notes,
          referenceType: "ADJUSTMENT" as ReferenceType,
        },
      });
    }

    revalidatePath("/ingredients");
    return {
      success: true,
      message: "Stock actualizado correctamente",
    };
  } catch (error) {
    console.error("Failed to update ingredient stock:", error);
    return { message: "Error al actualizar el stock" };
  }
}
