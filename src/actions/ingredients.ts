"use server";

import { revalidatePath } from "next/cache";

import { ReferenceType, StockMovementType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type {
  ActionState,
  IngredientInput,
  IngredientWithStock,
} from "@/types";
import { createStockMovement } from "./purchases";

export async function getIngredients() {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const ingredients = await prisma.ingredient.findMany({
    where: { organizationId: activeOrganizationId, isActive: true },
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

export async function createIngredient(
  data: IngredientInput,
): Promise<ActionState> {
  const {
    activeOrganizationId,
    session: { userId },
  } = await getServerSessionWithOrg();

  const {
    name,
    unit,
    category,
    initialStock,
    minStock,
    initialCost,
    description,
  } = data;

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

  try {
    const newIngredient = await prisma.ingredient.create({
      data: {
        name: name.trim(),
        unit,
        category,
        currentStock: initialStock ?? 0,
        minStock: minStock ?? null,
        description: description ? description.trim() : null,
        isActive: true,
        userId,
        organizationId: activeOrganizationId,
      },
    });

    if (initialCost) {
      await createStockMovement({
        ingredientId: newIngredient.id,
        quantity: initialStock ?? 0,
        unit,
        unitCost: initialCost,
      });
    }

    revalidatePath("/ingredients");
    revalidatePath("/products");
    return {
      success: true,
      message: "Ingrediente creado correctamente",
      data: newIngredient,
    };
  } catch (error) {
    console.error("Error al crear el ingrediente:", error);
    return {
      success: false,
      message: "Error al crear el ingrediente",
    };
  }
}

export async function deleteIngredient(id: string): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId)
    return {
      success: false,
      message: "No tienes autorización para ejecutar está acción",
    };

  try {
    await prisma.ingredient.update({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
      data: {
        isActive: false,
      },
    });
    revalidatePath("/ingredients");
    return {
      success: true,
      message: "Ingrediente eliminado correctamente",
    };
  } catch (error) {
    console.error("Error al eliminar ingrediente:", error);
    return {
      success: false,
      message: "Error al eliminar el ingrediente",
    };
  }
}

export async function updateIngredient(
  data: IngredientInput,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  const { id, name, unit, category, currentStock, minStock, description } =
    data;

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

  if (currentStock !== undefined && currentStock !== null) {
    if (currentStock < 0) {
      return { message: "El stock no puede ser negativo" };
    }
    await updateIngredientStock(id, currentStock);
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
        category,
        minStock: minStock ?? null,
        description: description ? description.trim() : null,
      },
    });
    revalidatePath("/ingredients");
    return { success: true, message: "Ingrediente actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar ingrediente:", error);
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

async function _updateIngredientStock(
  id: string,
  newStock: number,
  activeOrganizationId: string,
  reason?: string | null,
  notes?: string | null,
): Promise<ActionState> {
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

    await prisma.ingredient.update({
      where: { id, organizationId: activeOrganizationId },
      data: { currentStock: newStock },
    });

    if (Math.abs(stockDifference) > 0.001) {
      await prisma.stockMovement.create({
        data: {
          organizationId: activeOrganizationId,
          ingredientId: id,
          unit: ingredient.unit,
          type: "AJUSTE" as StockMovementType,
          quantity: stockDifference,
          reason: reason || "Ajuste manual de stock",
          notes,
          referenceType: "ADJUSTMENT" as ReferenceType,
        },
      });
    }

    return { success: true, message: "Stock actualizado correctamente" };
  } catch (error) {
    console.error("Error al actualizar el stock del ingrediente:", error);
    return { message: "Error al actualizar el stock del ingrediente" };
  }
}

export async function updateIngredientStock(
  id: string,
  newStock: number,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  return _updateIngredientStock(id, newStock, activeOrganizationId);
}

export async function updateIngredientStockAction(
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

  const result = await _updateIngredientStock(
    id,
    newStock,
    activeOrganizationId,
    reason,
    notes,
  );

  if (result.success) {
    revalidatePath("/ingredients");
  }

  return result;
}
