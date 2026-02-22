"use server";

import { ProductType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const INITIAL_INGREDIENTS = [
  { name: "Harina 000", unit: "kg", category: "Secos/Almacén" },
  { name: "Agua", unit: "litros", category: "Básicos" },
  { name: "Sal", unit: "kg", category: "Condimentos y Salsas" },
  { name: "Levadura", unit: "kg", category: "Secos/Almacén" },
  { name: "Aceite de oliva", unit: "litros", category: "Condimentos y Salsas" },
  { name: "Salsa de tomate", unit: "kg", category: "Condimentos y Salsas" },
  { name: "Queso mozzarella", unit: "kg", category: "Lácteos" },
  { name: "Queso rallado", unit: "kg", category: "Lácteos" },
  { name: "Albahaca fresca", unit: "kg", category: "Frutas y Verduras" },
];

const INITIAL_PRODUCTS = [
  {
    name: "Pizza Margherita",
    type: ProductType.ELABORADO,
    category: "Pizzas",
    basePrice: 1200,
    recipe: [
      { ingredientName: "Harina 000", quantity: 0.25, unit: "kg" },
      { ingredientName: "Agua", quantity: 0.15, unit: "litros" },
      { ingredientName: "Sal", quantity: 0.005, unit: "kg" },
      { ingredientName: "Levadura", quantity: 0.003, unit: "kg" },
      { ingredientName: "Aceite de oliva", quantity: 0.01, unit: "litros" },
      { ingredientName: "Salsa de tomate", quantity: 0.08, unit: "kg" },
      { ingredientName: "Queso mozzarella", quantity: 0.15, unit: "kg" },
      { ingredientName: "Queso rallado", quantity: 0.03, unit: "kg" },
      { ingredientName: "Albahaca fresca", quantity: 0.005, unit: "kg" },
    ],
  },
  {
    name: "Gaseosa Cola 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 250,
    manualCost: 150,
  },
  {
    name: "Gaseosa Naranja 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 250,
    manualCost: 150,
  },
  {
    name: "Agua sin gas 500ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 150,
    manualCost: 80,
  },
  {
    name: "Cerveza lata 330ml",
    type: ProductType.REVENTA,
    category: "Bebidas",
    basePrice: 400,
    manualCost: 250,
  },
];

export async function seedInitialData(
  organizationId: string,
  userId: string,
): Promise<void> {
  const slug = "pizza-margherita";

  const ingredientIds: Record<string, string> = {};

  await prisma.$transaction(async (tx) => {
    for (const ing of INITIAL_INGREDIENTS) {
      const ingredient = await tx.ingredient.create({
        data: {
          name: ing.name,
          unit: ing.unit,
          category: ing.category,
          currentStock: 0,
          isActive: true,
          userId,
          organizationId,
        },
      });
      ingredientIds[ing.name] = ingredient.id;
    }

    const pizzaData = INITIAL_PRODUCTS.find(
      (p) => p.name === "Pizza Margherita",
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
          manualCost: product.manualCost ?? null,
          userId,
          organizationId,
        },
      });
    }
  });
}
