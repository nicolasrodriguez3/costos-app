export type FixedCost = {
  id: string;
  organizationId: string;
  name: string;
  amount: number;
  category?: string | null;
  isActive: boolean;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};
