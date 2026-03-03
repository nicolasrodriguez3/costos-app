"use client";

import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { deleteProduct } from "@/actions/products";
import { TableCell, TableRow } from "@/components/ui/table";
import type { RecipeItem } from "@/types/entities/product";
import { DeleteModal } from "./modals/DeleteModal";
import { Button } from "./ui/button";

interface Props {
  product: {
    id: string;
    name: string;
    slug: string;
    type: string;
    basePrice: number;
    cost: number;
    receipeItems?: RecipeItem[];
  };
}

export const ProductTableRow = ({ product }: Props) => {
  const { id, name, slug, type, basePrice, cost, receipeItems } = product;

  const margin = basePrice - cost;
  const marginPercent = basePrice > 0 ? (margin / basePrice) * 100 : 0;

  return (
    <TableRow className="hover:bg-gray-50 border-b border-gray-100 text-gray-600 [&_td]:align-top">
      <TableCell className="font-medium text-gray-700">
        <Link href={`/products/${slug}`} className="hover:underline">
          {name}
        </Link>
        {receipeItems && receipeItems.length > 0 && (
          <span className="ml-2 text-xs text-gray-50 bg-gray-800 px-1 py-0.5 rounded whitespace-nowrap">
            {receipeItems.length} ingr.
          </span>
        )}
      </TableCell>
      <TableCell>{type}</TableCell>
      <TableCell className="text-right font-mono">
        ${basePrice.toFixed(2)}
      </TableCell>
      <TableCell className="text-right font-mono">${cost.toFixed(2)}</TableCell>
      <TableCell className="text-right font-mono">
        <div className={margin > 0 ? "text-green-400" : "text-red-500"}>
          ${margin.toFixed(2)}
        </div>
        <div className="text-sm">{marginPercent.toFixed(0)}%</div>
      </TableCell>
      <TableCell className="text-right">
        <Button asChild variant="ghost" size="icon">
          <Link
            href={`/products/${slug}/edit`}
            aria-label="Editar"
          >
            <PencilIcon size={16} />
          </Link>
        </Button>
        <DeleteModal
          id={id}
          name={name}
          type="producto"
          action={deleteProduct}
        />
      </TableCell>
    </TableRow>
  );
};
