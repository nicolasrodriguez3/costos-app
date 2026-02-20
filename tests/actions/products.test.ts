import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createProduct,
  deleteProduct,
  type ProductFormData,
  updateProduct,
} from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { getServerSessionWithOrg } from "@/lib/serverSession";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    recipeItem: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock("@/lib/serverSession", () => ({
  getServerSessionWithOrg: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => "redirected"),
}));

describe("createProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create product successfully", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: "product-1",
      name: "Pizza Margarita",
      slug: "pizza-margarita",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
      isActive: true,
      organizationId: "org-123",
      userId: "user-123",
    } as any);

    const input: ProductFormData = {
      name: "Pizza Margarita",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
      recipeItems: [],
    };

    const result = await createProduct(input);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Producto creado correctamente");
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: "Pizza Margarita",
        slug: "pizza-margarita",
        type: "ELABORADO",
        category: "Pizzas",
        subCategory: null,
        basePrice: 1500,
        manualCost: null,
        userId: "user-123",
        organizationId: "org-123",
        receipeItems: { create: [] },
      },
    });
  });

  it("should return error if name is empty", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: ProductFormData = {
      name: "   ",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
    };

    const result = await createProduct(input);

    expect(result.message).toBe("El nombre es requerido");
    expect(prisma.product.create).not.toHaveBeenCalled();
  });

  it("should return error if price is negative", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: ProductFormData = {
      name: "Pizza Margarita",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: -100,
    };

    const result = await createProduct(input);

    expect(result.message).toBe("El precio no puede ser negativo");
  });

  it("should return error if product with same name exists", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.product.findFirst).mockResolvedValue({
      id: "existing-product",
      name: "Pizza Margarita",
    } as any);

    const input: ProductFormData = {
      name: "Pizza Margarita",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
    };

    const result = await createProduct(input);

    expect(result.message).toBe("Ya existe un producto con este nombre");
  });

  it("should create simple product without recipe", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.product.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.product.create).mockResolvedValue({
      id: "product-1",
      name: "Coca Cola",
      slug: "coca-cola",
      type: "SIMPLE",
      basePrice: 500,
      manualCost: 200,
      isActive: true,
      organizationId: "org-123",
      userId: "user-123",
    } as any);

    const input: ProductFormData = {
      name: "Coca Cola",
      type: "SIMPLE",
      category: "Bebidas",
      basePrice: 500,
      manualCost: 200,
    };

    const result = await createProduct(input);

    expect(result.message).toBe("Producto creado correctamente");
    expect(prisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Coca Cola",
          type: "SIMPLE",
          manualCost: 200,
          receipeItems: undefined,
        }),
      }),
    );
  });
});

describe("updateProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error if id is missing", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: ProductFormData = {
      name: "Pizza",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
    };

    const result = await updateProduct(input);

    expect(result.message).toBe("El ID del producto es requerido");
  });

  it("should return error if name is empty", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: ProductFormData = {
      id: "product-1",
      name: "   ",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
    };

    const result = await updateProduct(input);

    expect(result.message).toBe("El nombre es requerido");
  });

  it("should return error if price is negative", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    const input: ProductFormData = {
      id: "product-1",
      name: "Pizza Margarita",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: -100,
    };

    const result = await updateProduct(input);

    expect(result.message).toBe("El precio no puede ser negativo");
  });

  it("should return error if duplicate product name exists", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.product.findFirst).mockResolvedValue({
      id: "other-product",
      name: "Otra Pizza",
    } as any);

    const input: ProductFormData = {
      id: "product-1",
      name: "Otra Pizza",
      type: "ELABORADO",
      category: "Pizzas",
      basePrice: 1500,
    };

    const result = await updateProduct(input);

    expect(result.message).toBe("Ya existe otro producto con este nombre");
  });
});

describe("deleteProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete product successfully", async () => {
    vi.mocked(getServerSessionWithOrg).mockResolvedValue({
      session: { userId: "user-123" },
      user: { id: "user-123" },
      activeOrganizationId: "org-123",
    } as any);

    vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 } as any);

    await deleteProduct("product-1");

    expect(prisma.product.updateMany).toHaveBeenCalledWith({
      where: {
        id: "product-1",
        organizationId: "org-123",
      },
      data: {
        isActive: false,
      },
    });
  });
});
