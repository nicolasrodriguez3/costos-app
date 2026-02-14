"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import { ActionState } from "@/types";

export async function getFixedCosts() {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  return await prisma.fixedCost.findMany({
    where: {
      organizationId: activeOrganizationId,
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function createFixedCost(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;

  if (!name || isNaN(amount)) {
    return { success: false, message: "Nombre y monto son obligatorios" };
  }

  try {
    await prisma.fixedCost.create({
      data: {
        name,
        amount,
        category,
        description,
        organizationId: activeOrganizationId,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/sales/history");
    return { success: true, message: "Gasto fijo creado con éxito" };
  } catch (error) {
    console.error("Error creating fixed cost:", error);
    return { success: false, message: "Error al crear el gasto fijo" };
  }
}

export async function updateFixedCost(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const isActive = formData.get("isActive") === "true";

  if (!id || !name || isNaN(amount)) {
    return { success: false, message: "ID, nombre y monto son obligatorios" };
  }

  try {
    await prisma.fixedCost.update({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
      data: {
        name,
        amount,
        category,
        description,
        isActive,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/sales/history");
    return { success: true, message: "Gasto fijo actualizado con éxito" };
  } catch (error) {
    console.error("Error updating fixed cost:", error);
    return { success: false, message: "Error al actualizar el gasto fijo" };
  }
}

export async function deleteFixedCost(id: string) {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  await prisma.fixedCost.delete({
    where: {
      id,
      organizationId: activeOrganizationId,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/sales/history");
}

export async function getTotalMonthlyFixedCosts() {
  const { activeOrganizationId } = await getServerSessionWithOrg();

  const costs = await prisma.fixedCost.findMany({
    where: {
      organizationId: activeOrganizationId,
      isActive: true,
    },
    select: {
      amount: true,
    },
  });

  return costs.reduce(
    (sum: number, cost: { amount: number }) => sum + cost.amount,
    0,
  );
}
