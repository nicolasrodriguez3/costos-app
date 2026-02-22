import type { ReferenceType, StockMovementType } from "@/generated/prisma/client";
import type { Ingredient } from "./ingredient";

export type StockMovement = {
  id: string;
  organizationId: string;
  ingredientId: string;
  ingredient?: Ingredient | null;
  type: StockMovementType;
  quantity: number;
  unit: string;
  reason?: string | null;
  referenceId?: string | null;
  referenceType?: ReferenceType | null;
  movementDate: Date;
  notes?: string | null;
  createdAt: Date;
};

export type { StockMovementType };
