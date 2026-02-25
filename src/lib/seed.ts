"use server";

import { ProductType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const INITIAL_INGREDIENTS = [
  { name: "Harina 000", unit: "kg", category: "Secos/Almacén", initialCost: 1000, initialStock: 25 },
  { name: "Sal", unit: "kg", category: "Condimentos y Salsas", initialCost: 1500, initialStock: 2 },
  { name: "Levadura", unit: "kg", category: "Secos/Almacén", initialCost: 5000, initialStock: 1 },
  { name: "Aceite de oliva", unit: "l", category: "Condimentos y Salsas", initialCost: 10000, initialStock: 1 },
  { name: "Salsa de tomate", unit: "kg", category: "Condimentos y Salsas", initialCost: 2500, initialStock: 1 },
  { name: "Queso mozzarella", unit: "kg", category: "Lácteos", initialCost: 8000, initialStock: 10 },
  { name: "Queso rallado", unit: "kg", category: "Lácteos", initialCost: 10000, initialStock: 5 },
  { name: "Albahaca fresca", unit: "kg", category: "Frutas y Verduras", initialCost: 10000, initialStock: 1 },
];

const INITIAL_PRODUCTS = [
  {
    name: "Pizza Muzzarella",
    type: ProductType.ELABORADO,
    category: "Pizzas",
    basePrice: 12000,
    recipe: [
      { ingredientName: "Harina 000", quantity: 250, unit: "g" },
      { ingredientName: "Sal", quantity: 5, unit: "g" },
      { ingredientName: "Levadura", quantity: 3, unit: "g" },
      { ingredientName: "Aceite de oliva", quantity: 10, unit: "ml" },
      { ingredientName: "Salsa de tomate", quantity: 80, unit: "g" },
      { ingredientName: "Queso mozzarella", quantity: 150, unit: "g" },
    ],
  },
  {
    name: "Gaseosa Cola 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 2000,
    manualCost: 1000,
  },
  {
    name: "Gaseosa Naranja 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 2000,
    manualCost: 1000,
  },
  {
    name: "Agua sin gas 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 1500,
    manualCost: 800,
  },
  {
    name: "Cerveza lata 330ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 3000,
    manualCost: 1000,
  },
];

export async function seedInitialData(
  organizationId: string,
  userId: string,
): Promise<void> {
  const slug = "pizza-muzzarella";

  const ingredientIds: Record<string, string> = {};

  await prisma.$transaction(async (tx) => {
    for (const ing of INITIAL_INGREDIENTS) {
      const ingredient = await tx.ingredient.create({
        data: {
          name: ing.name,
          unit: ing.unit,
          category: ing.category,
          currentStock: ing.initialStock ?? 0,
          isActive: true,
          userId,
          organizationId,
        },
      });
      ingredientIds[ing.name] = ingredient.id;
    }

    const purchase = await tx.purchase.create({
      data: {
        organizationId,
        purchaseDate: new Date(),
        notes: "Datos iniciales",
      },
    });

    for (const ing of INITIAL_INGREDIENTS) {
      if (!ing.initialStock || ing.initialStock === 0) continue;
      await tx.ingredientPurchase.create({
        data: {
          organizationId,
          purchaseId: purchase.id,
          ingredientId: ingredientIds[ing.name],
          quantity: ing.initialStock,
          unit: ing.unit,
          unitCost: ing.initialCost,
        },
    });
    }

    const pizzaData = INITIAL_PRODUCTS.find(
      (p) => p.name === "Pizza Muzzarella",
    );
    if (pizzaData && pizzaData.recipe) {
      const pizza = await tx.product.create({
        data: {
          name: pizzaData.name,
          slug,
          type: pizzaData.type,
          category: pizzaData.category,
          basePrice: pizzaData.basePrice,
          userId,
          organizationId,
        },
      });

      await tx.recipeItem.createMany({
        data: pizzaData.recipe.map((item) => ({
          productId: pizza.id,
          ingredientId: ingredientIds[item.ingredientName],
          quantity: item.quantity,
          unit: item.unit,
        })),
      });
    }

    const resaleProducts = INITIAL_PRODUCTS.filter(
      (p) => p.type === ProductType.REVENTA,
    );
    for (const product of resaleProducts) {
      const productSlug = product.name.toLowerCase().replace(/\s+/g, "-");
      await tx.product.create({
        data: {
          name: product.name,
          slug: productSlug,
          type: product.type,
          category: product.category,
          basePrice: product.basePrice,
          manualCost: product.manualCost ?? 0,
          userId,
          organizationId,
        },
      });
    }
  });
}
