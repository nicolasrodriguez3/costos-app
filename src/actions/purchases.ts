"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { ActionState, PurchaseInput } from "@/types";

export async function createPurchase(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }
  const organizationId = activeOrganizationId;

  // Parse form data for PurchaseInput
  const purchaseDate = formData.get("purchaseDate") as string;
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const supplierName = formData.get("supplierName") as string | null;
  const notes = formData.get("notes") as string | null;

  // Get ingredients data (assuming JSON string or multiple form fields)
  const ingredientsJson = formData.get("ingredients") as string;
  let ingredients: PurchaseInput["ingredients"];
  try {
    ingredients = JSON.parse(ingredientsJson);
  } catch {
    return { message: "Datos de ingredientes inválidos" };
  }

  if (!ingredients || ingredients.length === 0) {
    return { message: "Debe incluir al menos un ingrediente" };
  }

  // Validate ingredients
  for (const ing of ingredients) {
    if (
      !ing.ingredientId ||
      !ing.quantity ||
      ing.quantity <= 0 ||
      !ing.unitCost ||
      ing.unitCost <= 0 ||
      !ing.unit
    ) {
      return { message: "Datos de ingrediente inválidos" };
    }
  }

  try {
    // Create Purchase
    const purchase = await prisma.purchase.create({
      data: {
        organizationId,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        invoiceNumber: invoiceNumber?.trim() || null,
        supplierName: supplierName?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    // Create IngredientPurchases
    for (const ing of ingredients) {
      const ingredientPurchase = await prisma.ingredientPurchase.create({
        data: {
          organizationId,
          purchaseId: purchase.id,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity,
          unit: ing.unit,
          unitCost: ing.unitCost,
        },
      });

      // Update stock
      await prisma.ingredient.update({
        where: { id: ing.ingredientId },
        data: {
          currentStock: {
            increment: ing.quantity,
          },
        },
      });

      // Create stock movement
      await prisma.stockMovement.create({
        data: {
          organizationId,
          ingredientId: ing.ingredientId,
          type: "COMPRA",
          quantity: ing.quantity,
          unit: ing.unit,
          reason: `Compra ${invoiceNumber ? `Fact: ${invoiceNumber}` : "sin factura"}`,
          referenceId: ingredientPurchase.id,
          referenceType: "PURCHASE",
          notes: `Proveedor: ${supplierName || "N/A"}`,
        },
      });
    }

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return {
      success: true,
      message: "Compra registrada correctamente",
      data: purchase,
    };
  } catch (error) {
    console.error("Failed to create purchase:", error);
    return { message: "Error al registrar la compra" };
  }
}

export async function getPurchases() {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return [];

  return await prisma.purchase.findMany({
    where: { organizationId: activeOrganizationId },
    include: {
      ingredientPurchases: {
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
      },
    },
    orderBy: { purchaseDate: "desc" },
  });
}

export async function updatePurchase(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  const purchaseId = formData.get("purchaseId") as string;
  const purchaseDate = formData.get("purchaseDate") as string;
  const invoiceNumber = formData.get("invoiceNumber") as string | null;
  const supplierName = formData.get("supplierName") as string | null;
  const notes = formData.get("notes") as string | null;

  const ingredientsJson = formData.get("ingredients") as string;
  let ingredients: PurchaseInput["ingredients"];
  try {
    ingredients = JSON.parse(ingredientsJson);
  } catch {
    return { message: "Datos de ingredientes inválidos" };
  }

  if (!purchaseId) {
    return { message: "ID de compra faltante" };
  }

  if (!ingredients || ingredients.length === 0) {
    return { message: "Debe incluir al menos un ingrediente" };
  }

  // Validate ingredients
  for (const ing of ingredients) {
    if (
      !ing.ingredientId ||
      !ing.quantity ||
      ing.quantity <= 0 ||
      !ing.unitCost ||
      ing.unitCost <= 0 ||
      !ing.unit
    ) {
      return { message: "Datos de ingrediente inválidos" };
    }
  }

  try {
    // Update Purchase
    await prisma.purchase.update({
      where: { id: purchaseId, organizationId: activeOrganizationId },
      data: {
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        invoiceNumber: invoiceNumber?.trim() || null,
        supplierName: supplierName?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    // Get existing IngredientPurchases
    const existingPurchases = await prisma.ingredientPurchase.findMany({
      where: { purchaseId, organizationId: activeOrganizationId },
    });

    const newIngredientIds = ingredients.map((ing) => ing.ingredientId);

    // Delete removed ingredients
    for (const existing of existingPurchases) {
      if (!newIngredientIds.includes(existing.ingredientId)) {
        // Revert stock
        await prisma.ingredient.update({
          where: { id: existing.ingredientId },
          data: { currentStock: { decrement: existing.quantity } },
        });
        // Delete movement
        await prisma.stockMovement.deleteMany({
          where: { referenceId: existing.id, referenceType: "PURCHASE" },
        });
        // Delete purchase
        await prisma.ingredientPurchase.delete({ where: { id: existing.id } });
      }
    }

    // Update or create ingredients
    for (const ing of ingredients) {
      const existing = existingPurchases.find(
        (p) => p.ingredientId === ing.ingredientId,
      );
      if (existing) {
        const quantityDiff = ing.quantity - existing.quantity;
        await prisma.ingredientPurchase.update({
          where: { id: existing.id },
          data: {
            quantity: ing.quantity,
            unit: ing.unit,
            unitCost: ing.unitCost,
          },
        });
        if (Math.abs(quantityDiff) > 0.001) {
          await prisma.ingredient.update({
            where: { id: ing.ingredientId },
            data: { currentStock: { increment: quantityDiff } },
          });
          await prisma.stockMovement.updateMany({
            where: { referenceId: existing.id, referenceType: "PURCHASE" },
            data: {
              quantity: ing.quantity,
              unit: ing.unit,
              reason: `Compra (editada) ${invoiceNumber ? `Fact: ${invoiceNumber}` : "sin factura"}`,
              notes: `Proveedor: ${supplierName || "N/A"}`,
            },
          });
        }
      } else {
        const newPurchase = await prisma.ingredientPurchase.create({
          data: {
            organizationId: activeOrganizationId,
            purchaseId,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit,
            unitCost: ing.unitCost,
          },
        });
        await prisma.ingredient.update({
          where: { id: ing.ingredientId },
          data: { currentStock: { increment: ing.quantity } },
        });
        await prisma.stockMovement.create({
          data: {
            organizationId: activeOrganizationId,
            ingredientId: ing.ingredientId,
            type: "COMPRA",
            quantity: ing.quantity,
            unit: ing.unit,
            reason: `Compra ${invoiceNumber ? `Fact: ${invoiceNumber}` : "sin factura"}`,
            referenceId: newPurchase.id,
            referenceType: "PURCHASE",
            notes: `Proveedor: ${supplierName || "N/A"}`,
          },
        });
      }
    }

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
    return {
      success: true,
      message: "Compra actualizada correctamente",
    };
  } catch (error) {
    console.error("Failed to update purchase:", error);
    return { message: "Error al actualizar la compra" };
  }
}

export async function deletePurchase(purchaseId: string) {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return;

  try {
    const ingredientPurchases = await prisma.ingredientPurchase.findMany({
      where: {
        purchaseId,
        organizationId: activeOrganizationId,
      },
    });

    for (const ip of ingredientPurchases) {
      // Revert stock
      await prisma.ingredient.update({
        where: { id: ip.ingredientId },
        data: {
          currentStock: {
            decrement: ip.quantity,
          },
        },
      });

      // Delete stock movements
      await prisma.stockMovement.deleteMany({
        where: {
          referenceId: ip.id,
          referenceType: "PURCHASE",
        },
      });
    }

    // Delete IngredientPurchases
    await prisma.ingredientPurchase.deleteMany({
      where: {
        purchaseId,
        organizationId: activeOrganizationId,
      },
    });

    // Delete Purchase
    await prisma.purchase.delete({
      where: {
        id: purchaseId,
        organizationId: activeOrganizationId,
      },
    });

    revalidatePath("/ingredients");
    revalidatePath("/purchases");
  } catch (error) {
    console.error("Failed to delete purchase:", error);
  }
}

export async function createStockMovement({
  ingredientId,
  quantity,
  unit,
  unitCost,
}: {
  ingredientId: string;
  quantity: number;
  unit: string;
  unitCost: number;
}) {
  const { activeOrganizationId: organizationId } =
    await getServerSessionWithOrg();

  try {
    await prisma.purchase.create({
      data: {
        organizationId,
        ingredientPurchases: {
          create: {
            ingredientId,
            organizationId,
            quantity,
            unit,
            unitCost,
          },
        },
      },
    });

    // Create stock movement
    await prisma.stockMovement.create({
      data: {
        organizationId,
        ingredientId,
        type: "AJUSTE",
        quantity,
        unit,
        reason: `Stock inicial`,
        referenceType: "ADJUSTMENT",
      },
    });
  } catch (error) {
    console.error("Failed to create stock movement:", error);
  }
}
