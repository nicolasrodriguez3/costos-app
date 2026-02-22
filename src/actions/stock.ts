"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { ActionState } from "@/types/actions/common";
import type { StockMovementType } from "@/types/entities/stock";

export async function createStockMovement(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let organizationId: string;
  try {
    const { activeOrganizationId } = await getServerSessionWithOrg();
    organizationId = activeOrganizationId;
  } catch {
    return { message: "Unauthorized" };
  }

  const ingredientId = formData.get("ingredientId") as string;
  const type = formData.get("type") as StockMovementType;
  const quantity = parseFloat(formData.get("quantity") as string);
  const unit = formData.get("unit") as string;
  const reason = formData.get("reason") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!ingredientId) {
    return { message: "Debe seleccionar un ingrediente" };
  }

  if (!quantity || quantity === 0) {
    return { message: "La cantidad debe ser diferente de 0" };
  }

  if (type === "AJUSTE") {
    // Para ajustes, quantity puede ser positivo o negativo
  } else {
    // Para otros tipos, validar según el tipo
    if (type === "RETIRO" && quantity > 0) {
      // Convertir a negativo para retiros
      formData.set("quantity", (-quantity).toString());
    }
  }

  try {
    // Obtener ingrediente para verificar stock
    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id: ingredientId,
        organizationId,
      },
    });

    if (!ingredient) {
      return { message: "Ingrediente no encontrado" };
    }

    // Verificar stock suficiente para retiros
    const actualQuantity = type === "RETIRO" ? -Math.abs(quantity) : quantity;
    if (type === "RETIRO" && ingredient.currentStock + actualQuantity < 0) {
      return { message: "Stock insuficiente para realizar el retiro" };
    }

    // Crear movimiento de stock
    await prisma.stockMovement.create({
      data: {
        organizationId,
        ingredientId,
        type,
        quantity: actualQuantity,
        unit,
        reason: reason || `Movimiento tipo ${type}`,
        notes,
        referenceType: "ADJUSTMENT",
      },
    });

    // Actualizar stock del ingrediente
    await prisma.ingredient.update({
      where: { id: ingredientId },
      data: {
        currentStock: {
          increment: actualQuantity,
        },
      },
    });

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return {
      success: true,
      message: "Movimiento de stock registrado correctamente",
    };
  } catch (error) {
    console.error("Error al crear movimiento de stock:", error);
    return { message: "Error al registrar el movimiento de stock" };
  }
}

export async function getStockMovements(ingredientId?: string) {
  let organizationId: string;
  try {
    const { activeOrganizationId } = await getServerSessionWithOrg();
    organizationId = activeOrganizationId;
  } catch {
    return [];
  }

  const where = {
    organizationId,
    ...(ingredientId && { ingredientId }),
  };

  return await prisma.stockMovement.findMany({
    where,
    include: {
      ingredient: {
        select: {
          id: true,
          name: true,
          unit: true,
        },
      },
    },
    orderBy: { movementDate: "desc" },
  });
}

export async function deleteStockMovement(id: string): Promise<ActionState> {
  let organizationId: string;
  try {
    const { activeOrganizationId } = await getServerSessionWithOrg();
    organizationId = activeOrganizationId;
  } catch {
    return { message: "Unauthorized" };
  }

  try {
    const movement = await prisma.stockMovement.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (movement && movement.referenceType === "ADJUSTMENT") {
      await prisma.ingredient.update({
        where: { id: movement.ingredientId },
        data: {
          currentStock: {
            decrement: movement.quantity,
          },
        },
      });
    }

    await prisma.stockMovement.deleteMany({
      where: {
        id,
        organizationId,
      },
    });

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return { success: true, message: "Movimiento de stock eliminado" };
  } catch (error) {
    console.error("Error al eliminar movimiento de stock:", error);
    return { message: "Error al eliminar el movimiento de stock" };
  }
}
