"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ProductType } from "@/generated/prisma/client";
import { calculateProductCost } from "@/lib/costs";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";
import type { ActionState, ProductFormData, RecipeItemInput } from "@/types";

export async function getProducts() {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return [];

  const products = await prisma.product.findMany({
    where: { organizationId: activeOrganizationId },
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
    orderBy: { name: "asc" },
  });

  // Calculate costs for all products
  // We use Promise.all to fetch costs in parallel
  const productsWithCost = await Promise.all(
    products.map(async (product) => {
      const cost = await calculateProductCost(product.id);
      return { ...product, cost };
    }),
  );

  return productsWithCost;
}

export async function getProductBySlug(slug: string) {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return null;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      organizationId: activeOrganizationId,
      isActive: true,
    },
    include: {
      receipeItems: {
        include: {
          ingredient: {
            include: {
              purchases: {
                where: { organizationId: activeOrganizationId },
                orderBy: { purchase: { purchaseDate: "desc" } },
                take: 1,
              },
            },
          },
          subProduct: {
            include: {
              receipeItems: {
                include: {
                  ingredient: {
                    include: {
                      purchases: {
                        where: { organizationId: activeOrganizationId },
                        orderBy: { purchase: { purchaseDate: "desc" } },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!product) return null;

  // Flatten ingredient.purchases[0].unitCost to ingredient.cost for simplicity in the UI
  const productWithCosts = {
    ...product,
    receipeItems: product.receipeItems.map((item) => {
      if (item.ingredient) {
        return {
          ...item,
          ingredient: {
            ...item.ingredient,
            cost: item.ingredient.purchases[0]?.unitCost || 0,
          },
        };
      }
      if (item.subProduct) {
        return {
          ...item,
          subProduct: {
            ...item.subProduct,
            receipeItems: item.subProduct.receipeItems.map((subItem) => {
              if (subItem.ingredient) {
                return {
                  ...subItem,
                  ingredient: {
                    ...subItem.ingredient,
                    cost: subItem.ingredient.purchases[0]?.unitCost || 0,
                  },
                };
              }
              return subItem;
            }),
          },
        };
      }
      return item;
    }),
  };

  return productWithCosts;
}

export async function createProduct(
  data: ProductFormData,
): Promise<ActionState> {
  const { activeOrganizationId, session } = await getServerSessionWithOrg();
  if (!activeOrganizationId || !session.userId) {
    return { message: "Unauthorized" };
  }

  const {
    name,
    type,
    category,
    subCategory,
    basePrice,
    manualCost,
    recipeItems = [],
  } = data;

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (basePrice < 0) {
    return { message: "El precio no puede ser negativo" };
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Check for duplicates
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId: activeOrganizationId,
    },
  });

  if (existing) {
    return { message: "Ya existe un producto con este nombre" };
  }

  await prisma.product.create({
    data: {
      name: name.trim(),
      slug,
      type: type as ProductType,
      category: category ? category.trim() : null,
      subCategory: subCategory ? subCategory.trim() : null,
      basePrice,
      manualCost: type !== "ELABORADO" ? (manualCost ?? null) : null,
      userId: session.userId,
      organizationId: activeOrganizationId,
      receipeItems:
        type === "ELABORADO"
          ? {
              create: recipeItems.map((item: RecipeItemInput) => ({
                ingredientId: item.ingredientId || null,
                subProductId: item.subProductId || null,
                quantity: item.quantity,
                unit: item.unit,
              })),
            }
          : undefined,
    },
  });

  revalidatePath("/products");
  return { success: true, message: "Producto creado correctamente" };
}

export async function updateProduct(
  data: ProductFormData,
): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  const {
    id,
    name,
    type,
    category,
    subCategory,
    basePrice,
    manualCost,
    recipeItems = [],
  } = data;

  if (!id) {
    return { message: "El ID del producto es requerido" };
  }

  if (!name || name.trim() === "") {
    return { message: "El nombre es requerido" };
  }

  if (basePrice < 0) {
    return { message: "El precio no puede ser negativo" };
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  // Check for duplicates (excluding current product)
  const existing = await prisma.product.findFirst({
    where: {
      name: { equals: name.trim() },
      organizationId: activeOrganizationId,
      NOT: {
        id: id,
      },
    },
  });

  if (existing) {
    return { message: "Ya existe otro producto con este nombre" };
  }

  try {
    // Transaction to update product and replace recipe items
    await prisma.$transaction(async (tx) => {
      // 1. Update basic product info
      await tx.product.update({
        where: {
          id,
          organizationId: activeOrganizationId,
        },
        data: {
          name: name.trim(),
          slug,
          type: type as ProductType,
          category: category ? category.trim() : null,
          subCategory: subCategory ? subCategory.trim() : null,
          basePrice,
          manualCost: type !== "ELABORADO" ? (manualCost ?? null) : null,
        },
      });

      // 2. Handle Recipe Items (Delete all and recreate)
      await tx.recipeItem.deleteMany({
        where: {
          productId: id,
        },
      });

      // Then create new ones if type is ELABORADO
      if (type === "ELABORADO" && recipeItems.length > 0) {
        await tx.recipeItem.createMany({
          data: recipeItems.map((item: RecipeItemInput) => ({
            productId: id,
            ingredientId: item.ingredientId || null,
            subProductId: item.subProductId || null,
            quantity: item.quantity,
            unit: item.unit,
          })),
        });
      }
    });

    revalidatePath("/products");
    revalidatePath(`/products/${slug}`);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return { message: "Error al actualizar el producto" };
  }

  redirect(`/products/${slug}`);
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) {
    return { message: "Unauthorized" };
  }

  try {
    await prisma.product.updateMany({
      where: {
        id,
        organizationId: activeOrganizationId,
      },
      data: {
        isActive: false,
      },
    });
    revalidatePath("/products");
    return { success: true, message: "Producto eliminado correctamente" };
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return { message: "Error al eliminar el producto" };
  }
}

export async function getActiveProducts() {
  const { activeOrganizationId } = await getServerSessionWithOrg();
  if (!activeOrganizationId) return [];

  const products = await prisma.product.findMany({
    where: {
      organizationId: activeOrganizationId,
      isActive: true,
      basePrice: {
        gt: 0,
      },
    },
    orderBy: { name: "asc" },
  });

  return products;
}
