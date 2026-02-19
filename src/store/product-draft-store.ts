import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DraftRecipeItem = {
  ingredientId?: string | null;
  subProductId?: string | null;
  quantity: number;
  unit: string;
};

export type ProductDraft = {
  organizationId: string;
  name: string;
  type: string;
  category: string;
  subCategory?: string;
  basePrice?: number | null;
  manualCost?: number;
  recipeItems?: DraftRecipeItem[];
};

const EMPTY_DRAFT: ProductDraft = {
  organizationId: "",
  name: "",
  type: "ELABORADO",
  category: "",
  subCategory: "",
  basePrice: null,
  manualCost: undefined,
  recipeItems: [],
};

type ProductDraftState = {
  draft: ProductDraft;
  hasDraft: boolean;
  saveDraft: (values: ProductDraft) => void;
  clearDraft: () => void;
};

export const useProductDraftStore = create<ProductDraftState>()(
  persist(
    (set) => ({
      draft: EMPTY_DRAFT,
      hasDraft: false,
      saveDraft: (values) => set({ draft: values, hasDraft: true }),
      clearDraft: () => set({ draft: EMPTY_DRAFT, hasDraft: false }),
    }),
    {
      name: "product-form-draft",
    },
  ),
);
