import { beforeEach, describe, expect, it, vi } from "vitest";

import { createIngredient, type IngredientInput } from "@/actions/ingredients";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ingredient: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/serverSession", () => ({
  getServerSessionWithOrg: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("createIngredient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create ingredient successfully", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123", email: "test@test.com" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.ingredient.create).mockResolvedValue({
      id: "ingredient-1",
      name: "Tomate",
      unit: "kg",
      currentStock: 10,
      minStock: 5,
      isActive: true,
      organizationId: "org-123",
      userId: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const input: IngredientInput = {
      name: "Tomate",
      unit: "kg",
      initialStock: 10,
      minStock: 5,
      category: "Verduras",
    };

    const result = await createIngredient(input);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Ingrediente creado correctamente");
    expect(prisma.ingredient.create).toHaveBeenCalledWith({
      data: {
        name: "Tomate",
        unit: "kg",
        category: "Verduras",
        currentStock: 10,
        minStock: 5,
        description: null,
        isActive: true,
        userId: "user-123",
        organizationId: "org-123",
      },
    });
  });

  it("should return error if name is empty", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: IngredientInput = {
      name: "   ",
      unit: "kg",
    };

    const result = await createIngredient(input);

    expect(result.message).toBe("El nombre es requerido");
    expect(prisma.ingredient.create).not.toHaveBeenCalled();
  });

  it("should return error if minStock is negative", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: IngredientInput = {
      name: "Tomate",
      unit: "kg",
      minStock: -5,
    };

    const result = await createIngredient(input);

    expect(result.message).toBe("El stock mínimo no puede ser negativo");
  });

  it("should return error if ingredient with same name exists", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.ingredient.findFirst).mockResolvedValue({
      id: "existing-ingredient",
      name: "Tomate",
    } as any);

    const input: IngredientInput = {
      name: "Tomate",
      unit: "kg",
    };

    const result = await createIngredient(input);

    expect(result.message).toBe("Ya existe un ingrediente con este nombre");
  });
});
